if (
  typeof window === 'undefined' && (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_WHATSAPP_FROM
  )
) {
  console.warn('Twilio environment variables are missing. WhatsApp features will be disabled.');
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../prisma';
import { getSchemeRecommendations } from '../recommendationEngine';
import { matchInvestorsWithHyDE } from '../hydeMatching';
import { sendWhatsAppMessage } from '../twilio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const truncate = (str, len = 2000) => {
  if (typeof str !== 'string' || str.length <= len) return str;
  return str.slice(0, len) + '... (truncated for brevity)';
};

// 1. Define available tools for the agent
const tools = {
  get_startup_profile: async (args, context) => {
    // Safety: Ignore LLM-provided userId and use authenticated context
    const profile = await prisma.startupProfile.findUnique({
      where: { userId: Number(context.userId) },
    });
    return JSON.stringify(
      profile || { error: 'No profile found. User needs to complete onboarding.' }
    );
  },
  search_funding_schemes: async ({ industry, stage, state }) => {
    const results = await getSchemeRecommendations({ startup: { industry, stage, state } });
    return JSON.stringify(results.topMatches);
  },
  match_investors: async profile => {
    const matches = await matchInvestorsWithHyDE(profile);
    return JSON.stringify(matches);
  },
  send_whatsapp: async ({ to, template_key, placeholders, reason }) => {
    try {
      const result = await sendWhatsAppMessage({
        to,
        templateKey: template_key,
        placeholders,
        reason,
      });
      return JSON.stringify({ success: true, sid: result.sid });
    } catch (err) {
      // Return error to LLM so it can explain to user (e.g. need consent)
      return JSON.stringify({
        success: false,
        error: err.message,
        action_required: err.message.includes('Consent missing')
          ? 'Ask user to reply START'
          : 'Check number',
      });
    }
  },
};

// 2. The ReAct System Prompt
const SYSTEM_PROMPT = `
You are the Documotion AI Concierge, a world-class assistant for Indian startups.
Your goal is to help founders find funding, investors, and navigate the startup ecosystem.

You have access to the following tools:
- get_startup_profile(): Fetches your startup details. No input required.
- search_funding_schemes(industry: string, stage: string, state: string): Finds relevant Govt/Bank schemes.
- match_investors(profile: object): Uses HyDE to find matching investors.
- send_whatsapp(to: string, message: string): Sends a WhatsApp update to a founder.
- send_whatsapp(to: string, template_key: string, placeholders: object, reason: string): Sends a templated WhatsApp update. 
Available templates: [funding_match, investor_match, general_update].

Use the following format:
Thought: You should always think about what to do.
Action: The action to take, should be one of [get_startup_profile, search_funding_schemes, match_investors].
Action Input: The input to the action (in JSON format).
Observation: The result of the action.
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer.
Final Answer: The final response to the user.

Keep the "Final Answer" professional, encouraging, and specific to the Indian context.
`;

/**
 * Parse Action and Action Input from LLM response
 * Resilient to Markdown code blocks, trailing commentary, and multi-line JSON.
 */
function parseActionResponse(responseText) {
  // Match Action: name
  const actionMatch = responseText.match(/Action:\s*(\w+)/);

  // Robust regex for Action Input - captures everything until next keyword or end of string
  const actionInputMatch = responseText.match(/Action Input:\s*([\s\S]*?)(?=\nThought:|\nObservation:|$)/i);

  if (!actionMatch) {
    return { actionName: null, actionInput: null };
  }

  const actionName = actionMatch[1];
  let actionInput = {};
  const rawInput = actionInputMatch ? actionInputMatch[1].trim() : '';

  if (rawInput) {
    try {
      // Strip markdown code blocks if present (handles optional "json" tag and whitespace)
      const cleaned = rawInput.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      actionInput = JSON.parse(cleaned);
    } catch (e) {
      console.warn(`[Agent] Action Input JSON parse failed: ${e.message}`);
      // Fallback: treat as raw string/object for simple tools
      actionInput = { raw: rawInput };
    }
  }

  return { actionName, actionInput };
}

export async function runAgent(userId, userInput, chatHistory = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let currentPrompt = `${SYSTEM_PROMPT}\n\nChat History:\n${chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nUser: ${userInput}\n`;
  let iterations = 0;
  const maxIterations = 5;
  const seenOutputs = new Set();

  while (iterations < maxIterations) {
    iterations++;

    let responseText;
    try {
      const result = await model.generateContent(currentPrompt);
      responseText = result.response.text();
    } catch (error) {
      console.error('[Agent] Gemini API Error:', error);
      if (error.message?.toLowerCase().includes('quota') || error.status === 429) {
        return {
          answer: "I'm sorry, but I've reached my service limit for the moment. Please try again in a few minutes.",
          history: [
            ...chatHistory,
            { role: 'user', content: userInput },
            { role: 'assistant', content: "Service limit reached (Quota Exceeded)." },
          ],
        };
      }
      throw error;
    }

    // Loop Detection: If the model repeats the exact same thought/action twice
    if (seenOutputs.has(responseText)) {
      const loopAnswer =
        "I'm currently stuck in a repetitive loop while investigating this. Based on my previous steps, here is what I found so far...";
      return {
        answer: loopAnswer,
        history: [
          ...chatHistory,
          { role: 'user', content: userInput },
          { role: 'assistant', content: loopAnswer },
        ],
      };
    }
    seenOutputs.add(responseText);

    console.log(`[Iteration ${iterations}] Agent Output:\n${responseText}`);

    // Check for Final Answer
    if (responseText.includes('Final Answer:')) {
      const finalAnswer = responseText.split('Final Answer:')[1].trim();
      return {
        answer: finalAnswer,
        history: [
          ...chatHistory,
          { role: 'user', content: userInput },
          { role: 'assistant', content: finalAnswer },
        ],
      };
    }

    const { actionName, actionInput } = parseActionResponse(responseText);

    if (actionName) {
      // Execute Tool
      let observation;
      if (tools[actionName]) {
        try {
          console.log(`[Agent] Executing ${actionName} with input:`, actionInput);
          observation = await tools[actionName](actionInput, { userId });
        } catch (err) {
          observation = `Error executing tool: ${err.message}`;
        }
      } else {
        observation = `Tool "${actionName}" not found.`;
      }

      // Append observation and continue loop
      currentPrompt += `\n${responseText}\nObservation: ${truncate(observation, 2000)}\n`;
    } else {
      // If the LLM didn't follow the format, try to force a conclusion
      const fallbackAnswer = responseText.trim();
      return {
        answer: fallbackAnswer,
        history: [
          ...chatHistory,
          { role: 'user', content: userInput },
          { role: 'assistant', content: fallbackAnswer },
        ],
      };
    }
  }

  return {
    answer: "I'm sorry, I'm having trouble processing that request right now.",
    history: chatHistory,
  };
}

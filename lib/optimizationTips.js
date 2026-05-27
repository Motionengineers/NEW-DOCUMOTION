import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates actionable optimization tips using Gemini AI.
 */
export async function generateOptimizationTips(startup, readinessScore, risks) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    Act as a professional Indian Startup Consultant. Given a startup's readiness score components, suggest 3 actionable steps to improve their standing for investors or government schemes.
    Prioritize addressing HIGH severity risks and improving the lowest readiness components.
    Startup: ${startup.name}
    Score Components: ${JSON.stringify(readinessScore.components)}
    Identified Risks: ${JSON.stringify(risks.slice(0, 3))}
    
    Return ONLY valid JSON in the following format:
    {
      "tips": [
        {
          "title": "Short actionable title",
          "description": "Specific advice with steps",
          "priority": "HIGH|MEDIUM|LOW",
          "expectedImprovement": "+X points"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI tip generation failed:', error);
    return getDefaultTips(readinessScore);
  }
}
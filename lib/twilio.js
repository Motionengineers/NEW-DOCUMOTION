import twilio from 'twilio';
import fs from 'fs';
import path from 'path';
import { hasWhatsAppConsent, updateLastSentTimestamp } from './consent';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Load templates from JSON store to avoid hardcoding content in LLM logic
const templatesPath = path.join(process.cwd(), 'data', 'whatsapp_templates.json');
let templateData = { templates: {}, allowed_placeholders: [] };

try {
  if (fs.existsSync(templatesPath)) {
    templateData = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  }
} catch (error) {
  console.error('Failed to load WhatsApp templates:', error);
}

/**
 * Renders a template with provided placeholders and validates against whitelist.
 */
function renderTemplate(templateKey, placeholders = {}) {
  const template = templateData.templates[templateKey];
  if (!template) throw new Error(`Unknown template key: ${templateKey}`);

  let body = template.body;
  const usedPlaceholders = body.match(/\{([^}]+)\}/g)?.map(p => p.slice(1, -1)) || [];

  for (const p of usedPlaceholders) {
    if (!templateData.allowed_placeholders.includes(p)) {
      throw new Error(
        `Security violation: Template "${templateKey}" uses unauthorized placeholder "${p}"`
      );
    }
    if (placeholders[p] === undefined || placeholders[p] === null) {
      throw new Error(`Missing required placeholder for "${templateKey}": ${p}`);
    }
    // Global replace for placeholders
    body = body.replace(new RegExp(`{${p}}`, 'g'), placeholders[p]);
  }

  return body;
}

/**
 * Sends a WhatsApp message using Twilio.
 * Implements structured logging and protection against LLM hallucinations.
 */
export async function sendWhatsAppMessage({
  to,
  body,
  templateKey,
  placeholders,
  reason,
  skipConsentCheck = false,
}) {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  let finalBody = body;
  let sid = null;
  let status = 'failed';
  let errorMsg = null;

  try {
    // 1. Enforce Consent Check
    if (!skipConsentCheck) {
      const consented = await hasWhatsAppConsent(to);
      if (!consented) {
        throw new Error(`Consent missing for ${to}. User must reply START to opt-in.`);
      }
    }

    if (templateKey) {
      finalBody = renderTemplate(templateKey, placeholders);
    }

    if (!finalBody) throw new Error('Message body is empty');

    // 2. Append mandatory opt-out instructions
    finalBody += '\n\nReply STOP to unsubscribe';

    // Final safety check: Reject messages containing raw contact info not found in placeholders
    const piiPattern = /\b\d{10,}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const allowedValues = Object.values(placeholders || {}).join(' ');
    const potentialPII = finalBody.match(piiPattern) || [];
    for (const item of potentialPII) {
      if (!allowedValues.includes(item)) {
        throw new Error(
          `Hallucination check failed: Raw data "${item}" detected in content but not in placeholders.`
        );
      }
    }

    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const response = await client.messages.create({
      body: finalBody,
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: formattedTo,
    });

    sid = response.sid;
    status = 'sent';
    await updateLastSentTimestamp(to);

    // Log Success Metric
    await prisma.whatsAppMessageMetric.create({
      data: {
        messageSid: sid,
        phoneNumber: to,
        status: 'sent',
        templateKey: templateKey || 'custom',
        reason: reason || 'not_specified',
        durationMs: Date.now() - startTime,
      },
    });

    return { success: true, sid };
  } catch (error) {
    errorMsg = error.message;
    console.error(`[WhatsApp API Error] to=${to}:`, error);

    // Log Failure Metric
    await prisma.whatsAppMessageMetric.create({
      data: {
        phoneNumber: to,
        status: 'failed',
        errorCode: error.code?.toString() || 'unknown',
        errorMessage: error.message,
        templateKey: templateKey || 'custom',
        reason: reason || 'not_specified',
        durationMs: Date.now() - startTime,
      },
    });
    throw error;
  } finally {
    // Structured JSON log for auditing, billing, and troubleshooting via jq
    const logEntry = {
      to,
      message: finalBody,
      sid,
      timestamp,
      reason: reason || 'not_specified',
      template_key: templateKey || 'custom',
      status,
      error: errorMsg,
    };

    // Standardised format for production log aggregators
    console.info(JSON.stringify({ level: 'info', type: 'whatsapp_audit', ...logEntry }));
  }
}

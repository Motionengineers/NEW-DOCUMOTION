import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { sendWhatsAppMessage } from '../twilio.js';

/**
 * MCP Server for WhatsApp via Twilio.
 * Allows AI models to proactively reach out to startup founders.
 */
const server = new Server(
  {
    name: 'documotion-whatsapp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the WhatsApp Tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_whatsapp',
        description:
          'Send a WhatsApp notification to a startup founder. Use this to alert them about critical funding matches or meeting requests.',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient phone number with country code (e.g., +91...)',
            },
            template_key: {
              type: 'string',
              description:
                'The template key to use (funding_match, investor_match, general_update)',
            },
            placeholders: { type: 'object', description: 'Variables for the template' },
            reason: { type: 'string', description: 'The business reason for this notification' },
          },
          required: ['to', 'template_key', 'placeholders', 'reason'],
        },
      },
    ],
  };
});

// Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (name === 'send_whatsapp') {
    try {
      const { to, template_key, placeholders, reason } = args;

      // Basic validation for phone number format
      if (!/^\+?[1-9]\d{1,14}$/.test(to)) {
        throw new Error(`Invalid phone number format: ${to}`);
      }

      const result = await sendWhatsAppMessage({
        to,
        templateKey: template_key,
        placeholders,
        reason,
      });
      return {
        content: [{ type: 'text', text: `WhatsApp sent successfully. SID: ${result.sid}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Failed to send WhatsApp: ${error.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('WhatsApp MCP Server running on stdio');

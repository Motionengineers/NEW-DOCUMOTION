"""WhatsApp Response Templates for Documotion."""

TEMPLATES = {
    "welcome": """
🤖 *Welcome to Documotion AI Assistant!*

I help Indian startups find government schemes, grants, and funding opportunities.

*Quick start:* Simply describe your startup:
• "SaaS startup in Bangalore"
• "Women-led D2C brand"
• "Manufacturing business seeking loan"

Type *help* anytime for assistance.
""",

    "help": """
*Documotion AI Assistant - Help*

*How to use:*
1. Describe your startup
2. I find matching schemes
3. Ask for details on any scheme

*Examples:*
• "Edtech startup in Delhi seeking seed funding"
• "Agritech business for organic farming"
• "Export incentives for textile manufacturing"

*Commands:*
• `more` - Show more results
• `help` - Show this menu
• `feedback` - Share your experience

*Need support?* Visit documotion.com/support
""",

    "no_results": """
🔍 No schemes found for "{query}"

*Try:*
• Different keywords
• Broader description
• Check examples with `help`

*Need assistance?* Reply with `help` for guidance.
""",

    "error": """
⚠️ *Service Temporarily Unavailable*

I'm having trouble connecting to the search service.

*Please try:*
• Wait a few moments
• Try a simpler query
• Visit documotion.com/schemes

Apologies for the inconvenience.
""",

    "feedback_positive": """
🙏 Thank you for your feedback!

Your input helps me improve. Is there anything specific you'd like to know about?

Reply `help` for options or ask another question.
""",

    "feedback_negative": """
😞 Sorry to hear that.

Please let me know what went wrong so I can improve:
• Wrong results?
• Slow response?
• Something else?

Your feedback is valuable!
"""
}

def get_template(name: str, **kwargs) -> str:
    """Get formatted template with variables"""
    template = TEMPLATES.get(name, "")
    for key, value in kwargs.items():
        template = template.replace(f"{{{key}}}", str(value))
    return template

# Legacy support for existing constants
WELCOME_MSG = get_template("welcome")
HELP_MSG = get_template("help")
ERROR_MSG = get_template("error")
CLASSIFICATION_RESULT = "📄 I've analyzed your text. It looks like a *{doc_type}* (Confidence: {confidence:.2%})."
SCHEME_FOUND = "🏢 *{name}*\n\n💰 Benefits: {benefits}\n📋 Eligibility: {eligibility}\n\nType 'Apply' to know more."
NO_SCHEME_FOUND = "🧐 I couldn't find a specific scheme matching your query. Let me try a different search..."
CONSENT_REQUIRED = "🛡️ To protect your privacy, please reply 'START' to opt-in for WhatsApp notifications."
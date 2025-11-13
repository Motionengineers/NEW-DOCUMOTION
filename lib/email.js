let resendClient;

export async function sendTransactionalEmail({ to, subject, html }) {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;

  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured. Email will be logged locally instead.');
    console.info(`[email] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(RESEND_API_KEY);
  }

  await resendClient.emails.send({
    from: EMAIL_FROM ?? 'Documotion <no-reply@documotion.in>',
    to,
    subject,
    html,
  });
}

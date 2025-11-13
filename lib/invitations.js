import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email';

const DEFAULT_EXPIRES_DAYS = Number(process.env.INVITE_EXPIRES_DAYS ?? 7);
const ALLOWED_ROLES = new Set(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);

export function normalizeRole(role) {
  const upper = (role ?? '').toString().trim().toUpperCase();
  return ALLOWED_ROLES.has(upper) ? upper : 'VIEWER';
}

export function createInviteToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function calcExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRES_DAYS);
  return expiresAt;
}

export async function sendInviteEmail({
  to,
  inviteeName,
  inviterName,
  agencyName,
  acceptUrl,
  role,
}) {
  const html = `
  <!doctype html>
  <html>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f5f7fb;margin:0;padding:32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7f2;">
              <tr>
                <td style="padding:24px;text-align:center;background:linear-gradient(90deg,#f2f6ff,#ffffff);">
                  <strong style="font-size:20px;color:#0b3b66;">Documotion</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#111827;">
                  <p style="margin-top:0;font-size:18px;">Hi ${inviteeName || to},</p>
                  <p style="color:#4b5563;font-size:15px;line-height:1.6;margin-bottom:24px;">
                    <strong>${inviterName || agencyName || 'Your team'}</strong> invited you to join
                    <strong>${agencyName || 'their workspace'}</strong> on Documotion as a
                    <strong>${role}</strong>.
                  </p>
                  <p style="text-align:center;margin:32px 0;">
                    <a href="${acceptUrl}" style="background:#0B66FF;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;display:inline-block;">
                      Accept invitation
                    </a>
                  </p>
                  <p style="color:#6b7280;font-size:14px;line-height:1.6;">
                    If you didn’t expect this, feel free to ignore this email. The invitation will expire automatically.
                  </p>
                  <p style="color:#6b7280;font-size:13px;line-height:1.6;">
                    Link: <a href="${acceptUrl}">${acceptUrl}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px;text-align:center;font-size:12px;color:#94a3b8;background:#f8fafc;">
                  © ${new Date().getFullYear()} Documotion • Built for agencies in India
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  await sendTransactionalEmail({
    to,
    subject: `${agencyName || 'Documotion workspace'} invitation`,
    html,
  });
}

export async function recordActivity({ agencyId: _agencyId, message }) {
  try {
    await prisma.notification.create({
      data: {
        userId: null,
        title: 'Team update',
        body: message,
        level: 'info',
      },
    });
  } catch (error) {
    console.error('Failed to record invite activity', error);
  }
}

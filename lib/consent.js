import prisma from './prisma';

/**
 * Check if a phone number has active opt-in consent.
 */
export async function hasWhatsAppConsent(phoneNumber) {
  const record = await prisma.whatsAppConsent.findUnique({
    where: { phoneNumber },
  });

  if (!record) return false;
  // Active if opted in and no opt-out date set
  return record.optInStatus && !record.optOutDate;
}

/**
 * Record or update opt-in status.
 */
export async function recordOptIn(phoneNumber, { source = 'api', ip = null } = {}) {
  const now = new Date();
  return prisma.whatsAppConsent.upsert({
    where: { phoneNumber },
    update: {
      optInStatus: true,
      optInDate: now,
      optOutDate: null,
      optOutReason: null,
      consentSource: source,
      consentIp: ip,
    },
    create: {
      phoneNumber,
      optInStatus: true,
      optInDate: now,
      consentSource: source,
      consentIp: ip,
    },
  });
}

/**
 * Record opt-out status (STOP command).
 */
export async function recordOptOut(phoneNumber, reason = 'user_initiated') {
  return prisma.whatsAppConsent.upsert({
    where: { phoneNumber },
    update: {
      optInStatus: false,
      optOutDate: new Date(),
      optOutReason: reason,
    },
    create: {
      phoneNumber,
      optInStatus: false,
      optOutDate: new Date(),
      optOutReason: reason,
    },
  });
}

/**
 * Update the timestamp of the last message sent.
 */
export async function updateLastSentTimestamp(phoneNumber) {
  return prisma.whatsAppConsent.update({
    where: { phoneNumber },
    data: { lastMessageSent: new Date() },
  });
}

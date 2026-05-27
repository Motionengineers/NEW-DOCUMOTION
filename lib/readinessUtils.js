import prisma from '@/lib/prisma';

// Weightage for different components based on the assessment type
export const WEIGHTS = {
  FUNDING: {
    documentCompleteness: 0.40,
    profileCompleteness: 0.20,
    riskAssessment: 0.40
  },
  COMPLIANCE: {
    documentCompleteness: 0.50,
    profileCompleteness: 0.10,
    riskAssessment: 0.40
  },
  SCHEME: {
    documentCompleteness: 0.60,
    profileCompleteness: 0.20,
    riskAssessment: 0.20
  }
};

// Required documents and their relative importance by readiness type
export const REQUIRED_DOCUMENTS = {
  FUNDING: [
    { type: 'PITCH_DECK', required: true, weight: 25 },
    { type: 'FINANCIAL_MODEL', required: true, weight: 25 },
    { type: 'CAP_TABLE', required: true, weight: 20 },
    { type: 'INCORPORATION', required: true, weight: 15 },
    { type: 'GST_CERTIFICATE', required: false, weight: 10 },
    { type: 'PAN_CARD', required: false, weight: 5 }
  ],
  COMPLIANCE: [
    { type: 'GST_CERTIFICATE', required: true, weight: 25 },
    { type: 'PAN_CARD', required: true, weight: 20 },
    { type: 'INCORPORATION', required: true, weight: 25 },
    { type: 'MSME_REGISTRATION', required: false, weight: 15 },
    { type: 'BANK_STATEMENT', required: false, weight: 10 },
    { type: 'TAX_RETURN', required: false, weight: 5 }
  ],
  SCHEME: [
    { type: 'INCORPORATION', required: true, weight: 30 },
    { type: 'MSME_REGISTRATION', required: true, weight: 25 },
    { type: 'GST_CERTIFICATE', required: true, weight: 20 },
    { type: 'BANK_STATEMENT', required: false, weight: 15 },
    { type: 'PITCH_DECK', required: false, weight: 10 }
  ]
};

export async function getStartupWithDocuments(startupId) {
  return prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      documents: true,
      user: true,
      complianceTasks: true
    }
  });
}
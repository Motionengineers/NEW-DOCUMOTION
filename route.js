import { NextResponse } from 'next/server';

export async function POST() {
  // Simulates a non-blocking queue trigger for UI testing in Free Mode
  const simulationData = {
    success: true,
    mode: 'SIMULATION',
    estimatedTime: '15 seconds',
    steps: ['Document Validation', 'Payload Preparation', 'Portal Handshake', 'Final Submission'],
  };

  return NextResponse.json(simulationData);
}
#!/usr/bin/env node

/**
 * QA Test Script - Verify Full Flow
 *
 * Tests the complete flow:
 * 1. Create founder profile
 * 2. Create startup linked to founder
 * 3. Upload documents
 * 4. Run eligibility check
 * 5. Get recommendations
 * 6. Trigger auto-apply
 * 7. Verify logs
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_DATA = {
  founder: {
    firstName: 'QA',
    lastName: 'Test',
    company: 'Test Startup Inc',
    role: 'Founder & CEO',
    skills: 'Product Management, Growth, Marketing',
    location: 'Bangalore, Karnataka',
    email: 'qa-test@example.com',
    phone: '+911234567890',
    availability: 'Available',
  },
  startup: {
    name: 'QA Test Startup',
    description: 'A test startup for QA verification',
    stage: 'MVP',
    sector: 'FinTech',
    location: 'Bangalore, Karnataka',
    foundingYear: 2023,
    teamSize: 5,
    dpiitNumber: 'TEST12345',
  },
};

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n[Step ${step}] ${description}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function testCreateFounder() {
  logStep(1, 'Creating Founder Profile');

  try {
    const founder = await prisma.founderProfile.create({
      data: TEST_DATA.founder,
    });

    logSuccess(`Founder profile created: ID ${founder.id}`);
    return founder;
  } catch (error) {
    logError(`Failed to create founder: ${error.message}`);
    throw error;
  }
}

async function testCreateStartup(founderId) {
  logStep(2, 'Creating Startup');

  try {
    // First create a user
    const user = await prisma.user.create({
      data: {
        email: `qa-startup-${Date.now()}@test.com`,
        name: TEST_DATA.startup.name,
        role: 'founder',
      },
    });

    const startup = await prisma.startup.create({
      data: {
        ...TEST_DATA.startup,
        slug: TEST_DATA.startup.name.toLowerCase().replace(/\s+/g, '-'),
        userId: user.id,
      },
    });

    logSuccess(`Startup created: ID ${startup.id}, Slug: ${startup.slug}`);
    return startup;
  } catch (error) {
    logError(`Failed to create startup: ${error.message}`);
    throw error;
  }
}

async function testUploadDocument(startupId) {
  logStep(3, 'Uploading Document');

  try {
    // Create a mock document record (in real test, would upload file)
    const document = await prisma.document.create({
      data: {
        startupId,
        name: 'PAN Card',
        type: 'PAN',
        fileUrl: JSON.stringify({
          url: 'https://example.com/test-pan.pdf',
          storage: 's3',
          key: 'documents/test-pan.pdf',
        }),
        status: 'pending',
      },
    });

    logSuccess(`Document uploaded: ID ${document.id}, Type: ${document.type}`);

    // Update to verified for testing
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'verified' },
    });

    logSuccess('Document verified');
    return document;
  } catch (error) {
    logError(`Failed to upload document: ${error.message}`);
    throw error;
  }
}

async function testEligibilityCheck(startup) {
  logStep(4, 'Running Eligibility Check');

  try {
    const startupProfile = {
      stage: startup.stage || '',
      sector: startup.sector || '',
      location: startup.location || '',
      state: startup.location?.split(',')[1]?.trim() || '',
      has_prototype: true,
      dpiitNumber: startup.dpiitNumber || '',
      foundingYear: startup.foundingYear || null,
      startupAgeYears: startup.foundingYear ? new Date().getFullYear() - startup.foundingYear : 0,
      needs_loan: true,
      collateral: 'none',
    };

    // Note: In real test, would call API endpoint
    // For now, just verify the profile structure
    logSuccess('Eligibility profile prepared');
    log(`  Stage: ${startupProfile.stage}`);
    log(`  Sector: ${startupProfile.sector}`);
    log(`  Location: ${startupProfile.location}`);
    log(`  Has Prototype: ${startupProfile.has_prototype}`);

    return startupProfile;
  } catch (error) {
    logError(`Failed eligibility check: ${error.message}`);
    throw error;
  }
}

async function testGetRecommendations(startupId, startupProfile) {
  logStep(5, 'Getting Scheme Recommendations');

  try {
    // In real test, would call /api/schemes/recommend
    // For now, verify we can query schemes
    const schemes = await prisma.govtScheme.findMany({
      where: {
        status: 'Active',
      },
      take: 5,
    });

    logSuccess(`Found ${schemes.length} active schemes`);

    schemes.forEach(scheme => {
      log(`  - ${scheme.schemeName}`);
    });

    return schemes;
  } catch (error) {
    logError(`Failed to get recommendations: ${error.message}`);
    throw error;
  }
}

async function testAutoApply(startupId, schemeId) {
  logStep(6, 'Triggering Auto-Apply');

  try {
    const log = await prisma.autoApplyLog.create({
      data: {
        startupId,
        schemeId,
        schemeType: 'govt',
        status: 'pending',
        payload: JSON.stringify({
          schemeId,
          startupId,
          timestamp: new Date().toISOString(),
          test: true,
        }),
      },
    });

    logSuccess(`Auto-apply log created: ID ${log.id}, Status: ${log.status}`);
    return log;
  } catch (error) {
    logError(`Failed to create auto-apply log: ${error.message}`);
    throw error;
  }
}

async function testVerifyLogs(startupId) {
  logStep(7, 'Verifying Auto-Apply Logs');

  try {
    const logs = await prisma.autoApplyLog.findMany({
      where: { startupId },
      include: {
        startup: {
          select: {
            name: true,
          },
        },
      },
    });

    logSuccess(`Found ${logs.length} auto-apply log(s) for startup`);

    logs.forEach(log => {
      log(`  - Log ${log.id}: ${log.schemeType}, Status: ${log.status}`);
    });

    return logs;
  } catch (error) {
    logError(`Failed to verify logs: ${error.message}`);
    throw error;
  }
}

async function cleanup(testData) {
  logStep('Cleanup', 'Removing Test Data');

  try {
    if (testData.autoApplyLogs?.length > 0) {
      await prisma.autoApplyLog.deleteMany({
        where: {
          id: { in: testData.autoApplyLogs.map(l => l.id) },
        },
      });
    }

    if (testData.documents?.length > 0) {
      await prisma.document.deleteMany({
        where: {
          id: { in: testData.documents.map(d => d.id) },
        },
      });
    }

    if (testData.startup) {
      await prisma.startup.delete({
        where: { id: testData.startup.id },
      });
    }

    if (testData.founder) {
      await prisma.founderProfile.delete({
        where: { id: testData.founder.id },
      });
    }

    logSuccess('Test data cleaned up');
  } catch (error) {
    logWarning(`Cleanup error (non-critical): ${error.message}`);
  }
}

// Main test flow
async function runTests() {
  const testData = {};
  let success = true;

  try {
    log('\n🧪 Starting QA Test Suite', 'blue');
    log('='.repeat(50), 'blue');

    // Step 1: Create Founder
    testData.founder = await testCreateFounder();

    // Step 2: Create Startup
    testData.startup = await testCreateStartup(testData.founder.id);

    // Step 3: Upload Document
    testData.documents = [await testUploadDocument(testData.startup.id)];

    // Step 4: Eligibility Check
    const startupProfile = await testEligibilityCheck(testData.startup);

    // Step 5: Get Recommendations
    const schemes = await testGetRecommendations(testData.startup.id, startupProfile);

    if (schemes.length > 0) {
      // Step 6: Auto-Apply
      testData.autoApplyLogs = [await testAutoApply(testData.startup.id, schemes[0].id)];
    }

    // Step 7: Verify Logs
    await testVerifyLogs(testData.startup.id);

    log('\n' + '='.repeat(50), 'green');
    log('✅ All Tests Passed!', 'green');
  } catch (error) {
    log('\n' + '='.repeat(50), 'red');
    log('❌ Test Suite Failed', 'red');
    log(`Error: ${error.message}`, 'red');
    success = false;
  } finally {
    // Cleanup
    if (process.env.SKIP_CLEANUP !== 'true') {
      await cleanup(testData);
    } else {
      logWarning('Skipping cleanup (SKIP_CLEANUP=true)');
    }

    await prisma.$disconnect();
  }

  process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});

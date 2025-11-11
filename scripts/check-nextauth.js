#!/usr/bin/env node

/**
 * Check NextAuth Configuration
 * Verifies that all required environment variables are set
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const requiredEnvVars = {
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: null, // Must be set
};

const optionalEnvVars = {
  GOOGLE_CLIENT_ID: 'Optional - for Google OAuth',
  GOOGLE_CLIENT_SECRET: 'Optional - for Google OAuth',
};

async function checkEnv() {
  const envPath = join(process.cwd(), '.env');
  let envContent = '';

  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }

  console.log('\n🔍 Checking NextAuth Configuration\n');
  console.log('='.repeat(50));

  let hasErrors = false;

  // Check required vars
  console.log('\n📋 Required Environment Variables:');
  for (const [key, defaultValue] of Object.entries(requiredEnvVars)) {
    const value = process.env[key] || (envContent.includes(key) ? '(set in .env)' : '❌ MISSING');

    if (value === '❌ MISSING' && !defaultValue) {
      console.log(`  ❌ ${key}: MISSING (REQUIRED)`);
      hasErrors = true;
    } else if (value === '❌ MISSING' && defaultValue) {
      console.log(`  ⚠️  ${key}: MISSING (will use default: ${defaultValue})`);
    } else {
      console.log(`  ✅ ${key}: ${value}`);
    }
  }

  // Check optional vars
  console.log('\n📋 Optional Environment Variables:');
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[key] || (envContent.includes(key) ? '(set in .env)' : 'not set');
    const icon = value === 'not set' ? '⚪' : '✅';
    console.log(`  ${icon} ${key}: ${value}`);
    if (value !== 'not set') {
      console.log(`     ${description}`);
    }
  }

  // Generate secret if missing
  if (!process.env.NEXTAUTH_SECRET && !envContent.includes('NEXTAUTH_SECRET')) {
    console.log('\n🔐 Generating NEXTAUTH_SECRET:');
    const { randomBytes } = await import('crypto');
    const secret = randomBytes(32).toString('base64');
    console.log(`\nAdd this to your .env file:`);
    console.log(`NEXTAUTH_SECRET="${secret}"\n`);
  }

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    console.log('\n❌ Configuration errors found. Please fix them before proceeding.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Configuration looks good!\n');
    process.exit(0);
  }
}

checkEnv().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

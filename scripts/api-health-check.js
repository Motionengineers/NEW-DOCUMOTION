#!/usr/bin/env node

/**
 * API Health Check Script
 * Tests all 80 APIs to ensure they're responding correctly
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// API endpoints to test
const API_ENDPOINTS = [
  // Critical APIs
  { method: 'GET', path: '/api/dashboard', critical: true },
  { method: 'GET', path: '/api/govt-schemes', critical: true },
  { method: 'GET', path: '/api/bank-schemes', critical: true },
  { method: 'GET', path: '/api/states', critical: true },
  { method: 'GET', path: '/api/funding/state?state=Karnataka', critical: true },
  { method: 'GET', path: '/api/talent', critical: true },
  { method: 'GET', path: '/api/pitch-decks', critical: true },
  
  // State Funding APIs
  { method: 'GET', path: '/api/funding/state?state=Maharashtra' },
  { method: 'POST', path: '/api/funding/match', body: { industry: 'AI', stage: 'seed' } },
  { method: 'GET', path: '/api/funding/1' },
  
  // Branding Studio APIs
  { method: 'GET', path: '/api/branding/drafts' },
  { method: 'GET', path: '/api/branding/assets' },
  { method: 'GET', path: '/api/branding/agencies' },
  { method: 'GET', path: '/api/branding/partners' },
  
  // Subscription APIs
  { method: 'GET', path: '/api/subscription' },
  { method: 'GET', path: '/api/subscription/invoices' },
  { method: 'GET', path: '/api/subscription/usage' },
  
  // Team & Invitations
  { method: 'GET', path: '/api/invitations' },
  
  // Feed & Social
  { method: 'GET', path: '/api/feed/posts' },
  
  // Notifications
  { method: 'GET', path: '/api/notifications' },
  
  // Settings
  { method: 'GET', path: '/api/settings' },
  
  // Telemetry
  { method: 'POST', path: '/api/telemetry/events', body: { events: [] } },
];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  criticalFailed: 0,
  warnings: 0,
  errors: [],
};

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const status = response.status;
    
    // Check if response is OK
    const isSuccess = status >= 200 && status < 300;
    
    // Check response time
    const isSlow = duration > 2000; // 2 seconds
    const isVerySlow = duration > 5000; // 5 seconds
    
    if (!isSuccess) {
      const errorText = await response.text().catch(() => '');
      results.errors.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        status,
        error: errorText.substring(0, 100),
        critical: endpoint.critical,
      });
      
      if (endpoint.critical) {
        results.criticalFailed++;
      }
      results.failed++;
      return { success: false, status, duration, critical: endpoint.critical };
    }
    
    if (isVerySlow) {
      results.warnings++;
      return { success: true, status, duration, slow: true, critical: endpoint.critical };
    }
    
    if (isSlow) {
      results.warnings++;
      return { success: true, status, duration, slow: true, critical: endpoint.critical };
    }
    
    results.passed++;
    return { success: true, status, duration, critical: endpoint.critical };
  } catch (error) {
    const duration = Date.now() - startTime;
    results.errors.push({
      endpoint: endpoint.path,
      method: endpoint.method,
      error: error.message,
      critical: endpoint.critical,
    });
    
    if (endpoint.critical) {
      results.criticalFailed++;
    }
    results.failed++;
    return { success: false, error: error.message, duration, critical: endpoint.critical };
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function printResult(endpoint, result) {
  const icon = result.success ? '✅' : '❌';
  const color = result.success ? colors.green : colors.red;
  const slowIndicator = result.slow ? ' 🐌' : '';
  const criticalIndicator = result.critical ? ' 🔴' : '';
  
  let statusText = `${icon} ${endpoint.method} ${endpoint.path}`;
  if (result.status) {
    statusText += ` [${result.status}]`;
  }
  statusText += ` (${formatDuration(result.duration)})${slowIndicator}${criticalIndicator}`;
  
  console.log(`${color}${statusText}${colors.reset}`);
  
  if (result.error) {
    console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
  }
}

async function runHealthCheck() {
  console.log(`${colors.cyan}🔍 Starting API Health Check...${colors.reset}\n`);
  console.log(`Base URL: ${BASE_URL}\n`);
  
  results.total = API_ENDPOINTS.length;
  
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    printResult(endpoint, result);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Print summary
  console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`Total APIs: ${results.total}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  
  if (results.criticalFailed > 0) {
    console.log(`${colors.red}🔴 Critical Failed: ${results.criticalFailed}${colors.reset}`);
  }
  
  if (results.warnings > 0) {
    console.log(`${colors.yellow}⚠️  Slow Responses: ${results.warnings}${colors.reset}`);
  }
  
  // Print errors
  if (results.errors.length > 0) {
    console.log(`\n${colors.red}❌ Errors:${colors.reset}`);
    results.errors.forEach(err => {
      const critical = err.critical ? ' [CRITICAL]' : '';
      console.log(`   ${err.method} ${err.endpoint}${critical}`);
      if (err.status) {
        console.log(`     Status: ${err.status}`);
      }
      if (err.error) {
        console.log(`     Error: ${err.error}`);
      }
    });
  }
  
  // Exit code
  const exitCode = results.criticalFailed > 0 ? 1 : (results.failed > 0 ? 2 : 0);
  
  if (exitCode === 0) {
    console.log(`\n${colors.green}✅ All APIs are healthy!${colors.reset}\n`);
  } else if (exitCode === 1) {
    console.log(`\n${colors.red}🔴 Critical APIs failed!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some APIs failed (non-critical)${colors.reset}\n`);
  }
  
  process.exit(exitCode);
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});

// Run health check
runHealthCheck().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});


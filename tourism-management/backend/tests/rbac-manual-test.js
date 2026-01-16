/**
 * RBAC Manual Test Script
 * 
 * Run this script to quickly verify RBAC is working correctly.
 * 
 * Usage:
 *   cd backend
 *   node tests/rbac-manual-test.js
 * 
 * Prerequisites:
 *   1. Backend running on localhost:3000
 *   2. Database seeded with test users
 */

const API_BASE = 'http://localhost:3000/api';

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
};

// ============================================================
// TEST CONFIGURATION
// Update these credentials to match your seed data
// ============================================================

const TEST_USERS = {
  // Platform admin - should have all platform permissions
  admin: {
    email: 'admin@gmail.com',
    password: 'admin123',
    expectedScope: 'platform',
    shouldAccess: ['/users', '/approval/pending-businesses'], // Fixed: /approval not /approvals
    shouldDeny: [],
  },
  // Business owner - should have business management permissions
  owner: {
    email: 'owner@gmail.com',
    password: 'owner123',
    expectedScope: 'platform',      // Owner is system role
    shouldAccess: ['/products'],    // Can view products (GET is public)
    shouldDeny: ['/users'],         // Cannot manage users
  },
  // Custom staff - has business scope with specific permissions
  customStaff: {
    email: 'mcpearsula@gmail.com',
    password: 'Arsula101!',
    expectedScope: 'business',
    shouldAccess: [],               // Access depends on business_id
    shouldDeny: ['/users'],         // Cannot access platform admin routes
  },
  // Tourism Officer - platform scope with event/analytics permissions
  tourismOfficer: {
    email: 'mcpeshikumi@gmail.com',
    password: 'UGyW4hQ6dp_v',
    expectedScope: 'platform',
    shouldAccess: [],               // Events may not exist yet
    shouldDeny: ['/users'],         // Cannot manage users (admin only)
  },
  // Tourist - minimal permissions
  tourist: {
    email: 'tourist@gmail.com',
    password: 'tourist123',
    expectedScope: 'platform',
    shouldAccess: ['/products'],    // Products browsing is public
    shouldDeny: ['/users'],         // Cannot access admin routes
  },
};

// ============================================================
// HTTP HELPERS
// ============================================================

async function httpRequest(method, path, token = null, body = null) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function login(email, password) {
  const { status, data } = await httpRequest('POST', '/auth/login', null, {
    email,
    password,
    client: 'web',
  });
  
  if (status === 200 && data.accessToken) {
    return data.accessToken;
  }
  
  throw new Error(`Login failed: ${data.message || status}`);
}

// ============================================================
// TEST RUNNERS
// ============================================================

async function testUserPermissions(userType, credentials, token) {
  log.header(`Testing ${userType.toUpperCase()} Permissions`);
  
  // 1. Get user permissions
  const { status, data } = await httpRequest('GET', '/permissions/me', token);
  
  if (status === 200) {
    const permissions = data.permissions || [];
    log.success(`Permissions loaded: ${permissions.length} permissions`);
    
    if (permissions.length > 0) {
      console.log(`   Permissions: ${permissions.slice(0, 5).join(', ')}${permissions.length > 5 ? '...' : ''}`);
    }
  } else {
    log.fail(`Failed to get permissions: ${status}`);
  }
  
  // 2. Get user role info
  const meResponse = await httpRequest('GET', '/auth/me', token);
  if (meResponse.status === 200) {
    const user = meResponse.data.user || meResponse.data;
    const roleType = user.role_type || 'system';
    const roleFor = user.role_for; // null for system roles
    
    log.info(`Role Type: ${roleType}, Role For: ${roleFor || 'none'}`);
    
    // Business scope = role_type is 'business' OR role_for is set
    const actualScope = roleType === 'business' || roleFor ? 'business' : 'platform';
    if (actualScope === credentials.expectedScope) {
      log.success(`Scope matches expected: ${actualScope}`);
    } else {
      log.fail(`Scope mismatch! Expected: ${credentials.expectedScope}, Actual: ${actualScope}`);
    }
  }
  
  // 3. Test routes that should be accessible
  for (const route of credentials.shouldAccess) {
    const response = await httpRequest('GET', route, token);
    if (response.status === 200 || response.status === 201) {
      log.success(`Can access ${route} (${response.status})`);
    } else if (response.status === 403) {
      log.fail(`Denied access to ${route} - should have access!`);
    } else {
      log.warn(`${route} returned ${response.status}`);
    }
  }
  
  // 4. Test routes that should be denied
  for (const route of credentials.shouldDeny) {
    const response = await httpRequest('GET', route, token);
    if (response.status === 403) {
      log.success(`Correctly denied access to ${route}`);
    } else if (response.status === 200) {
      log.fail(`Can access ${route} - should be denied!`);
    } else {
      log.warn(`${route} returned ${response.status} (expected 403)`);
    }
  }
}

async function testPlatformScopedRoutes(tokens) {
  log.header('Platform-Scoped Route Tests');
  
  const platformRoutes = [
    { path: '/users', permission: 'manage_users' },
    { path: '/approval/pending-businesses', permission: 'approve_business' }, // Fixed: /approval not /approvals
  ];
  
  for (const route of platformRoutes) {
    log.info(`Testing ${route.path} (requires ${route.permission})`);
    
    // Admin should access
    if (tokens.admin) {
      const response = await httpRequest('GET', route.path, tokens.admin);
      if (response.status === 200) {
        log.success(`  Admin: Access granted`);
      } else {
        log.fail(`  Admin: ${response.status} (expected 200)`);
      }
    }
    
    // Tourist should be denied
    if (tokens.tourist) {
      const response = await httpRequest('GET', route.path, tokens.tourist);
      if (response.status === 403) {
        log.success(`  Tourist: Correctly denied`);
      } else {
        log.fail(`  Tourist: ${response.status} (expected 403)`);
      }
    }
  }
}

async function testBusinessScopedRoutes(tokens) {
  log.header('Business-Scoped Route Tests');
  
  // Use UUID format - this is the Sample Restaurant from seed data
  const businessId = '66666666-6666-6666-6666-666666666666';
  const route = `/orders/business/${businessId}`;
  
  log.info(`Testing ${route} (requires business access)`);
  
  // Owner should access their business
  if (tokens.owner) {
    const response = await httpRequest('GET', route, tokens.owner);
    log.info(`  Owner: ${response.status} ${response.status === 200 ? '(has access)' : response.status === 403 ? '(no access to this business)' : ''}`);
  }
  
  // Staff should access their business
  if (tokens.staff) {
    const response = await httpRequest('GET', route, tokens.staff);
    log.info(`  Staff: ${response.status} ${response.status === 200 ? '(has access)' : response.status === 403 ? '(no access to this business)' : ''}`);
  }
  
  // Tourist should be denied
  if (tokens.tourist) {
    const response = await httpRequest('GET', route, tokens.tourist);
    if (response.status === 403) {
      log.success(`  Tourist: Correctly denied`);
    } else {
      log.fail(`  Tourist: ${response.status} (expected 403)`);
    }
  }
}

async function testPermissionBasedRoutes(tokens) {
  log.header('Permission-Based Route Tests');
  
  // Test product creation (requires manage_shop permission - bundles product/service management)
  log.info('Testing POST /products (requires manage_shop)');
  
  const testProduct = {
    name: 'RBAC Test Product',
    price: 999,
    business_id: '66666666-6666-6666-6666-666666666666', // Use UUID format
  };
  
  if (tokens.owner) {
    const response = await httpRequest('POST', '/products', tokens.owner, testProduct);
    if (response.status === 200 || response.status === 201) {
      log.success(`  Owner: Can create products`);
    } else if (response.status === 403) {
      log.warn(`  Owner: Denied (may not have manage_shop permission)`);
    } else {
      log.info(`  Owner: ${response.status}`);
    }
  }
  
  if (tokens.tourist) {
    const response = await httpRequest('POST', '/products', tokens.tourist, testProduct);
    if (response.status === 403) {
      log.success(`  Tourist: Correctly denied`);
    } else {
      log.fail(`  Tourist: ${response.status} (expected 403)`);
    }
  }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function runTests() {
  console.log(`
${colors.bold}╔═══════════════════════════════════════════════════════════════╗
║              RBAC AUTHORIZATION MANUAL TESTS                  ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
  `);
  
  log.info(`API Base: ${API_BASE}`);
  log.info(`Testing at: ${new Date().toISOString()}`);
  
  // Store tokens
  const tokens = {};
  
  // ============================================================
  // STEP 1: Authenticate test users
  // ============================================================
  
  log.header('Authentication');
  
  for (const [userType, credentials] of Object.entries(TEST_USERS)) {
    try {
      tokens[userType] = await login(credentials.email, credentials.password);
      log.success(`${userType} authenticated`);
    } catch (error) {
      log.warn(`${userType} skipped: ${error.message}`);
    }
  }
  
  const authenticatedCount = Object.values(tokens).filter(Boolean).length;
  if (authenticatedCount === 0) {
    log.fail('No users authenticated! Update TEST_USERS credentials and try again.');
    process.exit(1);
  }
  
  log.info(`${authenticatedCount}/${Object.keys(TEST_USERS).length} users authenticated`);
  
  // ============================================================
  // STEP 2: Test individual user permissions
  // ============================================================
  
  for (const [userType, credentials] of Object.entries(TEST_USERS)) {
    if (tokens[userType]) {
      await testUserPermissions(userType, credentials, tokens[userType]);
    }
  }
  
  // ============================================================
  // STEP 3: Test platform-scoped routes
  // ============================================================
  
  await testPlatformScopedRoutes(tokens);
  
  // ============================================================
  // STEP 4: Test business-scoped routes
  // ============================================================
  
  await testBusinessScopedRoutes(tokens);
  
  // ============================================================
  // STEP 5: Test permission-based routes
  // ============================================================
  
  await testPermissionBasedRoutes(tokens);
  
  // ============================================================
  // SUMMARY
  // ============================================================
  
  console.log(`
${colors.bold}╔═══════════════════════════════════════════════════════════════╗
║                      TEST COMPLETE                            ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}Note:${colors.reset} Update TEST_USERS in this file with your actual test credentials.

${colors.cyan}Quick Verification Checklist:${colors.reset}
  □ Admin can access /users and /approval/* (note: singular "approval")
  □ Tourist is denied access to admin routes
  □ Business owner can view products (GET is public)
  □ Custom staff has correct role_type: 'business'
  □ Permissions endpoint returns correct permissions

${colors.cyan}Notes:${colors.reset}
  • Product routes use manage_shop permission (bundles product + service management)
  • Business IDs use UUIDs, not integers
  • POST /products returning 400 means auth passed but request body is incomplete
  `);
}

// Run tests
runTests().catch(console.error);

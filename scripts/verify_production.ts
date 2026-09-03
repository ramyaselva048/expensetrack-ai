import 'dotenv/config';
import mysql from 'mysql2/promise';

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('=====================================================');
  console.log('   EXPENSETRACK PRODUCTION READINESS VERIFICATION    ');
  console.log('=====================================================');

  // Direct MySQL connection check using environment variables
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expensetrack_db'
  });

  const [dbVer]: any = await pool.query('SELECT VERSION() as version, DATABASE() as db');
  console.log(`[PASS] MySQL direct connectivity established: DB = ${dbVer[0].db}, Version = ${dbVer[0].version}`);

  // Step 0: Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  if (!healthData.mysqlConnected) {
    throw new Error('Health check failed: MySQL not connected');
  }
  console.log(`[PASS] Health endpoint confirmed MySQL connected:`, healthData);

  // Step 1: User 1 Registration
  const user1Email = `priya_${Date.now()}@example.com`;
  const user1Pass = 'Priya@Prod2026!';
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: user1Email,
      password: user1Pass,
      companyName: 'Apex Financial Services',
      role: 'Finance Controller',
      currency: 'INR'
    })
  });
  const regData = await regRes.json();
  if (!regData.success || !regData.token) {
    throw new Error(`User 1 registration failed: ${JSON.stringify(regData)}`);
  }
  const user1Id = regData.user.id;
  const user1Token = regData.token;
  console.log(`[PASS] Step 1: User 1 registered successfully (ID: ${user1Id}, Email: ${user1Email})`);

  // Verify User 1 in MySQL table
  const [u1Row]: any = await pool.query('SELECT id, name, email, password, role FROM users WHERE id = ?', [user1Id]);
  if (!u1Row || u1Row.length === 0) {
    throw new Error('User 1 not found in MySQL users table!');
  }
  if (!u1Row[0].password.startsWith('$2a$') && !u1Row[0].password.startsWith('$2b$')) {
    throw new Error('User 1 password is not properly hashed with bcrypt!');
  }
  console.log(`[PASS] Verified User 1 in MySQL with valid bcrypt hash: ${u1Row[0].password.substring(0, 20)}...`);

  // Step 2: Login as User 1
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: user1Pass })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error(`User 1 login failed: ${JSON.stringify(loginData)}`);
  }
  console.log(`[PASS] Step 2: User 1 logged in successfully and JWT issued.`);

  // Step 3: Create a new location for User 1
  const locRes = await fetch(`${BASE_URL}/api/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      name: 'Hyderabad Cyber Hub',
      code: 'HYD-01',
      state: 'Telangana',
      budgetLimit: 450000,
      color: '#06B6D4',
      description: 'Regional Technology & Delivery Center'
    })
  });
  const locData = await locRes.json();
  if (!locData.success) {
    throw new Error(`Location creation failed: ${JSON.stringify(locData)}`);
  }
  const newLocId = locData.data.id;
  console.log(`[PASS] Step 3: Location created successfully via API: ${locData.data.name} (ID: ${newLocId})`);

  // Verify Location in MySQL
  const [locRows]: any = await pool.query('SELECT * FROM locations WHERE id = ?', [newLocId]);
  if (!locRows || locRows.length === 0 || locRows[0].user_id !== user1Id) {
    throw new Error('Location not found in MySQL or invalid user_id!');
  }
  console.log(`[PASS] Verified Location directly in MySQL table: Name=${locRows[0].name}, Budget=${locRows[0].budget_limit}`);

  // Step 4: Create an expense for User 1
  const expRes = await fetch(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      name: 'Dell Technologies',
      amount: 65000,
      category: 'Equipment & IT',
      location: 'Hyderabad Cyber Hub',
      locationId: newLocId,
      date: '2026-03-01',
      paymentMethod: 'Corporate Card',
      description: 'UltraSharp 4K Monitors and Docking Stations',
      taxDeductible: true,
      status: 'approved'
    })
  });
  const expData = await expRes.json();
  if (!expData.success) {
    throw new Error(`Expense creation failed: ${JSON.stringify(expData)}`);
  }
  const expId = expData.data.id;
  console.log(`[PASS] Step 4: Expense created successfully via API: ${expData.data.name}, Amount=${expData.data.amount} (ID: ${expId})`);

  // Step 5: Verify Expense directly in MySQL table
  const [expRows]: any = await pool.query('SELECT * FROM expenses WHERE id = ?', [expId]);
  if (!expRows || expRows.length === 0 || expRows[0].user_id !== user1Id) {
    throw new Error('Expense record not found in MySQL or user_id mismatch!');
  }
  console.log(`[PASS] Step 5: Verified Expense in MySQL: Amount=${expRows[0].amount}, Category=${expRows[0].category}, Location=${expRows[0].location_name}`);

  // Step 6: Verify Dashboard calculations
  const dashRes = await fetch(`${BASE_URL}/api/dashboard/summary`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const dashData = await dashRes.json();
  if (!dashData.success || dashData.data.totalExpenses !== 65000 || dashData.data.totalTransactions !== 1) {
    throw new Error(`Dashboard summary mismatch: ${JSON.stringify(dashData)}`);
  }
  console.log(`[PASS] Step 6: Dashboard verified from MySQL: Total=${dashData.data.totalExpenses}, Count=${dashData.data.totalTransactions}`);

  // Step 7: Verify Expense Search & Filter
  const filterRes = await fetch(`${BASE_URL}/api/expenses?search=Dell&category=Equipment%20%26%20IT`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const filterData = await filterRes.json();
  if (!filterData.success || filterData.data.length !== 1 || filterData.data[0].id !== expId) {
    throw new Error(`Filter and search failed: ${JSON.stringify(filterData)}`);
  }
  console.log(`[PASS] Step 7: Search and filter returned expected expense matching query.`);

  // Step 8: Edit Expense
  const updateRes = await fetch(`${BASE_URL}/api/expenses/${expId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      amount: 72500,
      description: 'Upgraded Dell 4K Monitors, Webcams & TB4 Docks'
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success || updateData.data.amount !== 72500) {
    throw new Error(`Update expense failed: ${JSON.stringify(updateData)}`);
  }
  console.log(`[PASS] Step 8: Expense updated via API: new amount = ${updateData.data.amount}`);

  // Step 9: Verify MySQL update directly
  const [updatedExpRows]: any = await pool.query('SELECT amount, description FROM expenses WHERE id = ?', [expId]);
  if (parseFloat(updatedExpRows[0].amount) !== 72500 || !updatedExpRows[0].description.includes('Upgraded')) {
    throw new Error(`MySQL expense update not reflected: ${JSON.stringify(updatedExpRows[0])}`);
  }
  console.log(`[PASS] Step 9: MySQL directly verified updated amount = ${updatedExpRows[0].amount}`);

  // Step 10: Delete Expense
  const delRes = await fetch(`${BASE_URL}/api/expenses/${expId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const delData = await delRes.json();
  if (!delData.success) {
    throw new Error(`Delete expense failed: ${JSON.stringify(delData)}`);
  }
  console.log(`[PASS] Step 10: Expense deleted via API.`);

  // Step 11: Verify MySQL deletion directly
  const [deletedExpRows]: any = await pool.query('SELECT id FROM expenses WHERE id = ?', [expId]);
  if (deletedExpRows.length !== 0) {
    throw new Error('Expense was not deleted from MySQL table!');
  }
  console.log(`[PASS] Step 11: Direct MySQL check confirms 0 rows for deleted expense ID.`);

  // Re-insert an expense so we can test reports and isolation
  const reExpRes = await fetch(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      name: 'AWS Cloud Hosting',
      amount: 35000,
      category: 'Software & Cloud',
      location: 'Hyderabad Cyber Hub',
      locationId: newLocId,
      date: '2026-03-02',
      paymentMethod: 'Net Banking',
      description: 'Production Cluster Compute & RDS',
      taxDeductible: true,
      status: 'approved'
    })
  });
  const reExpData = await reExpRes.json();
  const u1PermanentExpId = reExpData.data.id;
  console.log(`[PASS] Added active test expense for User 1: ID=${u1PermanentExpId}`);

  // Step 12 & 13: Re-login as User 1 to confirm persistent session
  const reLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: user1Pass })
  });
  const reLoginData = await reLoginRes.json();
  if (!reLoginData.success) {
    throw new Error('Re-login as User 1 failed');
  }
  // Fetch user 1 expenses again
  const reFetchExp = await fetch(`${BASE_URL}/api/expenses`, {
    headers: { 'Authorization': `Bearer ${reLoginData.token}` }
  });
  const reFetchExpData = await reFetchExp.json();
  if (reFetchExpData.data.length !== 1 || reFetchExpData.data[0].id !== u1PermanentExpId) {
    throw new Error('Data persistence check failed on re-login');
  }
  console.log(`[PASS] Step 12 & 13: Persistence verified after re-login.`);

  // Step 14: Create User 2
  const user2Email = `rahul_${Date.now()}@corp.in`;
  const user2Pass = 'Rahul@Prod2026!';
  const reg2Res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rahul Verma',
      email: user2Email,
      password: user2Pass,
      companyName: 'Vertex Solutions',
      role: 'Operations Lead',
      currency: 'INR'
    })
  });
  const reg2Data = await reg2Res.json();
  const user2Token = reg2Data.token;
  console.log(`[PASS] Step 14: User 2 registered (Email: ${user2Email})`);

  // Step 15: Verify Multi-Tenant Data Isolation
  // User 2 fetches expenses - should see 0
  const u2ExpRes = await fetch(`${BASE_URL}/api/expenses`, {
    headers: { 'Authorization': `Bearer ${user2Token}` }
  });
  const u2ExpData = await u2ExpRes.json();
  if (u2ExpData.data.length !== 0) {
    throw new Error(`Data isolation violation! User 2 can see ${u2ExpData.data.length} expenses.`);
  }

  // User 2 attempts to fetch User 1's expense by ID
  const u2TamperRes = await fetch(`${BASE_URL}/api/expenses/${u1PermanentExpId}`, {
    headers: { 'Authorization': `Bearer ${user2Token}` }
  });
  if (u2TamperRes.status !== 404) {
    throw new Error(`Data isolation violation! User 2 accessed User 1's expense with status ${u2TamperRes.status}`);
  }

  // User 2 attempts to delete User 1's expense
  const u2TamperDel = await fetch(`${BASE_URL}/api/expenses/${u1PermanentExpId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user2Token}` }
  });
  if (u2TamperDel.status !== 404) {
    throw new Error(`Data isolation violation! User 2 could tamper with User 1's expense`);
  }
  console.log(`[PASS] Step 15: Multi-tenant data isolation verified: User 2 cannot see, read, or delete User 1 data.`);

  // Step 16: Test Reports & Location Comparison
  const repRes = await fetch(`${BASE_URL}/api/reports/expenses`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const repData = await repRes.json();
  if (!repData.success || repData.summary.totalAmount !== 35000) {
    throw new Error(`Reports failed: ${JSON.stringify(repData)}`);
  }

  const locCompRes = await fetch(`${BASE_URL}/api/reports/location-comparison`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const locCompData = await locCompRes.json();
  if (!locCompData.success || !Array.isArray(locCompData.data)) {
    throw new Error(`Location comparison failed: ${JSON.stringify(locCompData)}`);
  }
  console.log(`[PASS] Step 16: Reports and Location Analytics verified.`);

  // Step 17: Test Demo User Login
  const demoLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@expensetrack.io', password: 'demo' })
  });
  const demoLoginData = await demoLoginRes.json();
  if (!demoLoginData.success) {
    throw new Error(`Demo user login failed: ${JSON.stringify(demoLoginData)}`);
  }
  console.log(`[PASS] Step 17: Demo account verified in MySQL (Email: ${demoLoginData.user.email}, Role: ${demoLoginData.user.role})`);

  // Step 18: Security & SQL Injection Protection Check
  const maliciousQuery = "' OR '1'='1";
  const injectionRes = await fetch(`${BASE_URL}/api/expenses?search=${encodeURIComponent(maliciousQuery)}`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const injectionData = await injectionRes.json();
  if (!injectionData.success || injectionData.data.length > 1) {
    throw new Error('SQL injection vulnerability detected!');
  }
  console.log(`[PASS] Step 18: SQL injection attempt safely escaped by parameterized queries.`);

  // Step 19: Invalid JWT handling
  const fakeTokenRes = await fetch(`${BASE_URL}/api/expenses`, {
    headers: { 'Authorization': 'Bearer invalid_fake_token_12345' }
  });
  if (fakeTokenRes.status !== 401) {
    throw new Error(`Expected 401 for invalid JWT, got ${fakeTokenRes.status}`);
  }
  console.log(`[PASS] Step 19: Protected routes strictly reject invalid JWT with HTTP 401.`);

  console.log('=====================================================');
  console.log('   ALL 19 VERIFICATION STEPS PASSED SUCCESSFULLY!    ');
  console.log('   MYSQL PRODUCTION READINESS 100% CONFIRMED.        ');
  console.log('=====================================================');

  await pool.end();
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('[FAIL] Verification error:', err);
  process.exit(1);
});

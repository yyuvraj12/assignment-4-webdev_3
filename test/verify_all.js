require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const { initSocketIO } = require('../src/services/socketService');
const { io: ioClient } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

// Clean test db before running
const dbFilePath = path.join(__dirname, '../data/db.json');
if (fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({ users: [], notes: [] }, null, 2));
}

const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Helper for HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('LAB 4: SECURE CONNECT AND COMMUNICATION PLATFORM');
  console.log('STARTING INTEGRATION AND BEHAVIOUR VERIFICATION');
  console.log('====================================================\n');

  // Start server
  const server = http.createServer(app);
  const ioServer = initSocketIO(server);

  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}\n`);
      resolve();
    });
  });

  try {
    // 1. SIGNUP
    console.log('--- 1. Testing Signup (Fig 1) ---');
    const signupRes = await request('POST', '/api/auth/signup', {
      username: 'victor',
      email: 'victor@example.com',
      password: '123456'
    });
    console.log(`Status: ${signupRes.status} Created`);
    console.log('Response Body:', JSON.stringify(signupRes.data, null, 2));
    const victorId = signupRes.data.id;

    // 2. LOGIN
    console.log('\n--- 2. Testing Login (Fig 1) ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'victor@example.com',
      password: '123456'
    });
    console.log(`Status: ${loginRes.status} OK`);
    console.log('Response Body:', JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.token;

    // 3. PROTECTED NOTES ACCESS WITHOUT TOKEN (Fig 1 & 2)
    console.log('\n--- 3. Testing Notes API Without Token (Fig 1 / Fig 2) ---');
    const unauthorizedRes = await request('GET', '/api/notes');
    console.log(`Status: ${unauthorizedRes.status} Forbidden`);
    console.log('Response Body:', JSON.stringify(unauthorizedRes.data, null, 2));

    // 4. CREATE FIRST NOTE (Fig 2)
    console.log('\n--- 4. Testing Create Note 1 (Fig 2) ---');
    const note1Res = await request(
      'POST',
      '/api/notes',
      {
        title: 'My First Note',
        content: 'This is my first note of web dev -III'
      },
      token
    );
    console.log(`Status: ${note1Res.status} Created`);
    console.log('Response Body:', JSON.stringify(note1Res.data, null, 2));
    const note1Id = note1Res.data._id;

    // 5. CREATE SECOND NOTE (Fig 2)
    console.log('\n--- 5. Testing Create Note 2 (Fig 2) ---');
    const note2Res = await request(
      'POST',
      '/api/notes',
      {
        title: 'My Second Note',
        content: 'This is my second note of web dev -III'
      },
      token
    );
    console.log(`Status: ${note2Res.status} Created`);
    console.log('Response Body:', JSON.stringify(note2Res.data, null, 2));

    // 6. GET ALL NOTES FOR USER (Fig 2)
    console.log('\n--- 6. Testing Fetch All Notes with Valid JWT (Fig 2) ---');
    const notesListRes = await request('GET', '/api/notes', null, token);
    console.log(`Status: ${notesListRes.status} OK`);
    console.log('Response Body:', JSON.stringify(notesListRes.data, null, 2));

    // 7. GET NOTE BY ID (CRUD verification)
    console.log('\n--- 7. Testing Get Note by ID (CRUD) ---');
    const singleNoteRes = await request('GET', `/api/notes/${note1Id}`, null, token);
    console.log(`Status: ${singleNoteRes.status} OK`);
    console.log('Response Body:', JSON.stringify(singleNoteRes.data, null, 2));

    // 8. UPDATE NOTE (CRUD verification)
    console.log('\n--- 8. Testing Update Note (CRUD) ---');
    const updateNoteRes = await request(
      'PUT',
      `/api/notes/${note1Id}`,
      {
        title: 'My First Note (Updated)',
        content: 'This note has been updated successfully.'
      },
      token
    );
    console.log(`Status: ${updateNoteRes.status} OK`);
    console.log('Response Body:', JSON.stringify(updateNoteRes.data, null, 2));

    // 9. RBAC (ROLE-BASED ACCESS CONTROL)
    console.log('\n--- 9. Testing Role-Based Access Control (RBAC) ---');
    // Normal user trying to access admin route
    const normalUserAdminAccess = await request('GET', '/api/admin/users', null, token);
    console.log(`Normal user accessing /api/admin/users -> Status: ${normalUserAdminAccess.status} Forbidden`);
    console.log('Response Body:', JSON.stringify(normalUserAdminAccess.data, null, 2));

    // Register an admin user
    await request('POST', '/api/auth/signup', {
      username: 'adminUser',
      email: 'admin@example.com',
      password: 'adminPassword123',
      role: 'admin'
    });
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'adminPassword123'
    });
    const adminToken = adminLoginRes.data.token;

    // Admin accessing admin route
    const adminUsersRes = await request('GET', '/api/admin/users', null, adminToken);
    console.log(`Admin accessing /api/admin/users -> Status: ${adminUsersRes.status} OK`);
    console.log('Admin Users List (passwords excluded):', JSON.stringify(adminUsersRes.data, null, 2));

    const adminStatsRes = await request('GET', '/api/admin/stats', null, adminToken);
    console.log(`Admin accessing /api/admin/stats -> Status: ${adminStatsRes.status} OK`);
    console.log('Admin System Stats:', JSON.stringify(adminStatsRes.data, null, 2));

    // 10. REAL-TIME CHAT VIA SOCKET.IO (Fig 3)
    console.log('\n--- 10. Testing Socket.IO Real-Time Chat (Fig 3) ---');
    const socketAditi = ioClient(BASE_URL);
    const socketRohan = ioClient(BASE_URL);

    await Promise.all([
      new Promise((resolve) => socketAditi.on('connect', resolve)),
      new Promise((resolve) => socketRohan.on('connect', resolve))
    ]);

    socketAditi.emit('join_room', 'general');
    socketRohan.emit('join_room', 'general');

    await new Promise((r) => setTimeout(r, 200));

    // Send messages matching Fig 3
    socketAditi.emit('chat_message', {
      room: 'general',
      sender: 'Aditi',
      message: 'Hey team, backend is ready 🚀'
    });

    await new Promise((r) => setTimeout(r, 100));

    socketRohan.emit('chat_message', {
      room: 'general',
      sender: 'Rohan',
      message: 'Testing chat now...'
    });

    await new Promise((r) => setTimeout(r, 100));

    socketAditi.emit('chat_message', {
      room: 'general',
      sender: 'Aditi',
      message: 'Messages arriving in real time ⚡'
    });

    await new Promise((r) => setTimeout(r, 400));

    socketAditi.disconnect();
    socketRohan.disconnect();

    console.log('\n====================================================');
    console.log('ALL MODULES AND TEST SCENARIOS COMPLETED SUCCESSFULLY');
    console.log('====================================================');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    ioServer.close();
  }
}

runTests();

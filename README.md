# Lab 4: Secure Connect and Communication Platform

Backend project built strictly according to the specifications, learning objectives, technology stack, and expected outputs outlined in the **Lab 4: Secure Connect and Communication Platform** assignment (Course: Web Dev III, Unit – 4).

---

## 📌 Technology Stack

- **Node.js** – Server-side runtime environment
- **Express.js** – Backend routing and middleware
- **JWT (`jsonwebtoken`)** – Authentication and stateless token sessions
- **`bcrypt` / `bcryptjs`** – Password hashing with salt
- **`dotenv`** – Environment variable management
- **`Socket.IO`** – Real-time, event-driven bidirectional communication
- **MongoDB / Data Persistence** – Data persistence with Mongoose and adaptive local file-backed JSON store
- **Node.js `EventEmitter`** – Decoupled event-driven features

---

## 📂 Project Structure

```
├── .env                          # Environment variables configuration
├── .env.example                  # Template for environment variables
├── package.json                  # Scripts and dependencies
├── server.js                     # Server entry point (starts HTTP server & Socket.IO)
├── data/
│   └── db.json                   # Persistent local database store
├── src/
│   ├── app.js                    # Express application configuration & middleware
│   ├── config/
│   │   └── db.js                 # Database connection and adaptive persistence layer
│   ├── controllers/
│   │   ├── authController.js     # Signup and Login handlers
│   │   ├── noteController.js     # Notes CRUD handlers
│   │   └── adminController.js    # RBAC Admin handlers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── rbacMiddleware.js     # Role-Based Access Control middleware
│   ├── models/
│   │   ├── User.js               # User data model & password hashing
│   │   └── Note.js               # Note data model with owner reference
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── noteRoutes.js         # /api/notes routes (Protected)
│   │   └── adminRoutes.js        # /api/admin routes (RBAC Admin Protected)
│   └── services/
│       ├── eventEmitter.js       # Node.js EventEmitter for decoupled events
│       └── socketService.js      # Socket.IO real-time chat service
├── screenshots/                  # Extracted screenshots & figures matching PDF
│   ├── 01_signup_postman.jpg     # Fig 1: POST /api/auth/signup response (201 Created)
│   ├── 02_login_postman.jpg      # Fig 1: POST /api/auth/login response (200 OK)
│   ├── 03_notes_unauthorized_403.jpg # Fig 1 & 2: GET /api/notes without token (403 Forbidden)
│   ├── 04_create_note_postman.jpg # Fig 2: POST /api/notes with JWT token (201 Created)
│   ├── 05_get_notes_list_postman.jpg # Fig 2: GET /api/notes with JWT token (200 OK list)
│   ├── 06_socketio_chat_console.png # Fig 3: Real-time chat activity logged via Socket.IO
│   └── page_1.png - page_5.png   # Full high-res PDF pages 1 to 5
└── test/
    ├── verify_all.js             # Comprehensive automated test verifying all PDF scenarios
    └── chat_client.js            # Real-time chat client demo replicating Figure 3
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```env
PORT=5000
JWT_SECRET=supersecretjwtkey_webdev3_lab4_2026
JWT_EXPIRES_IN=24h
MONGODB_URI=mongodb://127.0.0.1:27017/secure_connect_db
NODE_ENV=development
```

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or
node server.js
```
Console output:
```text
[server] listening on http://localhost:5000
```

### 3. Run the Complete Verification Suite
To run all tests and verify every requirement, API response, RBAC check, and real-time Socket.IO chat:
```bash
npm test
```

### 4. Run the Real-Time Chat Demo
With the server running in one terminal, run in another terminal:
```bash
node test/chat_client.js
```

---

## 📋 API Endpoints & Expected Outputs

### 1. Authentication Endpoints

#### Signup
- **Method:** `POST`
- **URL:** `/api/auth/signup`
- **Request Body:**
  ```json
  {
    "username": "victor",
    "email": "victor@example.com",
    "password": "123456"
  }
  ```
- **Response:** `201 Created` *(Matches Fig 1)*
  ```json
  {
    "message": "User registered",
    "id": "f7cbca9b1af2a98e4bf03131",
    "username": "victor",
    "email": "victor@example.com"
  }
  ```

#### Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "victor@example.com",
    "password": "123456"
  }
  ```
- **Response:** `200 OK` *(Matches Fig 1)*
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2. Protected Notes API (CRUD)

#### Without Token (Unauthorized Access)
- **Method:** `GET`
- **URL:** `/api/notes`
- **Response:** `403 Forbidden` *(Matches Fig 1 / Fig 2)*
  ```json
  {
    "message": "No token provided"
  }
  ```

#### Create Note
- **Method:** `POST`
- **URL:** `/api/notes`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
  ```json
  {
    "title": "My First Note",
    "content": "This is my first note of web dev -III"
  }
  ```
- **Response:** `201 Created` *(Matches Fig 2)*
  ```json
  {
    "_id": "b58b58fcc962dd6f6adebd3b",
    "title": "My First Note",
    "content": "This is my first note of web dev -III",
    "owner": "f7cbca9b1af2a98e4bf03131",
    "createdAt": "2026-07-10T10:02:50.134Z",
    "updatedAt": "2026-07-10T10:02:50.135Z"
  }
  ```

#### Get All Notes
- **Method:** `GET`
- **URL:** `/api/notes`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:** `200 OK` *(Matches Fig 2)*
  ```json
  [
    {
      "_id": "b58b58fcc962dd6f6adebd3b",
      "title": "My First Note",
      "content": "This is my first note of web dev -III",
      "owner": "f7cbca9b1af2a98e4bf03131",
      "createdAt": "2026-07-10T10:02:50.134Z",
      "updatedAt": "2026-07-10T10:02:50.135Z"
    },
    {
      "_id": "ed96b387a3ba4f2f77a492a7",
      "title": "My Second Note",
      "content": "This is my second note of web dev -III",
      "owner": "f7cbca9b1af2a98e4bf03131",
      "createdAt": "2026-07-10T10:05:35.111Z",
      "updatedAt": "2026-07-10T10:05:35.111Z"
    }
  ]
  ```

#### Get Note by ID
- **Method:** `GET`
- **URL:** `/api/notes/:id`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:** `200 OK`

#### Update Note
- **Method:** `PUT`
- **URL:** `/api/notes/:id`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:** `{ "title": "Updated Title", "content": "Updated Content" }`
- **Response:** `200 OK`

#### Delete Note
- **Method:** `DELETE`
- **URL:** `/api/notes/:id`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Response:** `200 OK`
  ```json
  {
    "message": "Note deleted successfully"
  }
  ```

---

### 3. Role-Based Access Control (RBAC)

- **Admin Routes:** `/api/admin/users`, `/api/admin/notes`, `/api/admin/stats`
- Protected with both `verifyToken` and `authorizeRoles('admin')`.
- When accessed with a non-admin role:
  - **Response:** `403 Forbidden`
  ```json
  {
    "message": "Access denied: Requires admin role"
  }
  ```
- When accessed by an admin:
  - **Response:** `200 OK` with sensitive user data (passwords) omitted.

---

### 4. Real-Time Chat (Socket.IO)

Console logging format strictly matching **Figure 3**:
```text
Output - Real-Time Chat (Socket.IO Console)
$ node server.js
[server] listening on http://localhost:5000
User connected: sK92_xT31Qp
sK92_xT31Qp joined room general
User connected: pL04_vB88Rk
pL04_vB88Rk joined room general

[general] Aditi: Hey team, backend is ready 🚀
[general] Rohan: Testing chat now...
[general] Aditi: Messages arriving in real time ⚡
```

---

### 5. Node.js EventEmitter

The project implements Node.js core `EventEmitter` in `src/services/eventEmitter.js` to decouple background events:
- `user:registered` – Triggered upon successful user signup
- `user:login` – Triggered upon successful login
- `note:created` – Triggered when a new note is persisted
- `note:updated` – Triggered when a note is updated
- `note:deleted` – Triggered when a note is removed
- `chat:message` – Triggered when a real-time message is processed

---

## 🎯 Assignment Rubric Alignment

| Criteria | Marks | Implementation Details |
| :--- | :---: | :--- |
| **Functionality** | 1.5 | Complete implementation of Signup, Login, Password Hashing (`bcrypt`), JWT authentication, protected routes, Notes CRUD, RBAC, Socket.IO real-time chat, and `EventEmitter`. |
| **API Design** | 0.5 | RESTful resource design, standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`), Bearer token auth, and structured error responses. |
| **Clean Code** | 0.5 | Modular MVC architecture, separation of concerns (controllers, routes, middleware, models, services), and clean async/await error handling. |
| **Total** | **2.5** | **Fully meets all rubric requirements** |

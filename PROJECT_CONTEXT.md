# DeadlineHub — Project Context

## Project Overview

DeadlineHub is a centralized academic deadline and announcement platform for college students.

The purpose is to replace scattered academic updates from WhatsApp groups, CR messages, faculty messages and other sources with one organized place for class-related deadlines, reminders and announcements.

The application should immediately help students answer:

- What's due?
- What's coming up?
- What's changed?
- What's important?

---

## Core Product Rule

DeadlineHub is an information and reminder platform.

It is NOT:

- An assignment submission platform
- A complete LMS
- A college ERP
- A chat application

Students do NOT submit assignments through DeadlineHub.

There must be NO "Submit", "Upload", or "Turn In" functionality.

---

## User Roles

### Student

Students will eventually be able to:

- Register and login
- Identify themselves using college email / student code
- Join their class/division
- View deadlines
- View announcements
- Search and filter information

### Teacher / Admin / CR

Teacher, Admin and CR use the administrative permission level in the initial version.

They will eventually be able to:

- Login
- Manage classes/divisions
- Approve student join requests
- Add students using email or student code
- Add and manage deadlines
- Add and manage announcements
- Manage subjects

---

## Class Membership

Students belong to a class/division.

Example:

- Branch: Information Technology
- Semester: 5
- Division: D15C

Students can join using a class code.

Example:

`D15C-5IT`

Flow:

Student registers  
→ Enters class code  
→ Join request created  
→ Teacher/Admin/CR approves  
→ Student gets access to class information

Students can be identified using:

- College email
- Student code / roll number

---

## Content Targeting

Deadlines and announcements may eventually target:

- One division
- Multiple divisions
- All relevant divisions

---

## Development Strategy

DeadlineHub is ONE evolving Full Stack project.

Each Full Stack laboratory experiment represents one development stage.

Future experiment functionality must NOT be implemented early.

---

## Experiment Roadmap

- Experiment 1 — Tailwind CSS
- Experiment 2 — React Hooks
- Experiment 3 — Context API / Redux
- Experiment 4 — MongoDB + Mongoose
- Experiment 5 — Secure REST APIs
- Experiment 6 — JWT Authentication & Roles
- Experiment 7 — Postman API Testing ✅
- Experiment 8 — WebSockets / Socket.IO
- Experiment 9 — CI/CD & Deployment
- Experiment 10 — Docker

---

## Current Stage

Experiment 1 — COMPLETED
Experiment 2 — COMPLETED
Experiment 3 — COMPLETED
Experiment 4 — MongoDB + Mongoose Integration — COMPLETED
Experiment 5 — Secure REST APIs — COMPLETED
Experiment 6 — JWT Authentication & Role-Based Access — COMPLETED
Experiment 7 — Postman API Testing — COMPLETED
Experiment 8 — WebSockets / Socket.IO — IN PROGRESS (E8-001, E8-002, E8-003 Completed)

### Experiment 7 Status (Completed)

- **E7-001 — Postman Collection & Testing Setup**: COMPLETED ✅
  * Created complete Postman v2.1.0 collection (`postman/DeadlineHub_API.postman_collection.json`) structured into `Auth`, `Deadlines` (GET, POST, PUT, DELETE), and `Announcements` (GET, POST, PUT, DELETE).
  * Created Postman environment file (`postman/DeadlineHub_Environment.postman_environment.json`) utilizing `baseUrl`, `token`, `teacherToken`, and `studentToken` placeholders without committing credentials or secrets.
  * Authored comprehensive test documentation in `docs/POSTMAN_API_TESTING.md`.
- **E7-002 — Validate GET APIs**: COMPLETED ✅
  * Validated `GET /api/deadlines` (200 OK) with Bearer token authentication.
  * Validated `GET /api/deadlines/:id` (200 OK) for single deadline retrieval.
  * Validated `GET /api/announcements` (200 OK) with Bearer token authentication.
  * Validated `GET /api/announcements/:id` (200 OK) for single announcement retrieval.
  * Validated missing token negative tests across endpoints returning controlled 401 Unauthorized.
  * Validated malformed ID negative tests returning controlled 400 Bad Request (`Invalid ID format`).
  * Validated nonexistent valid ObjectId negative tests returning controlled 404 Not Found (`Resource not found`).
- **E7-003 — Validate POST APIs**: COMPLETED ✅
  * Validated `POST /api/deadlines` with teacher JWT creating resource and returning 201 Created.
  * Validated `POST /api/announcements` with teacher JWT creating resource and returning 201 Created.
  * Verified MongoDB persistence for created resources.
  * Validated missing required fields returning controlled 400 Bad Request.
  * Validated invalid payload data (malformed date, whitespace title/message) returning 400 Bad Request.
  * Validated missing JWT returning 401 Unauthorized across POST routes.
  * Validated student JWT rejection with 403 Forbidden.
- **E7-004 — Validate PUT & DELETE APIs**: COMPLETED ✅
  * Validated `PUT /api/deadlines/:id` and `PUT /api/announcements/:id` with teacher JWT successfully updating MongoDB documents (200 OK).
  * Validated `DELETE /api/deadlines/:id` and `DELETE /api/announcements/:id` with teacher JWT successfully removing documents (200 OK).
  * Verified MongoDB document deletion via subsequent GET returning 404 Not Found.
  * Validated malformed ID on PUT/DELETE returning controlled 400 Bad Request (`Invalid ID format`).
  * Validated nonexistent valid ObjectId on PUT/DELETE returning controlled 404 Not Found (`Resource not found`).
  * Validated student JWT on PUT/DELETE returning 403 Forbidden.
  * Validated missing JWT on PUT/DELETE returning 401 Unauthorized.
- **E7-005 — JWT Authentication Testing**: COMPLETED ✅
  * Validated `POST /api/auth/login` with valid Student credentials (200 OK, JWT returned with student role).
  * Validated `POST /api/auth/login` with valid Teacher credentials (200 OK, JWT returned with teacher role).
  * Validated wrong password returning 401 Unauthorized (`Invalid email or password`).
  * Validated unknown email returning 401 Unauthorized (`Invalid email or password`).
  * Validated missing email/password returning 400 Bad Request (`Please provide email and password`).
  * Validated `GET /api/auth/me` without Authorization header returning 401 Unauthorized.
  * Validated `GET /api/auth/me` with invalid JWT returning 401 Unauthorized (`Invalid token. Authentication failed.`).
  * Validated `GET /api/auth/me` with valid Student JWT (200 OK) and valid Teacher JWT (200 OK).
- **E7-006 — Role-Based Authorization Testing**: COMPLETED ✅
  * Validated Student token allows read access: `GET /api/deadlines` (200 OK) and `GET /api/announcements` (200 OK).
  * Validated Student token rejected with 403 Forbidden on mutations: POST, PUT, DELETE for deadlines and announcements.
  * Validated Teacher token allows full CRUD: GET (200), POST (201), PUT (200), DELETE (200) for deadlines and announcements.
  * Verified critical distinction: 401 = Unauthenticated (no/invalid JWT), 403 = Unauthorized role (authenticated student attempting teacher action).

### Experiment 8 Progress

- **E8-001 — Socket.IO Backend Setup**: COMPLETED ✅
  * Installed `socket.io` package on the backend server.
  * Refactored `server/src/server.js` to use native `http.createServer(app)` instead of `app.listen`.
  * Attached `socket.io` `Server` instance to the native HTTP server so WebSocket and REST share port 5000.
  * Socket.IO CORS configured to match existing `allowedOrigins` whitelist (`http://localhost:5173`, `http://127.0.0.1:5173`).
  * Connection and disconnection events logged with socket ID and reason.
  * `io` instance exposed on the Express app (`app.set('io', io)`) for future route-level event emission.
  * All existing REST APIs, Helmet, CORS, JWT auth, validation, and centralized error handling remain fully intact and tested.
  * Socket.IO polling handshake verified: `GET /socket.io/?EIO=4&transport=polling` → 200 OK with valid `sid`.
- **E8-002 — Socket.IO Frontend Connection**: COMPLETED ✅
  * Installed `socket.io-client` package on the frontend.
  * Created `src/context/SocketContext.jsx` with `SocketProvider` component and `useSocket` hook.
  * `SocketProvider` manages Socket.IO client lifecycle: creates socket on mount, disconnects on unmount.
  * `connected` boolean state tracks live connection status.
  * `connect`, `disconnect`, and `connect_error` events logged to console for observability.
  * `useSocket()` hook exposes `{ socket, connected }` with provider guard.
  * `SocketProvider` added to `src/main.jsx` provider tree (inside `AuthProvider`, wrapping `DeadlineProvider`).
  * Frontend builds cleanly with 74 modules including `socket.io-client` (build verified, 0 errors).
- **E8-003 — Real-Time Deadline & Announcement Updates**: COMPLETED ✅
  * Connected backend REST route handlers to Socket.IO using `req.app.get('io')`.
  * Emitted real-time events upon successful teacher CRUD operations:
    - `POST /api/deadlines` → `deadline:created` (saved deadline document)
    - `PUT /api/deadlines/:id` → `deadline:updated` (updated deadline document)
    - `DELETE /api/deadlines/:id` → `deadline:deleted` (`{ _id: id }`)
    - `POST /api/announcements` → `announcement:created` (saved announcement document)
    - `PUT /api/announcements/:id` → `announcement:updated` (updated announcement document)
    - `DELETE /api/announcements/:id` → `announcement:deleted` (`{ _id: id }`)
  * REST APIs remain strictly responsible for validation, authentication, authorization, and CRUD; Socket.IO only broadcasts successful changes.
  * Updated `DeadlineContext.jsx` and `AnnouncementContext.jsx` to listen for real-time events via `useSocket()`.
  * Implemented client-side deduplication on `created` events by checking if `_id` already exists in state, preventing duplicate records when the initiating client updates state via REST response and receives its own broadcast.
  * Changes reflect instantaneously in other connected browser sessions without requiring page refresh.
  * Proper cleanup registered in `useEffect` returning `socket.off(...)` to avoid memory leaks.
  * Notifications explicitly deferred to E8-004 per requirements.
  * Verified all 6 real-time events end-to-end via automated test script.
  * Production frontend build verified cleanly (`npm run build`).



---

## Full-Screen App Welcome Screen (UI Enhancement)

A full-screen application Welcome Screen was added as a UI enhancement after Experiment 2.

- `src/components/AppWelcome.jsx` — application-style full viewport Welcome Screen (top-left DeadlineHub branding, single primary "Get Started →" CTA, compact right-side academic visual, 3 subtle benefits, zero SaaS marketing layout/links)
- Application starts at: App Welcome Screen → Role Selection → Student / Teacher-Admin flow
- Primary action: "Get Started →" opens existing Role Selection screen
- Experiment 1 and Experiment 2 functionality remain fully unchanged
- No backend, database, authentication, or new dependencies were introduced

---

## Completed Foundation

- GitHub repository created
- Repository cloned locally
- React + Vite initialized
- Dependencies installed
- Development server verified
- Project documentation structure created
- Stage 0 foundation committed and pushed to GitHub

---

## Experiment Progress

### Completed

- DH-001 — Tailwind CSS configured and verified
- DH-002 — Default Vite starter cleaned
- DH-003 — Establish DeadlineHub Design System
- DH-004 — Responsive Student Navigation
- DH-005 — Shared UI Components
- DH-006 — Deadline Card
- DH-007 — Announcement Card
- DH-008 — Student Dashboard
- DH-009 — Dashboard Responsiveness
- DH-010 — Deadlines Page
- DH-011 — Announcements Page
- DH-012 — Welcome / Role Selection
- DH-013 — Student Login UI
- DH-014 — Student Registration UI
- DH-015 — Teacher/Admin Login UI
- DH-016 — Join Class UI
- DH-017 — Teacher/Admin Layout
- DH-018 — Classes Page
- DH-019 — Join Requests UI
- DH-020 — Deadline Management UI
- DH-021 — Announcement Management UI
- DH-022 — Responsive Review
- DH-023 — UI Consistency Review
- DH-024 — Scope Review
- EH-001 — Experiment 2 Setup
- EH-002 — Deadline Urgency Calculation
- EH-003 — Deadline Search
- EH-004 — Deadline Filters
- EH-005 — Announcement Search
- EH-006 — Announcement Filters
- EH-007 — Add/Edit Forms with useState
- EH-008 — Dashboard Derived Data
- EH-009 — useEffect-based UI Updates
- EH-010 — Experiment 2 Final Review
- E3-001 through E3-010 — Experiment 3 Complete
- E4-001 — Backend + Express Setup
- E4-002 — MongoDB + Mongoose Connection
- E4-003 — Deadline Model & REST API
- E4-004 — Announcement Model & REST API
- E4-005 — Connect Deadline Context to REST API
- E4-006 — Connect Announcement Context to REST API
- E4-007 — Persistence & Error Handling
- E4-008 — Experiment 4 Final Review

### Current Stage

Experiment 1 — COMPLETED
Experiment 2 — COMPLETED
Experiment 3 — COMPLETED
Experiment 4 — MongoDB + Mongoose Integration — COMPLETED
Experiment 5 — Secure REST APIs — COMPLETED
- E5-001 — Request Validation (Deadlines & Announcements): COMPLETED ✅
- E5-002 — Centralized Error Handling & Safe 404 Middleware: COMPLETED ✅
- E5-003 — Security Middleware (Helmet, disabled x-powered-by): COMPLETED ✅
- E5-004 — Safer CORS (origin whitelist) & Request Size Limits (100kb): COMPLETED ✅
- UI Foundation & Core Screens Redesign (Light/Dark mode, manual Switch Role removed): COMPLETED ✅

Experiment 6 — JWT Authentication & Role-Based Access — COMPLETED ✅
- E6-001 — User Model + Authentication Structure: COMPLETED ✅
  * MongoDB/Mongoose User model created with core & student fields
  * Lowercase unique email, role enum ('student', 'teacher'), timestamps
  * Passwords strictly stripped from responses via sanitized toJSON
  * Authentication route structure mounted at `/api/auth`
- E6-002 — User Registration + Password Hashing: COMPLETED ✅
  * Password hashing implemented using bcryptjs (10 salt rounds)
  * POST `/api/auth/register` endpoint with payload validation
  * Controlled 409 duplicate email rejection
  * Connected existing Student Registration screen with real-time feedback
- E6-003 — Login + JWT Generation: COMPLETED ✅
  * POST `/api/auth/login` endpoint verifying bcrypt hash
  * JWT generation with 1-day expiration and `{ id, role }` payload
  * Connected Student Login & Teacher Login screens to backend authentication
- E6-004 — Auth Middleware & Protected Routes: COMPLETED ✅
  * `authMiddleware` verifying `Bearer <token>` against `process.env.JWT_SECRET`
  * Protected `GET /api/auth/me` user profile endpoint
  * Protected `/api/deadlines` and `/api/announcements` routes
  * Frontend `AuthContext` with persistent session restoration via `localStorage`
  * Automatic `Authorization: Bearer <token>` injection in `api.js`
- E6-005 — Role-Based Access Control: COMPLETED ✅
  * `requireRole` middleware created in `server/src/middleware/roleMiddleware.js`
  * POST, PUT, DELETE on `/api/deadlines` and `/api/announcements` restricted to `teacher` role
  * Students retain GET access; 403 Forbidden returned for unauthorized write attempts
  * Frontend role-based routing already correct (teacher role from JWT, no manual selection)
  * Management pages (Deadlines/Announcements) accessible only to teacher role
  * Mobile management table action buttons always visible on touch devices
- E6-006 — Logout + Persistent Session + Real Profile: COMPLETED ✅
  * Logout clears token, user state, and resets activeTab to prevent stale navigation
  * Session restoration via `GET /api/auth/me` on startup (implemented in E6-004, verified)
  * StudentDashboard receives real `user.name` from AuthContext
  * Mobile avatar initial derived from real user name
  * Announcements `postedBy` field uses real authenticated teacher name
- E6-007 — Final Auth / Mobile / UX Verification: COMPLETED ✅
  * Verified Student read-only API access and absence of teacher controls
  * Verified Teacher login and complete CRUD operations on deadlines and announcements
  * Verified persistent session restoration, clean logout, and invalid token fallback
  * Verified user profile rendering from JWT/AuthContext and 0% password/hash exposure
  * Verified responsive mobile layouts, unclipped button icons, and safe bottom navigation padding
- E6-008 — Final Documentation / Completion Status: COMPLETED ✅
  * PROJECT_CONTEXT.md and docs/FEATURE_TICKETS.md updated
  * Experiment 6 finalized and marked COMPLETE

### Current Task

Experiment 8 — WebSockets / Socket.IO (E8-001, E8-002 Completed)
- E8-001 — Socket.IO Backend Setup: DONE
- E8-002 — Socket.IO Frontend Connection: DONE
- Next Tickets: E8-003+ (Do NOT begin until explicitly instructed)

---

## Current Technologies

- React (Frontend UI)
- Vite (Frontend Build Tool)
- Tailwind CSS (Styling)
- Node.js & Express (Backend REST API)
- MongoDB Atlas (Cloud Database)
- Mongoose (ODM / Schema & Models)
- JSON Web Tokens (JWT) & bcryptjs (Authentication & Password Security)
- Socket.IO (WebSockets — server: `socket.io`, client: `socket.io-client`)
- Git & GitHub (Version Control)

---

## Current Frontend & Backend State

Experiments 1, 2, 3, 4, 5, and 6 are fully complete.
The application is a full stack web application featuring:
- React + Vite frontend with Tailwind CSS and responsive Light/Dark modes.
- React Context API (`DeadlineContext`, `AnnouncementContext`, `AuthContext`) managing global state and auth.
- Native `fetch` client (`src/api/api.js`) communicating with Express REST API on `http://localhost:5000/api` with automatic Bearer token injection.
- Node.js / Express backend with CORS origin whitelisting, request limits, Helmet security headers, and centralized error handling.
- Mongoose models (`User`, `Deadline`, `Announcement`) persisting to MongoDB Atlas with timestamps and validation.
- Secure JWT authentication, bcrypt password hashing, and role-based access control (Student read-only, Teacher CRUD).
- Dynamic date calculation, status filters, live search, past-date prevention for new deadlines, and pinned announcements.
- All CRUD actions synchronized between React state and MongoDB.

---

## Not Implemented Yet

- Teacher/Admin dashboard analytics
- WebSockets real-time events (Experiment 8 E8-003+)
- CI/CD & Deployment (Experiment 9)
- Docker Containerization (Experiment 10)

---

## Experiment 1 Rules

Experiment 1 is a static responsive frontend experiment.

Use:

- React
- Tailwind CSS
- Hardcoded mock data

Do NOT implement:

- Backend
- Database
- Real authentication
- JWT
- REST APIs
- Socket.IO
- Persistent forms
- Real class approval
- Assignment submission
- Functionality belonging to future experiments

---

## Documentation

Current project documentation:

- `PROJECT_CONTEXT.md` — current project state and AI context
- `docs/PRD.md` — product requirements
- `docs/FRONTEND_DOC.md` — frontend and UI specification
- `docs/FEATURE_TICKETS.md` — implementation task list

Future documentation will be introduced when required.

Planned later:

- `TECH_ARCHITECTURE.md`
- `SECURITY_ACCESS.md`

---

## AI Development Rules

1. Always read `PROJECT_CONTEXT.md` before starting work.

2. Treat this file as the source of truth for the CURRENT implementation state.

3. Read other documentation only when relevant to the requested task.

4. Do not implement functionality belonging to future experiments.

5. Work only on the requested ticket unless explicitly instructed otherwise.

6. Inspect only files relevant to the requested task unless additional context is genuinely required.

7. Do not refactor unrelated working code.

8. Preserve existing functionality.

9. Do not introduce unnecessary dependencies.

10. Test changes before marking a ticket complete.

11. Update `PROJECT_CONTEXT.md` when the current implementation state changes.

12. Update `docs/FEATURE_TICKETS.md` when a ticket is completed or changed.

13. Update `docs/FRONTEND_DOC.md` only when frontend requirements or design decisions change.

14. Update `docs/PRD.md` only when actual product requirements change.

15. Keep documentation concise.

16. Do not paste source code or detailed Git history into this file.

17. Git is the source of detailed implementation history.

Experiments 1 through 7 are COMPLETED.
Experiment 8 — WebSockets / Socket.IO — IN PROGRESS (E8-001 and E8-002 complete).

Do NOT begin E8-003+ until explicitly instructed.



# DeadlineHub â€” Project Context

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
â†’ Enters class code
â†’ Join request created
â†’ Teacher/Admin/CR approves
â†’ Student gets access to class information

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

- Experiment 1 â€” Tailwind CSS
- Experiment 2 â€” React Hooks
- Experiment 3 â€” Context API / Redux
- Experiment 4 â€” MongoDB + Mongoose
- Experiment 5 â€” Secure REST APIs
- Experiment 6 â€” JWT Authentication & Roles
- Experiment 7 â€” Postman API Testing âœ…
- Experiment 8 â€” WebSockets / Socket.IO âœ…
- Experiment 9 â€” CI/CD & Deployment
- Experiment 10 â€” Docker

---

## Current Stage

Experiment 1 â€” COMPLETED
Experiment 2 â€” COMPLETED
Experiment 3 â€” COMPLETED
Experiment 4 â€” MongoDB + Mongoose Integration â€” COMPLETED
Experiment 5 â€” Secure REST APIs â€” COMPLETED
Experiment 6 â€” JWT Authentication & Role-Based Access â€” COMPLETED
Experiment 7 â€” Postman API Testing â€” COMPLETED
Experiment 8 â€” WebSockets / Socket.IO â€” COMPLETED âœ…

### Experiment 7 Status (Completed)

- **E7-001 â€” Postman Collection & Testing Setup**: COMPLETED âœ…
  * Created complete Postman v2.1.0 collection (`postman/DeadlineHub_API.postman_collection.json`) structured into `Auth`, `Deadlines` (GET, POST, PUT, DELETE), and `Announcements` (GET, POST, PUT, DELETE).
  * Created Postman environment file (`postman/DeadlineHub_Environment.postman_environment.json`) utilizing `baseUrl`, `token`, `teacherToken`, and `studentToken` placeholders without committing credentials or secrets.
  * Authored comprehensive test documentation in `docs/POSTMAN_API_TESTING.md`.
- **E7-002 â€” Validate GET APIs**: COMPLETED âœ…
  * Validated `GET /api/deadlines` (200 OK) with Bearer token authentication.
  * Validated `GET /api/deadlines/:id` (200 OK) for single deadline retrieval.
  * Validated `GET /api/announcements` (200 OK) with Bearer token authentication.
  * Validated `GET /api/announcements/:id` (200 OK) for single announcement retrieval.
  * Validated missing token negative tests across endpoints returning controlled 401 Unauthorized.
  * Validated malformed ID negative tests returning controlled 400 Bad Request (`Invalid ID format`).
  * Validated nonexistent valid ObjectId negative tests returning controlled 404 Not Found (`Resource not found`).
- **E7-003 â€” Validate POST APIs**: COMPLETED âœ…
  * Validated `POST /api/deadlines` with teacher JWT creating resource and returning 201 Created.
  * Validated `POST /api/announcements` with teacher JWT creating resource and returning 201 Created.
  * Verified MongoDB persistence for created resources.
  * Validated missing required fields returning controlled 400 Bad Request.
  * Validated invalid payload data (malformed date, whitespace title/message) returning 400 Bad Request.
  * Validated missing JWT returning 401 Unauthorized across POST routes.
  * Validated student JWT rejection with 403 Forbidden.
- **E7-004 â€” Validate PUT & DELETE APIs**: COMPLETED âœ…
  * Validated `PUT /api/deadlines/:id` and `PUT /api/announcements/:id` with teacher JWT successfully updating MongoDB documents (200 OK).
  * Validated `DELETE /api/deadlines/:id` and `DELETE /api/announcements/:id` with teacher JWT successfully removing documents (200 OK).
  * Verified MongoDB document deletion via subsequent GET returning 404 Not Found.
  * Validated malformed ID on PUT/DELETE returning controlled 400 Bad Request (`Invalid ID format`).
  * Validated nonexistent valid ObjectId on PUT/DELETE returning controlled 404 Not Found (`Resource not found`).
  * Validated student JWT on PUT/DELETE returning 403 Forbidden.
  * Validated missing JWT on PUT/DELETE returning 401 Unauthorized.
- **E7-005 â€” JWT Authentication Testing**: COMPLETED âœ…
  * Validated `POST /api/auth/login` with valid Student credentials (200 OK, JWT returned with student role).
  * Validated `POST /api/auth/login` with valid Teacher credentials (200 OK, JWT returned with teacher role).
  * Validated wrong password returning 401 Unauthorized (`Invalid email or password`).
  * Validated unknown email returning 401 Unauthorized (`Invalid email or password`).
  * Validated missing email/password returning 400 Bad Request (`Please provide email and password`).
  * Validated `GET /api/auth/me` without Authorization header returning 401 Unauthorized.
  * Validated `GET /api/auth/me` with invalid JWT returning 401 Unauthorized (`Invalid token. Authentication failed.`).
  * Validated `GET /api/auth/me` with valid Student JWT (200 OK) and valid Teacher JWT (200 OK).
- **E7-006 â€” Role-Based Authorization Testing**: COMPLETED âœ…
  * Validated Student token allows read access: `GET /api/deadlines` (200 OK) and `GET /api/announcements` (200 OK).
  * Validated Student token rejected with 403 Forbidden on mutations: POST, PUT, DELETE for deadlines and announcements.
  * Validated Teacher token allows full CRUD: GET (200), POST (201), PUT (200), DELETE (200) for deadlines and announcements.
  * Verified critical distinction: 401 = Unauthenticated (no/invalid JWT), 403 = Unauthorized role (authenticated student attempting teacher action).

### Experiment 8 Progress

- **E8-001 â€” Socket.IO Backend Setup**: COMPLETED âœ…
  * Installed `socket.io` package on the backend server.
  * Refactored `server/src/server.js` to use native `http.createServer(app)` instead of `app.listen`.
  * Attached `socket.io` `Server` instance to the native HTTP server so WebSocket and REST share port 5000.
  * Socket.IO CORS configured to match existing `allowedOrigins` whitelist (`http://localhost:5173`, `http://127.0.0.1:5173`).
  * Connection and disconnection events logged with socket ID and reason.
  * `io` instance exposed on the Express app (`app.set('io', io)`) for future route-level event emission.
  * All existing REST APIs, Helmet, CORS, JWT auth, validation, and centralized error handling remain fully intact and tested.
  * Socket.IO polling handshake verified: `GET /socket.io/?EIO=4&transport=polling` â†’ 200 OK with valid `sid`.
- **E8-002 â€” Socket.IO Frontend Connection**: COMPLETED âœ…
  * Installed `socket.io-client` package on the frontend.
  * Created `src/context/SocketContext.jsx` with `SocketProvider` component and `useSocket` hook.
  * `SocketProvider` manages Socket.IO client lifecycle: creates socket on mount, disconnects on unmount.
  * `connected` boolean state tracks live connection status.
  * `connect`, `disconnect`, and `connect_error` events logged to console for observability.
  * `useSocket()` hook exposes `{ socket, connected }` with provider guard.
  * `SocketProvider` added to `src/main.jsx` provider tree (inside `AuthProvider`, wrapping `DeadlineProvider`).
  * Frontend builds cleanly with 74 modules including `socket.io-client` (build verified, 0 errors).
- **E8-003 â€” Real-Time Deadline & Announcement Updates**: COMPLETED âœ…
  * Connected backend REST route handlers to Socket.IO using `req.app.get('io')`.
  * Emitted real-time events upon successful teacher CRUD operations:
    - `POST /api/deadlines` â†’ `deadline:created` (saved deadline document)
    - `PUT /api/deadlines/:id` â†’ `deadline:updated` (updated deadline document)
    - `DELETE /api/deadlines/:id` â†’ `deadline:deleted` (`{ _id: id }`)
    - `POST /api/announcements` â†’ `announcement:created` (saved announcement document)
    - `PUT /api/announcements/:id` â†’ `announcement:updated` (updated announcement document)
    - `DELETE /api/announcements/:id` â†’ `announcement:deleted` (`{ _id: id }`)
  * REST APIs remain strictly responsible for validation, authentication, authorization, and CRUD; Socket.IO only broadcasts successful changes.
  * Updated `DeadlineContext.jsx` and `AnnouncementContext.jsx` to listen for real-time events via `useSocket()`.
  * Implemented client-side deduplication on `created` events by checking if `_id` already exists in state, preventing duplicate records when the initiating client updates state via REST response and receives its own broadcast.
  * Changes reflect instantaneously in other connected browser sessions without requiring page refresh.
  * Proper cleanup registered in `useEffect` returning `socket.off(...)` to avoid memory leaks.
  * Verified all 6 real-time events end-to-end via automated test script.
  * Production frontend build verified cleanly (`npm run build`).
- **E8-004 â€” Real-Time Notifications / Activity**: COMPLETED âœ…
  * Created `src/context/NotificationContext.jsx` with `NotificationProvider` and `useNotification` hook.
  * Listens to existing Socket.IO events (`deadline:created`, `deadline:updated`, `deadline:deleted`, `announcement:created`, `announcement:updated`, `announcement:deleted`).
  * Shows real-time toast notifications with action-specific titles and item details without requiring page refresh:
    - `deadline:created` â†’ "New deadline added" + deadline title
    - `deadline:updated` â†’ "Deadline updated" + deadline title
    - `deadline:deleted` â†’ "Deadline removed"
    - `announcement:created` â†’ "Announcement added" + announcement title
    - `announcement:updated` â†’ "Announcement updated" + announcement title
    - `announcement:deleted` â†’ "Announcement removed"
  * Prevents duplicate notifications for any single event via ref-based event key deduplication cache (`processedKeysRef`).
  * Seamlessly integrated into `DeadlineProvider` tree wrapping `{children}` so toasts appear across all views.
  * Styled with existing Tailwind CSS theme and dark mode classes (`dark:bg-[#151C2C]`, semantic border/badge colors).
  * Auto-dismisses after 4 seconds and provides a manual close button.
  * Production build verified cleanly (`npm run build`).
- **E8-005 â€” Socket.IO Disconnect / Reconnect / Error Handling**: COMPLETED âœ…
  * Enhanced `src/context/SocketContext.jsx` with automatic reconnection options:
    - `reconnection: true`
    - `reconnectionAttempts: Infinity`
    - `reconnectionDelay: 1000` (1s initial backoff)
    - `reconnectionDelayMax: 5000` (5s max backoff)
    - `timeout: 20000`
    - `transports: ['websocket', 'polling']`
  * Added fine-grained connection status state (`'connected' | 'reconnecting' | 'disconnected' | 'connecting'`).
  * Handled full manager and socket error/disconnect lifecycles (`connect`, `disconnect`, `connect_error`, `reconnect_attempt`, `reconnect`, `reconnect_error`, `reconnect_failed`).
  * Created `src/components/ui/ConnectionStatus.jsx` badge component with real-time indicators:
    - Connected (green dot + pulse animation, "Connected")
    - Reconnecting (amber dot + pulse animation, "Reconnecting...")
    - Disconnected (red dot, "Disconnected")
  * Integrated connection status badge into `src/App2.jsx` desktop sidebar (with "Live Sync" label) and mobile header bar (dot only).
  * Guaranteed the application does not crash on disconnect, during reconnect cycles, or on network failure.
  * Verified disconnect and automatic reconnect programmatically via automated test script.
- **E8-006 â€” Final Testing and Documentation**: COMPLETED âœ…
  * Executed comprehensive verification across all Experiment 8 capabilities:
    1. Socket connection and polling reachability verified (`/socket.io/?EIO=4&transport=polling` â†’ 200 OK)
    2. Real-time deadline CRUD events (`deadline:created`, `deadline:updated`, `deadline:deleted`) verified via Socket.IO client
    3. Real-time announcement CRUD events (`announcement:created`, `announcement:updated`, `announcement:deleted`) verified via Socket.IO client
    4. Real-time notifications and activity toast alerts verified with action descriptions and deduplication
    5. Clean disconnect and reconnect behavior verified without application crashes
    6. All existing REST APIs, JWT authentication, and Role-Based Authorization (RBAC) verified intact (21/21 tests passed)
    7. Clean production build verified (`npm run build`, 76 modules transformed, 0 errors)
  * Updated `PROJECT_CONTEXT.md` and `docs/FEATURE_TICKETS.md` with complete documentation.
  * Formally marked Experiment 8 COMPLETED.

---

## Authentication & Class Management (Google Classroom Flow) â€” COMPLETED âœ…

- **Class Model & Database**:
  * Created `server/src/models/Class.js` with `className`, `subject`, `semester`, `division`, unique uppercase `classCode`, `teacherId` (ObjectId ref User), and `students` ([ObjectId ref User]).
  * Added optional `classId` reference to `server/src/models/Deadline.js` and `server/src/models/Announcement.js` for class-specific assignments and alerts with full backward compatibility.
- **Backend Class REST APIs (`server/src/routes/classRoutes.js`)**:
  * `POST /api/classes` â€” Teacher creates a class with auto-generated unique class code (e.g. `D15C-5IT`) or optional custom code (201 Created).
  * `GET /api/classes` & `GET /api/classes/my-classes` â€” Authenticated role-aware retrieval (teacher gets created classes with enrolled students list; student gets joined classes with instructor info).
  * `GET /api/classes/:id` â€” Details view guarded strictly by teacher ownership or student enrollment (403 if unauthorized).
  * `POST /api/classes/join` â€” Student joins using valid unique class code (400 if already joined, 404 if invalid code). Role strictly remains `student`.
  * `DELETE /api/classes/:id` â€” Teacher deletes own class (403 if attempting to delete another teacher's class).
- **Socket.IO Integration**:
  * `class:created`, `class:student-joined`, and `class:deleted` broadcast in real time across connected clients.
- **Frontend Student Experience**:
  * `StudentDashboard.jsx` shows "My Classes" section with enrolled class cards, teacher name, division/semester, and class code badge.
  * 1-click class filter allowing students to filter dashboard deadlines and announcements by specific class or view all classes.
  * "Join Class" modal (`JoinClass.jsx`) with live code validation, error feedback, and success confirmation.
- **Frontend Teacher Experience**:
  * `ClassesPage.jsx` allows teachers to create new classes, view generated class codes with 1-click clipboard copy, see student enrollments, inspect enrolled student lists via modal, and delete classes.
- **Security & Authorization**:
  * Protected via `authMiddleware` and `requireRole` (401 unauthenticated, 403 unauthorized, 400 bad request, 404 not found).
  * Students cannot create or delete classes; class code never alters a user's role.
- **Automated Verification**:
  * 22/22 backend class API tests passed.
  * 30/30 regression tests passed.
  * Production frontend build verified (`npm run build`, 0 errors).

---

## Full-Screen App Welcome Screen (UI Enhancement)

A full-screen application Welcome Screen was added as a UI enhancement after Experiment 2.

- `src/components/AppWelcome.jsx` â€” application-style full viewport Welcome Screen (top-left DeadlineHub branding, single primary "Get Started â†’" CTA, compact right-side academic visual, 3 subtle benefits, zero SaaS marketing layout/links)
- Application starts at: App Welcome Screen â†’ Role Selection â†’ Student / Teacher-Admin flow
- Primary action: "Get Started â†’" opens existing Role Selection screen
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

- DH-001 â€” Tailwind CSS configured and verified
- DH-002 â€” Default Vite starter cleaned
- DH-003 â€” Establish DeadlineHub Design System
- DH-004 â€” Responsive Student Navigation
- DH-005 â€” Shared UI Components
- DH-006 â€” Deadline Card
- DH-007 â€” Announcement Card
- DH-008 â€” Student Dashboard
- DH-009 â€” Dashboard Responsiveness
- DH-010 â€” Deadlines Page
- DH-011 â€” Announcements Page
- DH-012 â€” Welcome / Role Selection
- DH-013 â€” Student Login UI
- DH-014 â€” Student Registration UI
- DH-015 â€” Teacher/Admin Login UI
- DH-016 â€” Join Class UI
- DH-017 â€” Teacher/Admin Layout
- DH-018 â€” Classes Page
- DH-019 â€” Join Requests UI
- DH-020 â€” Deadline Management UI
- DH-021 â€” Announcement Management UI
- DH-022 â€” Responsive Review
- DH-023 â€” UI Consistency Review
- DH-024 â€” Scope Review
- EH-001 â€” Experiment 2 Setup
- EH-002 â€” Deadline Urgency Calculation
- EH-003 â€” Deadline Search
- EH-004 â€” Deadline Filters
- EH-005 â€” Announcement Search
- EH-006 â€” Announcement Filters
- EH-007 â€” Add/Edit Forms with useState
- EH-008 â€” Dashboard Derived Data
- EH-009 â€” useEffect-based UI Updates
- EH-010 â€” Experiment 2 Final Review
- E3-001 through E3-010 â€” Experiment 3 Complete
- E4-001 â€” Backend + Express Setup
- E4-002 â€” MongoDB + Mongoose Connection
- E4-003 â€” Deadline Model & REST API
- E4-004 â€” Announcement Model & REST API
- E4-005 â€” Connect Deadline Context to REST API
- E4-006 â€” Connect Announcement Context to REST API
- E4-007 â€” Persistence & Error Handling
- E4-008 â€” Experiment 4 Final Review

### Current Stage

Experiment 1 â€” COMPLETED
Experiment 2 â€” COMPLETED
Experiment 3 â€” COMPLETED
Experiment 4 â€” MongoDB + Mongoose Integration â€” COMPLETED
Experiment 5 â€” Secure REST APIs â€” COMPLETED
- E5-001 â€” Request Validation (Deadlines & Announcements): COMPLETED âœ…
- E5-002 â€” Centralized Error Handling & Safe 404 Middleware: COMPLETED âœ…
- E5-003 â€” Security Middleware (Helmet, disabled x-powered-by): COMPLETED âœ…
- E5-004 â€” Safer CORS (origin whitelist) & Request Size Limits (100kb): COMPLETED âœ…
- UI Foundation & Core Screens Redesign (Light/Dark mode, manual Switch Role removed): COMPLETED âœ…

Experiment 6 â€” JWT Authentication & Role-Based Access â€” COMPLETED âœ…
- E6-001 â€” User Model + Authentication Structure: COMPLETED âœ…
  * MongoDB/Mongoose User model created with core & student fields
  * Lowercase unique email, role enum ('student', 'teacher'), timestamps
  * Passwords strictly stripped from responses via sanitized toJSON
  * Authentication route structure mounted at `/api/auth`
- E6-002 â€” User Registration + Password Hashing: COMPLETED âœ…
  * Password hashing implemented using bcryptjs (10 salt rounds)
  * POST `/api/auth/register` endpoint with payload validation
  * Controlled 409 duplicate email rejection
  * Connected existing Student Registration screen with real-time feedback
- E6-003 â€” Login + JWT Generation: COMPLETED âœ…
  * POST `/api/auth/login` endpoint verifying bcrypt hash
  * JWT generation with 1-day expiration and `{ id, role }` payload
  * Connected Student Login & Teacher Login screens to backend authentication
- E6-004 â€” Auth Middleware & Protected Routes: COMPLETED âœ…
  * `authMiddleware` verifying `Bearer <token>` against `process.env.JWT_SECRET`
  * Protected `GET /api/auth/me` user profile endpoint
  * Protected `/api/deadlines` and `/api/announcements` routes
  * Frontend `AuthContext` with persistent session restoration via `localStorage`
  * Automatic `Authorization: Bearer <token>` injection in `api.js`
- E6-005 â€” Role-Based Access Control: COMPLETED âœ…
  * `requireRole` middleware created in `server/src/middleware/roleMiddleware.js`
  * POST, PUT, DELETE on `/api/deadlines` and `/api/announcements` restricted to `teacher` role
  * Students retain GET access; 403 Forbidden returned for unauthorized write attempts
  * Frontend role-based routing already correct (teacher role from JWT, no manual selection)
  * Management pages (Deadlines/Announcements) accessible only to teacher role
  * Mobile management table action buttons always visible on touch devices
- E6-006 â€” Logout + Persistent Session + Real Profile: COMPLETED âœ…
  * Logout clears token, user state, and resets activeTab to prevent stale navigation
  * Session restoration via `GET /api/auth/me` on startup (implemented in E6-004, verified)
  * StudentDashboard receives real `user.name` from AuthContext
  * Mobile avatar initial derived from real user name
  * Announcements `postedBy` field uses real authenticated teacher name
- E6-007 â€” Final Auth / Mobile / UX Verification: COMPLETED âœ…
  * Verified Student read-only API access and absence of teacher controls
  * Verified Teacher login and complete CRUD operations on deadlines and announcements
  * Verified persistent session restoration, clean logout, and invalid token fallback
  * Verified user profile rendering from JWT/AuthContext and 0% password/hash exposure
  * Verified responsive mobile layouts, unclipped button icons, and safe bottom navigation padding
- E6-008 â€” Final Documentation / Completion Status: COMPLETED âœ…
  * PROJECT_CONTEXT.md and docs/FEATURE_TICKETS.md updated
  * Experiment 6 finalized and marked COMPLETE

### Current Task

Experiment 8 â€” WebSockets / Socket.IO (E8-001, E8-002 Completed)
- E8-001 â€” Socket.IO Backend Setup: DONE
- E8-002 â€” Socket.IO Frontend Connection: DONE
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
- Socket.IO (WebSockets â€” server: `socket.io`, client: `socket.io-client`)
- Git & GitHub (Version Control)

---

## Current Frontend & Backend State

Experiments 1 through 8 and the Final End-to-End Pass are fully complete.
The application is an end-to-end full stack college deadline and announcement platform featuring:
- React + Vite frontend with Tailwind CSS, purple-accent styling, and responsive Light/Dark modes.
- React Context API (`DeadlineContext`, `AnnouncementContext`, `ClassContext`, `NotificationContext`, `AuthContext`, `SocketContext`, `ThemeContext`).
- Google Classroom-inspired Multi-Class Architecture:
  * Teacher accounts created exclusively via secure CLI (`npm run create-teacher`).
  * Public registration strictly restricted to students; attempts to register with role="teacher" rejected with HTTP 403.
  * Teachers can create, manage, and edit multiple classes with unique auto-generated class codes, departments, academic years, semesters, divisions, and subjects.
  * Students join classes via unique class code; student role is strictly enforced; duplicate membership is rejected (HTTP 400); invalid codes return HTTP 404.
  * Non-owner teachers are strictly forbidden from modifying or targeting other teachers' classes (HTTP 403).
- Critical Deadline & Announcement Targeting System:
  * "All My Classes" targets all classes owned by the initiating teacher.
  * "Particular Classes" enables granular multi-class selection from teacher's classes.
  * Backend strictly verifies ownership of every targeted class; unauthorized class ID injection rejected with HTTP 403.
  * Strict student content isolation: students only receive and view content for classes they have joined. Students with zero enrolled classes receive 0 deadlines/announcements (zero data leaks). Direct unauthorized access returns HTTP 403.
- Socket.IO Real-Time Synchronization with Room Authorization:
  * Authorized class rooms (`class:<classId>`) and user rooms (`user:<userId>`) with JWT verification.
  * Real-time CRUD events (`created`, `updated`, `deleted`) delivered to authorized class members without duplicate listeners.
  * Toast notifications via `NotificationContext` and live connection indicator (`ConnectionStatus`).
- Rigorous Automated Testing:
  * 38 automated unit & security tests (`npm test` / `node server/scripts/testSuite.js`).
  * 18 live end-to-end integration tests (`npm run test:e2e` / `node server/scripts/testE2E.js`).
  * 56 total passing tests (100% pass rate).
  * 0 oxlint errors, 100% clean production build (`npm run build`).

---

## Not Implemented Yet (Future Enhancements)

- Teacher/Admin advanced analytics dashboard
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

- `PROJECT_CONTEXT.md` â€” current project state and AI context
- `docs/PRD.md` â€” product requirements
- `docs/FRONTEND_DOC.md` â€” frontend and UI specification
- `docs/FEATURE_TICKETS.md` â€” implementation task list

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

Experiments 1 through 8, Public Teacher Registration, Dynamic CORS handling with PATCH support, Multi-Class Management UX & Navigation, Dedicated Class Detail View (`ClassDetailView`) with Overview, Deadlines, Announcements, and Students tabs, Live Membership Management (Student Leave Class & Teacher Remove Student & Teacher Delete Class), Join Requests End-to-End Workflow with approval policy enforcement, Canonical Deadline/Announcement Deduplication, Strict Class Scoping & Isolation, Profile Modal, and DNS IPv4 resolver preference are fully COMPLETED and verified. All 147 automated test items passing (94 unit/security tests and 53 live E2E tests). Production frontend build verified cleanly (81 modules transformed, 0 errors). Both backend (port 5000) and frontend (port 5173) are running smoothly with live database and WebSocket connectivity.

### Root Causes & Structural Fixes (Completed)

#### 1. Join Request & Class Approval Flow
- **Root Cause**: `POST /api/classes/join` previously added students directly into `targetClass.students` without checking whether the class required teacher approval. This allowed direct join with code to bypass approval.
- **Fix**: Added `requiresApproval: { type: Boolean, default: true }` to `Class` model and API routes (`POST /api/classes`, `PUT /api/classes/:id`). `POST /api/classes/join` now checks `requiresApproval !== false`. If approval is required, it automatically creates/finds a pending `JoinRequest`, emits `join-request:created` to teacher/student rooms, and returns `{ success: true, requiresApproval: true, status: 'pending' }` without granting membership. Direct join only proceeds if `requiresApproval === false`.

#### 2. Deadline Duplication in Manage Deadlines & Real-time Feeds
- **Root Causes**:
  1. *Socket.IO multi-room emission storm*: Backend previously called individual `io.to('class:cId').emit` for each class, plus `io.to('user:teacherId').emit`, plus `io.emit`. The teacher was joined to all these rooms and received 3-4 duplicate socket events.
  2. *Context state ID mismatch*: `normalizeDeadline` assigned `id = item._id`. When socket events arrived with raw string `_id` or object references, `d._id === deadline._id` failed and prepended a duplicate row.
  3. *Double submit*: Manage Deadlines and Manage Announcements forms lacked a `submitting` guard, allowing double-clicks during network requests.
- **Fix**:
  1. Backend combines all target rooms into a `Set` and calls `io.to(Array.from(rooms)).emit(...)` exactly once. Socket.IO deduplicates client delivery.
  2. Frontend `DeadlineContext` and `AnnouncementContext` use canonical ID extraction (`getCanonicalId = (item) => (item?._id || item?.id || '').toString()`). Both socket handlers and API fetchers deduplicate incoming items by canonical ID and update existing records in place instead of appending duplicates.
  3. Form submission buttons have `submitting` state guards.
  4. Management pages use `useMemo` to ensure deduplication before rendering both table and card views.

#### 3. Class-Aware Dashboard & Google Classroom Experience
- **Root Cause for Content Leak**: In `StudentDashboard.jsx`, filtering previously matched `d.division === activeClass.division`, causing items from Class B to leak into Class A whenever classes shared division names (e.g. "Division A").
- **Fix**:
  1. Replaced loose division matching with strict class targeting: direct `classId` match, `targetClassIds` array membership, or teacher-owned `targetType === 'all_classes'`.
  2. Added Google Classroom-style filter pills bar at the top of the Student Dashboard: "All Classes" pill + individual enrolled class pills with class codes.
  3. "All Classes" combined view deduplicates multi-targeted items by record ID and labels relevant target classes using `getDeadlineClassLabel` and `getAnnouncementClassLabel`.
  4. Active filter banner prominently displays current class name with "Open Full Class Page" and "Return to All Classes" actions.
  5. `ClassDetailView` enhanced with 4 tabs: **Overview** (hero summary, quick stats, upcoming deadlines preview, latest announcements preview, instructor details card, and class metadata), **Deadlines**, **Announcements**, and **Students**.
  6. Teacher Class Actions: Added "Delete Class" button and confirmation dialog with ownership authorization (`isOwner`), which removes class and all memberships without deleting user accounts.

#### 4. Class-Specific Navigation & Browser Refresh Persistence
- **Root Cause**:
  1. `openedClassId` was previously held only in local component `useState(null)` inside `ClassesPage.jsx` and `StudentDashboard.jsx`. Whenever a student or teacher refreshed the browser (F5), `openedClassId` reset to `null` and booted the user back to the dashboard or class list.
  2. `activeTab` inside `ClassDetailView.jsx` defaulted to `'overview'`, discarding whether the user was viewing class-specific Deadlines or Announcements.
  3. `App2.jsx` reset `activeTab` to `'deadlines'` or default tabs on reload instead of honoring the active class workspace.
- **Fix**:
  1. Lifted workspace navigation into `ClassContext.jsx` with bidirectional synchronization between `window.location.hash` (`#/class/:classId/:section`) and `localStorage` (`deadlinehub_opened_class_id`, `deadlinehub_opened_class_tab`).
  2. Implemented strict authorization verification on class load: if a user refreshes or switches accounts and is no longer authorized for the saved class, `closeClassWorkspace()` automatically clears the stale selection and returns the user safely to the dashboard with zero data leakage.
  3. Updated `ClassesPage.jsx` and `StudentDashboard.jsx` to consume `openedClassId`, `openedClassTab`, `openClassWorkspace`, `closeClassWorkspace`, and `setOpenedClassTab`.
  4. Formatted `AnnouncementCard` in `ClassDetailView` to pass proper `postedBy`, `postedTime`, and `classLabel` props.
  5. Updated `AuthContext.jsx` and `App2.jsx` logout routines to purge all navigation tokens (`active_tab`, `opened_class_id`, `opened_class_tab`, `selected_class_id`) and URL hashes upon sign out.

#### 5. Real-Time Teacher Approval & Student Class List Synchronization
- **Root Cause**:
  1. On approval in `joinRequestRoutes.js`, the server previously emitted events but did not attach the student's active socket to the class room. As a result, subsequent class-specific broadcasts were missed until reload.
  2. The `class:student-joined` event emitted to `user:${studentId}` omitted the `student` property, causing client-side checks to skip authoritative synchronization.
- **Fix**:
  1. Server invokes `io.in('user:' + studentId).socketsJoin('class:' + classId)` upon approval so connected sockets join the room immediately.
  2. Emits `join-request:approved` and `class:student-joined` with complete student and class payloads.
  3. Client `ClassContext` automatically re-fetches classes, and emits `socket.emit('join:class', { classId })` for mutual redundancy.
  4. Student Dashboard instantly updates class list, enrolled count, and filter pills without manual reload, allowing immediate access to the newly approved class.

#### 6. Automated Verification Results (Previous Pass)
- **Unit / Security Test Suite (`npm test`)**: 104/104 tests passed (100%).
- **Live MongoDB E2E Test Suite (`npm run test:e2e`)**: 53/53 tests passed (100%).
- **Frontend Production Bundle (`npm run build`)**: Vite built 81 modules in 443ms with 0 errors.

#### 7. Student Dashboard Not Opening — Root Cause & Resolution
- **Root Cause**:
  1. In `src/components/StudentDashboard.jsx`, `useAnnouncements` was imported at the top of the file, but `const { announcements } = useAnnouncements();` was omitted when declaring hooks inside `StudentDashboard()`.
  2. Inside `StudentDashboard.jsx`, `filteredAnnouncements = useMemo(() => announcements.filter(...))` executed unconditionally before the `if (openedClassId)` condition.
  3. Because `announcements` was not declared anywhere in scope, JavaScript threw an uncaught `ReferenceError: announcements is not defined`, crashing the component during React mount and preventing the student dashboard from opening.
  4. In `ClassContext.jsx`, `fetchClasses` had `[user, openedClassId, selectedClassId, ...]` in its dependency array, which caused unnecessary cascading re-fetches whenever a user opened a class or toggled a class filter pill.
  5. In-memory class context state (`openedClassId`, `selectedClassId`, `openedClassTab`) was not being cleared on logout or account switch when `user` changed to `null` without a full page reload.
- **Fix**:
  1. Destructured `const { announcements } = useAnnouncements();` in `StudentDashboard.jsx`.
  2. Added defensive null-safe checks `Array.isArray(announcements)` and `Array.isArray(deadlines)` to guarantee dashboard filters handle empty/loading data gracefully without crashing.
  3. Added real-time socket listeners for `class:student-removed`, `class:left`, and `class:deleted` to `StudentDashboard.jsx` so student enrollments, pills, and counts stay synchronized in real time.
  4. In `ClassContext.jsx`, stabilized `fetchClasses` by tracking `openedClassId` and `selectedClassId` with `useRef`, preventing unnecessary re-fetches when toggling class pills or opening workspaces.
  5. Added an explicit `useEffect` in `ClassContext.jsx` that completely resets all in-memory class state (`classes`, `openedClassId`, `openedClassTab`, `selectedClassId`) when `!user` (logout or account switch).
  6. In `App2.jsx`, added a session check to automatically transition from `'app'` back to `'landing'` when an unauthenticated session is detected and `authLoading` completes.

#### 8. Verification Results (Current Pass)
- **Unit / Security Test Suite (`npm test`)**: **112 / 112 PASSED (100%)** across 14 test groups.
- **Live MongoDB E2E Test Suite (`npm run test:e2e`)**: **53 / 53 PASSED (100%)**.
- **Frontend Production Bundle (`npm run build`)**: **81 modules transformed with 0 errors**.
- **Linter (`npm run lint`)**: **0 errors**, warnings dropped to 39.
- **Git Formatting (`git diff --check`)**: **0 whitespace/formatting errors**.
- **Live Browser Verification (Browser Subagent)**:
  * Successfully navigated to `http://localhost:5173`.
  * Selected Student role on welcome screen.
  * Logged in using genuine student credentials (`s_1791898300373@college.edu` / `password123`).
  * Student Dashboard opened cleanly: greeting displayed, summary cards rendered, and enrolled class "Cloud Architecture" (`A-6`) visible.
  * Clicked "Open Class" on "Cloud Architecture": class workspace opened smoothly with Overview, Deadlines, Announcements, and Students tabs fully accessible.
  * Browser recording saved: `student_dashboard_verify_1792345330776.webp`.

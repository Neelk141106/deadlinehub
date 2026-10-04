# DeadlineHub — Feature Tickets

## Ticket Rules

- Work on one ticket at a time unless explicitly instructed otherwise.
- Do not implement features belonging to future experiments.
- Mark a ticket complete only after it has been tested.
- Update PROJECT_CONTEXT.md after meaningful project-state changes.
- Do not refactor unrelated working code.

---

# Experiment 1 — Tailwind CSS

## Goal

Build a responsive static frontend for DeadlineHub using React and Tailwind CSS.

Experiment 1 uses hardcoded mock data only.

No backend, database, authentication logic, APIs or real-time functionality should be implemented.

---

## Phase 1 — Foundation

### DH-001 — Configure Tailwind CSS
Status: DONE

- Install required Tailwind dependencies
- Configure Tailwind with the existing Vite project
- Verify Tailwind utility classes work
- Do not build application screens yet

### DH-002 — Clean Vite Starter
Status: DONE

- Remove default Vite demo content
- Remove unused starter assets/styles
- Keep the React application working
- Create a clean application starting point

### DH-003 — Establish DeadlineHub Design System
Status: DONE

Define reusable frontend styling for:

- Primary color
- Background colors
- Text hierarchy
- Status colors
- Buttons
- Cards
- Badges
- Inputs
- Spacing
- Border radius
- Shadows

Follow FRONTEND_DOC.md.

---

# Phase 2 — Shared Layout

### DH-004 — Responsive Student Navigation
Status: DONE

Create static navigation containing:

- Dashboard
- Deadlines
- Announcements

Desktop:
- Sidebar navigation

Mobile:
- Compact mobile navigation

Secondary actions may include:

- Profile
- Settings
- Logout

### DH-005 — Shared UI Components
Status: DONE

Create reusable static UI components where appropriate, such as:

- Page header
- Badge
- Button
- Input
- Empty/basic state elements

Avoid unnecessary abstraction.

---

# Phase 3 — Student Dashboard

### DH-006 — Deadline Card
Status: DONE

Create reusable deadline card UI.

Display:

- Urgency
- Subject
- Deadline title
- Due date/time
- Priority

IMPORTANT:

Do NOT include:

- Submit
- Upload
- Turn In
- Assignment completion actions

### DH-007 — Announcement Card
Status: DONE

Create reusable announcement card UI.

Display:

- Priority/category
- Title
- Short message
- Posted by
- Posted time
- Pinned indicator when applicable

### DH-008 — Student Dashboard
Status: DONE

Build the static student dashboard.

Include:

- Greeting
- Class information
- Needs Attention
- Latest Announcements
- Upcoming Deadlines

Example class:

IT • Semester 5 • D15C

Use realistic hardcoded academic data.

### DH-009 — Dashboard Responsiveness
Status: DONE

Verify dashboard on:

- Desktop
- Tablet
- Mobile

No horizontal scrolling.

---

# Phase 4 — Student Pages

### DH-010 — All Deadlines Page
Status: DONE

Create static deadlines page.

Include:

- Page heading
- Search UI
- Filter UI
- Deadline cards/list

Filters are visual only during Experiment 1.

### DH-011 — Announcements Page
Status: DONE

Create static announcement board.

Include:

- Page heading
- Search UI
- Category/priority filter UI
- Announcement feed

Filters are visual only during Experiment 1.

---

# Phase 5 — Entry & Class Joining UI

### DH-012 — Welcome / Role Selection
Status: DONE

Create a simple welcome screen with:

- Student entry
- Teacher/Admin entry

### DH-013 — Student Login UI
Status: DONE

Create student login interface.

No real authentication.

### DH-014 — Student Registration UI
Status: DONE

Fields:

- Full Name
- College Email
- Student Code / Roll Number
- Password
- Confirm Password

No real registration logic.

### DH-015 — Teacher/Admin Login UI
Status: DONE

Create separate Teacher/Admin login interface.

No real authentication.

### DH-016 — Join Class UI
Status: DONE

Create static class joining flow.

Include:

- Class code input
- Matching class preview
- Request to Join
- Pending approval state

Example:

D15C-5IT

No real join logic.

---

# Phase 6 — Teacher/Admin UI

### DH-017 — Teacher/Admin Layout
Status: DONE

Create basic administrative navigation/layout.

Keep it simple and consistent with the student interface.

### DH-018 — Classes Page
Status: DONE

Display hardcoded class cards.

Example:

D15C
Information Technology
Semester 5
72 Students
Class Code: D15C-5IT

### DH-019 — Join Requests UI
Status: DONE

Display hardcoded join requests.

Show:

- Student name
- College email
- Student code

Static actions:

- Approve
- Reject

No actual approval logic.

### DH-020 — Deadline Management UI
Status: DONE

Create static Teacher/Admin deadline management interface.

Include:

- Existing deadlines
- Add deadline UI
- Edit controls

No persistence.

### DH-021 — Announcement Management UI
Status: DONE

Create static announcement management interface.

Include:

- Existing announcements
- Add announcement UI
- Edit controls
- Pin indicator/control

No persistence.

---

# Phase 7 — Final Experiment 1 Quality

### DH-022 — Responsive Review
Status: DONE

Review all Experiment 1 screens on:

- Desktop
- Tablet
- Mobile

Fix:

- Overflow
- Poor spacing
- Unreadable text
- Broken layouts
- Inconsistent navigation

### DH-023 — UI Consistency Review
Status: DONE

Verify consistent:

- Typography
- Colors
- Buttons
- Inputs
- Cards
- Badges
- Spacing
- Navigation

### DH-024 — Scope Review
Status: DONE

Confirm Experiment 1 contains NO:

- Backend
- Database
- JWT
- API calls
- Socket.IO
- Real authentication
- Real approval logic
- Assignment submission functionality

---

# Experiment 1 Completion Criteria

Experiment 1 is complete when:

- Tailwind CSS is configured
- DeadlineHub static frontend exists
- Student-facing UI exists
- Teacher/Admin UI exists
- Dashboard is responsive
- Deadlines are clearly presented as reminders
- Announcements are easy to scan
- Class joining UI exists
- Hardcoded data is used
- Mobile/tablet/desktop layouts work
- No future experiment functionality has been implemented

---

# Experiment 2 — React Hooks

## Goal

Introduce state management and dynamic UI behavior to the static frontend using React Hooks (useState, useEffect, useMemo, etc.).

No backend, database, APIs, JWT or Socket.IO should be implemented.

---

## Phase 1 — Setup & Data Calculation

### EH-001 — Experiment 2 Setup
Status: DONE

- Update project documentation for Experiment 2
- Establish feature ticket list

### EH-002 — Deadline Urgency Calculation
Status: DONE

- Create utility to calculate deadline urgency (e.g., 'Due Today', 'Due Tomorrow', 'Past')
- Replace hardcoded urgency badges with calculated values

---

## Phase 2 — Search and Filtering

### EH-003 — Deadline Search
Status: DONE

- Implement text search for deadlines
- Filter list dynamically based on input

### EH-004 — Deadline Filters
Status: DONE

- Implement status/priority/type filters for deadlines
- Update UI to reflect active filters

### EH-005 — Announcement Search
Status: DONE

- Implement text search for announcements
- Filter list dynamically based on input

### EH-006 — Announcement Filters
Status: DONE

- Implement category/priority filters for announcements
- Update UI to reflect active filters

---

## Phase 3 — Forms & Dynamic UI

### EH-007 — Add/Edit Forms with useState
Status: DONE

- Implement controlled components for forms
- Add static form validation

### EH-008 — Dashboard Derived Data
Status: DONE

- Update dashboard to show actual counts (e.g., '2 Due Soon') based on mock data
- Ensure 'Needs Attention' section updates dynamically

### EH-009 — useEffect-based UI Updates
Status: DONE

- Use useEffect to handle component mounting or mock data loading
- Add simple loading states where appropriate

---

## Phase 4 — Final Review

### EH-010 — Experiment 2 Final Review
Status: DONE

- Review all dynamic behavior
- Ensure no backend dependencies were introduced
- Verify performance and UX

---

# UI Enhancements (Post-Experiment 2)

### UI-ENH-001 — Public Landing Page
Status: DONE

- Add clean, modern, minimal hero-style intro landing page before Role Selection
- Navbar with logo, Home, About, Log In, and Get Started CTAs
- Hero section with badge ("Smart Academic Deadline & Announcement Board"), heading ("Never miss what matters."), supporting text, and CTAs ("Get Started", "Log In")
- Right-side academic decorative visual panel with floating cards and subtle SVG icons
- Light background with subtle violet gradient blobs, dot patterns, and wave accent strip
- Responsive 2-column desktop / stacked mobile layout
- Full preservation of downstream Role Selection, Student, and Teacher/Admin application flows

---

# Experiment 3 — Context API

## Goal

Centralize shared DeadlineHub application data using React Context API so multiple screens/components can use the same state instead of maintaining separate duplicated local state.

No Redux, backend, database, REST APIs, JWT, or WebSockets should be introduced.

---

### E3-001 — Experiment 3 Setup
Status: DONE

- Update PROJECT_CONTEXT.md to show Experiment 3 in progress
- Add Experiment 3 ticket list to docs/FEATURE_TICKETS.md

### E3-002 — Global Deadline Context
Status: DONE

- Create DeadlineContext foundation (createContext, useContext, useState)
- Initialize context state with existing MOCK_DEADLINES data
- Expose deadlines, addDeadline, updateDeadline, and deleteDeadline / removeDeadline functions
- Wrap application with DeadlineProvider

### E3-003 — Connect Deadline Views to Context
Status: TODO

- Connect Deadlines page to DeadlineContext

### E3-004 — Global Deadline Add/Edit
Status: TODO

- Connect Teacher/Admin Deadline Management to DeadlineContext

### E3-005 — Global Announcement Context
Status: TODO

- Create AnnouncementContext foundation

### E3-006 — Connect Announcement Views to Context
Status: TODO

- Connect Announcements page to AnnouncementContext

### E3-007 — Global Announcement Add/Edit
Status: TODO

- Connect Teacher/Admin Announcement Management to AnnouncementContext

### E3-008 — Connect Dashboard to Global State
Status: TODO

- Connect Student Dashboard to consume global deadline and announcement contexts

### E3-009 — Remove Duplicate Local Data
Status: TODO

- Clean up isolated local states and unused duplicate initial mock data in individual components

### E3-010 — Experiment 3 Final Review
Status: DONE

- Conduct complete verification of global state management across all roles and screens

---

# Experiment 4 — MongoDB + Mongoose Integration

## Goal

REST API Design with MongoDB + Mongoose Integration. Replace in-memory mock data with real MongoDB persistence while keeping Context API as the frontend global state layer.

---

### E4-001 — Backend + Express Setup
Status: DONE

- Configure minimal Express backend in server/
- Environment variable configuration (.env, PORT=5000)
- Core middleware (cors, express.json)
- Base routes: GET / and GET /api/health

### E4-002 — MongoDB + Mongoose Connection
Status: DONE

- Mongoose connection utility (server/src/config/db.js)
- Explicit DNS resolvers for MongoDB Atlas SRV record resolution
- Clean error handling and server startup integration

### E4-003 — Deadline Model & REST API
Status: DONE

- Deadline Mongoose schema with timestamps and required validation
- REST endpoints: GET, POST, GET /:id, PUT /:id, DELETE /:id
- Appropriate HTTP status codes (200, 201, 400, 404, 500)

### E4-004 — Announcement Model & REST API
Status: DONE

- Announcement Mongoose schema with timestamps and required validation
- REST endpoints: GET, POST, GET /:id, PUT /:id, DELETE /:id
- Appropriate HTTP status codes (200, 201, 400, 404, 500)

### E4-005 — Connect Deadline Context to REST API
Status: DONE

- Connect DeadlineContext to backend REST API endpoints
- Persist add, update, and delete operations to MongoDB
- Fix "Invalid Date" bug by standardizing dueDate ISO parsing
- Implement dynamic minDate and past-date validation for new deadlines

### E4-006 — Connect Announcement Context to REST API
Status: DONE

- Connect AnnouncementContext to backend REST API endpoints
- Persist add, update, delete, and togglePin operations to MongoDB
- Re-sort announcements dynamically (pinned first, then chronological)

### E4-007 — Persistence & Error Handling
Status: DONE

- Robust error handling across DeadlineContext, AnnouncementContext, and native fetch API service
- Safe state preservation on failed POST/PUT/DELETE operations
- Standardized REST response codes across Express routes (200, 201, 400, 404, 500)
- Single source of truth in MongoDB without duplicate storage or localStorage

### E4-008 — Experiment 4 Final Review
Status: DONE

- Comprehensive review of complete Experiment 4 architecture
- Verified end-to-end data flow: React Components → Context API → REST API → Express → Mongoose → MongoDB Atlas
- Verified complete CRUD operations, persistence, date formatting, and input validation

---

# Experiment 5 — Secure REST APIs

## Goal

Strengthen backend REST APIs with input validation, centralized error handling, and robust security middleware. Establish the foundational Light/Dark design system in the frontend.

---

### E5-001 — Request Validation
Status: DONE

- Validate Deadline payloads (title required/non-empty, dueDate valid date format, preserve model defaults)
- Validate Announcement payloads (title required/non-empty, message required/non-empty)
- Validate MongoDB ObjectId parameters (return 400 on malformed IDs)
- Malformed payloads and invalid inputs return structured 400 Bad Request
- Existing overdue deadlines are not invalidated

### E5-002 — Centralized Error Handling
Status: DONE

- Centralized error handling middleware catching Mongoose ValidationErrors, CastErrors, JSON SyntaxErrors, and custom AppErrors
- Safe catch-all 404 middleware replacing Express 5 incompatible wildcard `app.all('*')`
- Uniform JSON error response format: `{ "success": false, "message": "..." }`
- Zero exposure of internal stack traces, DB details, or environment secrets
- Backend remains stable and running across all error conditions

### E5-003 — Security Middleware
Status: DONE

- Installed and configured `helmet` with custom cross-origin resource policy
- Explicitly disabled `x-powered-by` header
- Added security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security)

### E5-004 — Safer CORS & Request Limits
Status: DONE

- Explicit CORS configuration allowing only trusted Vite frontend origin (`http://localhost:5173`, `http://127.0.0.1:5173`)
- Allowed methods restricted to `GET, POST, PUT, DELETE`
- JSON payload body limit set to `100kb` with handled 413 Payload Too Large error
- Centralized error handling integration for rejected CORS origins (403 Forbidden)

---

# Experiment 6 — JWT Authentication & Role-Based Access

## Goal

Implement secure user registration, authentication with JSON Web Tokens (JWT), password hashing with bcrypt, and role-based access control.

---

### E6-001 — User Model + Authentication Structure
Status: DONE

- Mongoose User schema with name, email, password, role (student/teacher), and student metadata (studentCode, department, semester, division)
- Unique, lowercase email index with format validation
- Timestamps and sanitized toJSON transform (never serializes password or hash)
- Auth route structure established at `/api/auth`

### E6-002 — User Registration + Password Hashing
Status: DONE

- Password hashing using bcryptjs with 10 salt rounds before storing in MongoDB
- Registration endpoint `POST /api/auth/register`
- Robust input validation (name required, valid email, min 6 char password, valid role)
- Clean duplicate email rejection returning 409 Conflict
- Passwords and hashes strictly excluded from API responses
- Student registration form connected to registration API with feedback states

### E6-003 — Login + JWT Generation
Status: DONE

- User login endpoint `POST /api/auth/login`
- Verify password against stored bcrypt hash using `user.comparePassword`
- Generate signed JWT with user ID, role, and 1-day expiration
- Return token and user metadata (never password or hash)
- Student and Teacher login forms connected to backend authentication

### E6-004 — Auth Middleware & Protected Routes
Status: DONE

- `authMiddleware` created to parse and verify `Authorization: Bearer <token>`
- Protected profile endpoint `GET /api/auth/me`
- Protected existing shared application APIs (`/api/deadlines` and `/api/announcements`)
- Global frontend `AuthContext` with automatic token/session restoration on startup
- Persistent login support via `localStorage`
- Native `api.js` updated to inject `Authorization` header on all requests

### E6-005 — Role-Based Access Control
Status: DONE

- `requireRole` middleware in `server/src/middleware/roleMiddleware.js`
- POST, PUT, DELETE on deadlines and announcements restricted to `teacher` role
- Students retain read-only (GET) access to all resource endpoints
- 403 Forbidden returned for unauthorized write attempts
- Frontend derives role from backend JWT — no manual role selection permitted
- Mobile management table action buttons always visible on touch devices

### E6-006 — Logout + Persistent Session + Real Profile
Status: DONE

- Logout clears token, user state, and resets activeTab to prevent stale navigation state
- Session restoration via `GET /api/auth/me` on startup (already implemented in E6-004, verified)
- StudentDashboard receives real authenticated `user.name` as greeting prop
- Mobile avatar initial letter derived from real user name
- Announcement `postedBy` field uses real authenticated teacher name from AuthContext

### E6-007 — Final Auth / Mobile / UX Verification
Status: DONE

- Verified Student role authentication, read-only API access, and UI restriction from administrative controls
- Verified Teacher role authentication and full CRUD capabilities for deadlines and announcements
- Verified session persistence via JWT and localStorage, startup re-validation, clean logout, and invalid token fallback
- Verified authenticated user profile display with zero password/hash exposure
- Verified mobile viewport layouts, card rendering, unclipped action buttons, and safe bottom navigation padding

### E6-008 — Final Documentation / Completion Status
Status: DONE

- Updated PROJECT_CONTEXT.md and docs/FEATURE_TICKETS.md with complete Experiment 6 deliverables
- Experiment 6 finalized and marked COMPLETE

---

# Experiment 7 — Validating RESTful APIs using Postman

## Goal

Validate DeadlineHub RESTful APIs using Postman. Test authentication, deadlines, announcements, status codes, and error scenarios.

---

### E7-001 — Postman Collection & API Testing Setup
Status: DONE

- Created complete Postman v2.1.0 collection (`postman/DeadlineHub_API.postman_collection.json`)
- Organized collection cleanly into `Auth`, `Deadlines`, and `Announcements` folders
- Covered exact existing endpoints:
  * Auth: POST `/api/auth/register`, POST `/api/auth/login`, GET `/api/auth/me`
  * Deadlines: GET `/api/deadlines`, GET `/api/deadlines/:id`, POST `/api/deadlines`, PUT `/api/deadlines/:id`, DELETE `/api/deadlines/:id`
  * Announcements: GET `/api/announcements`, GET `/api/announcements/:id`, POST `/api/announcements`, PUT `/api/announcements/:id`, DELETE `/api/announcements/:id`
- Created Postman environment file (`postman/DeadlineHub_Environment.postman_environment.json`) with conceptual variables: `baseUrl = http://localhost:5000`, `token = <JWT>`
- Ensured zero exposure of secrets, database credentials, passwords, or MongoDB URIs

### E7-002 — Validate GET APIs
Status: DONE

- Validated `GET /api/deadlines` with Bearer token authentication (Expected: 200, Actual: 200)
- Validated `GET /api/deadlines/:id` with valid ObjectId (Expected: 200, Actual: 200)
- Validated `GET /api/announcements` with Bearer token authentication (Expected: 200, Actual: 200)
- Validated `GET /api/announcements/:id` with valid ObjectId (Expected: 200, Actual: 200)
- Validated missing JWT authentication rejection across protected GET routes (Expected: 401, Actual: 401)
- Validated malformed ID controlled validation error (Expected: 400, Actual: 400)
- Validated nonexistent valid ObjectId error handling (Expected: 404, Actual: 404)
- Documented all test execution results in `docs/POSTMAN_API_TESTING.md`

### E7-003 — Validate POST APIs
Status: DONE

- Validated `POST /api/deadlines` with Teacher JWT creating deadline (Expected: 201, Actual: 201)
- Validated `POST /api/announcements` with Teacher JWT creating announcement (Expected: 201, Actual: 201)
- Verified created documents persist in MongoDB via direct retrieval (200 OK)
- Validated missing required fields returning 400 Bad Request on both endpoints
- Validated invalid payload data (bad date, whitespace fields) returning 400 Bad Request
- Validated missing JWT returning 401 Unauthorized
- Validated Student JWT attempting creation returning 403 Forbidden via RBAC middleware
- Documented all test results in `docs/POSTMAN_API_TESTING.md`

### E7-004 — Validate PUT and DELETE APIs
Status: DONE

- Created dedicated temporary test documents to protect existing application data
- Validated `PUT /api/deadlines/:id` and `PUT /api/announcements/:id` with Teacher JWT updating documents (Expected: 200, Actual: 200)
- Verified update persistence in MongoDB via subsequent GET requests (200 OK)
- Validated `DELETE /api/deadlines/:id` and `DELETE /api/announcements/:id` with Teacher JWT (Expected: 200, Actual: 200)
- Verified document removal in MongoDB via subsequent GET requests returning 404 Not Found
- Validated malformed ID returning controlled 400 Bad Request on PUT and DELETE
- Validated nonexistent valid ObjectId returning 404 Not Found on PUT and DELETE
- Validated Student JWT mutation attempts returning 403 Forbidden on PUT and DELETE
- Validated missing JWT returning 401 Unauthorized on PUT and DELETE
- Documented all test results in `docs/POSTMAN_API_TESTING.md`




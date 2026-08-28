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
- Experiment 7 — Postman API Testing
- Experiment 8 — WebSockets / Socket.IO
- Experiment 9 — CI/CD & Deployment
- Experiment 10 — Docker

---

## Current Stage

Experiment 1 — COMPLETED
Experiment 2 — COMPLETED
Experiment 3 — COMPLETED
Experiment 4 — MongoDB + Mongoose Integration — COMPLETED

### Experiment 4 Summary

REST API Design with MongoDB + Mongoose Integration.
- Node.js & Express backend configured in `server/` on port 5000.
- MongoDB Atlas cluster connected via Mongoose ODM with explicit DNS resolution (`8.8.8.8`, `1.1.1.1`).
- Mongoose models created: `Deadline` and `Announcement` with timestamps and schema validations.
- Express REST API routes implemented: `/api/deadlines` and `/api/announcements` with full CRUD support (`GET`, `POST`, `PUT`, `DELETE`).
- Frontend React Context (`DeadlineContext`, `AnnouncementContext`) connected to REST APIs via native `fetch` service (`src/api/api.js`).
- Database persistence verified across browser refreshes and role navigation.
- Fixed `dueDate` ISO parsing and added past-date validation for new deadlines.
- Safe error handling across all mutations (failed API calls do not corrupt Context state).

---

## Architecture

```
React Components (Dashboard, Pages, Cards, Forms)
       │
       ▼
Context API (useDeadlines, useAnnouncements)
       │
       ▼
Frontend API Service (src/api/api.js using native fetch)
       │
       ▼
Express.js REST API (localhost:5000/api/...)
       │
       ▼
Mongoose ODM (Models with Validation & Timestamps)
       │
       ▼
MongoDB Atlas (Cloud Database)
```

---

## Known Limitations

- Login/Session persistence: Refreshing requires entering role/login again (expected for Experiment 4; persistent authentication and JWT will be implemented in Experiment 6).

---

## Next Stage

Experiment 5 — Secure REST APIs


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

### Next Task

Experiment 5 — Secure REST APIs

---

## Current Technologies

- React (Frontend UI)
- Vite (Frontend Build Tool)
- Tailwind CSS (Styling)
- Node.js & Express (Backend REST API)
- MongoDB Atlas (Cloud Database)
- Mongoose (ODM / Schema & Models)
- Git & GitHub (Version Control)

---

## Current Frontend & Backend State

Experiments 1, 2, 3, and 4 are fully complete.
The application is a full stack web application featuring:
- React + Vite frontend with Tailwind CSS.
- React Context API (`DeadlineContext`, `AnnouncementContext`) managing global state.
- Native `fetch` client (`src/api/api.js`) communicating with Express REST API on `http://localhost:5000/api`.
- Node.js / Express backend with CORS and JSON body parser.
- Mongoose models (`Deadline`, `Announcement`) persisting to MongoDB Atlas with timestamps and validation.
- Dynamic date calculation, status filters, live search, past-date prevention for new deadlines, and pinned announcements.
- All CRUD actions (`add`, `update`, `delete`, `togglePin`) synchronized between React state and MongoDB.

---

## Not Implemented Yet

- Teacher/Admin dashboard analytics
- Real JWT Authentication & Password Hashing (Experiment 6)
- Role-based route authorization & security middleware (Experiment 5/6)
- WebSockets / Socket.IO (Experiment 8)
- CI/CD & Docker (Experiments 9/10)

- WebSockets

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

Experiment 1, Experiment 2, Experiment 3, and Experiment 4 are COMPLETED.

Next stage: Experiment 5 — Secure REST APIs. Do NOT begin Experiment 5 until explicitly instructed.


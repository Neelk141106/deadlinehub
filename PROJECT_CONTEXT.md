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

Experiment 1 — Tailwind CSS

Status: IN PROGRESS

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

## Experiment 1 Progress

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

### Current Task

DH-016 — Join Class UI

### Next After DH-016

DH-017 — Teacher/Admin Layout

---

## Current Technologies

- React
- Vite
- Tailwind CSS
- Git
- GitHub

---

## Current Frontend State

The default Vite starter interface has been removed.

The application currently contains the Responsive Student Navigation shell (DH-004), reusable Shared UI Components (DH-005), the fully integrated and responsive Student Dashboard layout (DH-008, DH-009), the Deadlines Page (DH-010), the Announcements Page (DH-011), the Welcome / Role Selection Screen (DH-012), the Student Login UI (DH-013), the Student Registration UI (DH-014), and the Teacher/Admin Login UI (DH-015).

---

## Not Implemented Yet

- Join class UI
- Teacher/Admin dashboard
- React application logic
- Backend
- Database
- Authentication
- Authorization
- APIs
- JWT
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

---

## Next Task

Implement:

**DH-016 — Join Class UI**

Do not begin DH-017 or any later ticket until DH-016 has been completed and verified.
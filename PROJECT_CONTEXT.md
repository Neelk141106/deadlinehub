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

There must be NO "Submit" button or assignment-upload functionality.

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
- Add and manage deadlines
- Add and manage announcements
- Manage subjects

---

## Class Membership

Students belong to a class/division.

Example:

Branch: Information Technology
Semester: 5
Division: D15C

Students can join using a class code.

Example:

D15C-5IT

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

Stage 0 — Project Foundation

### Completed

- GitHub repository created
- Repository cloned locally
- React + Vite initialized
- Dependencies installed
- Development server verified
- Project documentation structure created

### Current Technologies

- React
- Vite
- Git
- GitHub

### Not Implemented Yet

- Tailwind CSS
- DeadlineHub UI
- React application logic
- Backend
- Database
- Authentication
- Authorization
- APIs
- WebSockets

---

## Current Experiment

Experiment 1 — Tailwind CSS

Status: NOT STARTED

---

## Documentation

Project documentation:

- `PROJECT_CONTEXT.md` — current project state and AI context
- `docs/PRD.md` — product requirements
- `docs/FRONTEND_DOC.md` — frontend and UI specification
- `docs/FEATURE_TICKETS.md` — implementation task list

Future documentation will be introduced only when required.

Planned later:

- `TECH_ARCHITECTURE.md`
- `SECURITY_ACCESS.md`

---

## AI Development Rules

1. Always read `PROJECT_CONTEXT.md` before starting work.

2. Treat this file as the source of truth for the CURRENT implementation state.

3. Do not implement functionality belonging to future experiments.

4. Inspect only files relevant to the requested task unless additional context is genuinely required.

5. Do not refactor unrelated working code.

6. Preserve existing functionality.

7. Do not introduce unnecessary dependencies.

8. Work ticket-by-ticket when a feature ticket is provided.

9. After completing meaningful work, update the relevant project documentation.

10. Update `PROJECT_CONTEXT.md` when the current implementation state changes.

11. Update `FEATURE_TICKETS.md` when a ticket is completed or changed.

12. Update `FRONTEND_DOC.md` only when frontend requirements/design decisions change.

13. Update `PRD.md` only when product requirements change.

14. Keep this file concise. Do not paste source code or detailed Git history here.

15. Git is the source of detailed implementation history.

---

## Next Task

Prepare documentation for Experiment 1, then configure Tailwind CSS.
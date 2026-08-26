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
Status: TODO

- Conduct complete verification of global state management across all roles and screens
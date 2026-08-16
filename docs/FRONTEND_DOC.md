# DeadlineHub — Frontend Documentation

## 1. Frontend Goal

DeadlineHub should provide a clean, attractive and extremely easy-to-use interface for viewing academic deadlines and announcements.

The frontend should feel like a modern student productivity application rather than a traditional college ERP or LMS.

The primary UX principle is:

> Important academic information should be understandable within seconds.

When visual complexity conflicts with usability, prioritize usability.

---

## 2. Design Direction

### Overall Style

- Modern
- Minimal
- Student-friendly
- Clean
- Responsive
- Visually polished
- Easy to scan

### Theme

Primary theme:

- Light background
- White cards/surfaces
- Indigo/Violet primary accent
- Neutral gray secondary text

Status colors:

- Red — Urgent / Due Today / Due Tomorrow
- Amber — Approaching Deadline
- Indigo/Violet — Normal actions / brand
- Gray — Past / inactive information

### UI Styling

Use:

- Moderate rounded corners
- Subtle borders
- Light shadows
- Comfortable whitespace
- Clear typography
- Simple line icons
- Compact status badges

Avoid:

- Excessive gradients
- Glassmorphism
- Huge cards
- Too many colors
- Excessive animations
- Complex charts
- ERP-style clutter

---

# 3. Navigation

## Student Navigation

Primary navigation should contain only:

- Dashboard
- Deadlines
- Announcements

Secondary actions:

- Profile
- Settings
- Logout

### Desktop

Use a clean sidebar or equivalent navigation.

### Mobile

Use compact mobile navigation, preferably bottom navigation or a simple mobile header.

Do not compress the desktop sidebar into an unusable mobile layout.

---

# 4. Welcome / Role Selection

The first screen should clearly distinguish between the two user types.

Actions:

- I'm a Student
- I'm a Teacher / Admin

Keep this screen simple.

Possible supporting text:

"Stay organized. Never miss what matters."

---

# 5. Student Registration

Fields:

- Full Name
- College Email
- Student Code / Roll Number
- Password
- Confirm Password

Do not require the student to manually choose a division during registration.

Class membership happens through the Join Class flow.

During Experiment 1, this is UI only.

---

# 6. Student Login

Student login should support the planned identity system.

UI may provide:

- College Email
- Password

The design may also visually accommodate Student Code as an alternative identifier in the future.

During Experiment 1, no real authentication is implemented.

---

# 7. Teacher / Admin Login

Separate Teacher/Admin login interface.

Fields:

- Email
- Password

Teacher, Admin and CR use the same administrative UI/permission concept for the MVP.

During Experiment 1, this is UI only.

---

# 8. Join Class

Students join their class using a class code.

Example:

D15C-5IT

Flow represented in UI:

Enter class code
→ Display matching class
→ Request to Join
→ Pending Approval

Example class:

Information Technology  
Semester 5  
Division D15C

During Experiment 1, use hardcoded data only.

---

# 9. Student Dashboard

The dashboard is the most important student screen.

Its purpose is:

> Tell me what I need to know today.

## Header

Example:

Good Morning, Neel 👋

Supporting text:

"Here's what you need to know today."

Class information:

IT • Semester 5 • D15C

Optional header actions:

- Search
- Notifications
- Profile avatar

---

## 10. Dashboard Information Hierarchy

Display information in approximately this order:

1. Needs Attention
2. Latest Announcements
3. Upcoming Deadlines

Small overview cards may also be used if they improve the design.

Examples:

- 2 Due Soon
- 5 This Week
- 3 New Announcements

Overview cards must not dominate the dashboard.

---

# 11. Needs Attention

This section displays the most urgent deadlines.

Example:

DUE TOMORROW

Analysis of Algorithms  
Assignment 2

18 Aug • 11:59 PM

Priority: High

Another example:

DUE IN 3 DAYS

Full Stack Development  
Experiment 4

20 Aug • 11:59 PM

Priority: Important

Urgency should be visually obvious without making the entire card bright red.

---

# 12. Deadline Card

A deadline card should prioritize information in this order:

1. Urgency
2. Subject
3. Deadline title
4. Due date/time
5. Priority

Possible fields:

- Urgency badge
- Subject
- Title
- Due date/time
- Priority
- Small icon

IMPORTANT:

There must be NO:

- Submit button
- Upload button
- Turn-in button
- Assignment completion workflow

DeadlineHub only reminds/informs students about the deadline.

---

# 13. Latest Announcements

Display announcements as a clean feed/list.

Example:

URGENT

DBMS Practical Room Changed

Tomorrow's practical will be conducted in Lab 405 instead of Lab 301.

Posted by CR • 2 hours ago

Another example:

IMPORTANT • PINNED

Project Review Schedule Released

The project review schedule for this week has been published.

Announcements should be readable directly from the dashboard when possible.

---

# 14. Announcement Card

May contain:

- Priority
- Category
- Pinned indicator
- Title
- Short message
- Posted by
- Posted time

Avoid unnecessary actions on student announcement cards.

---

# 15. Upcoming Deadlines

Display upcoming deadlines chronologically.

Example:

18 AUG  
AOA  
Assignment 2

20 AUG  
Full Stack Development  
Experiment 4

22 AUG  
Data Warehousing  
Practical Submission

24 AUG  
Cloud Computing  
Quiz

26 AUG  
Mini Project  
Project Review

Keep this section compact.

A complicated calendar is not required for the initial frontend.

---

# 16. All Deadlines Page

Purpose:

Allow students to browse academic deadlines.

Possible UI:

- Page heading
- Search bar
- Filter controls
- Deadline list/cards

Planned filters:

- Subject
- Type
- Priority
- Status

Status options may eventually include:

- Due Today
- Due Tomorrow
- This Week
- Upcoming
- Past

During Experiment 1, filtering is visual/static only.

Actual filtering belongs to later React experiments.

---

# 17. Announcements Page

Purpose:

Provide one organized academic announcement board instead of scattered class messages.

Possible UI:

- Page heading
- Search
- Category filters
- Priority filters
- Announcement feed

Possible categories:

- Academic
- Examination
- Lecture
- Practical
- Department
- Event
- General

During Experiment 1, filters are visual/static only.

---

# 18. Teacher / Admin Interface

Teacher/Admin UI should use the same overall DeadlineHub design system.

It should remain simple.

Primary future areas:

- Dashboard
- Classes
- Deadlines
- Announcements
- Subjects

Do not make it look like a complex enterprise administration panel.

---

# 19. Class Management

Example class card:

D15C

Information Technology  
Semester 5  
72 Students

Class Code:

D15C-5IT

Possible actions:

- Copy Code
- View Students
- Join Requests

During Experiment 1, these are static UI elements only.

---

# 20. Join Requests

Teacher/Admin should eventually see requests such as:

Neel Kalekar  
neel@college.edu  
Student Code: 2024XXXX

Actions:

- Approve
- Reject

During Experiment 1 these controls have no backend functionality.

---

# 21. Create Deadline UI

Teacher/Admin deadline form may visually contain:

- Title
- Description
- Subject
- Type
- Priority
- Due Date
- Due Time
- Target Students

Target selection may include:

- Branch
- Semester
- Division(s)
- All Divisions

During Experiment 1, form submission does not need to persist data.

---

# 22. Create Announcement UI

Possible fields:

- Title
- Message
- Category
- Priority
- Pin announcement
- Target Students

Again, Experiment 1 only requires UI.

---

# 23. Responsive Design

## Desktop

- Sidebar/navigation
- Spacious content area
- Multi-column layout where useful

## Tablet

- Reduced navigation
- One/two-column layouts depending on available width

## Mobile

Mobile should be intentionally designed rather than simply shrinking desktop.

Use:

- Stacked cards
- Compact navigation
- Readable text
- Touch-friendly controls
- Important information near the top

Avoid:

- Horizontal scrolling
- Tiny buttons
- Overcrowded cards

---

# 24. Experiment 1 Frontend Rules

Experiment 1 is focused on Tailwind CSS and responsive interface development.

Use:

- React
- Tailwind CSS
- Hardcoded mock data

Do NOT implement:

- Real login
- Database calls
- API requests
- JWT
- Backend
- Socket.IO
- Persistent forms
- Real approval logic
- Functional search/filtering unless specifically required by the experiment

Interactive application logic should be introduced in the appropriate later experiments.

---

# 25. Design Reference

The initial visual direction was explored using Stitch.

The Stitch output is a design reference, not a strict implementation specification.

DeadlineHub may adapt the design to improve:

- Usability
- Responsiveness
- Simplicity
- Implementation feasibility

Do not blindly copy unnecessary elements from the reference design.

---

# 26. Frontend Principle

Every screen should support DeadlineHub's core purpose:

> Replace scattered academic deadline and announcement messages with one simple, organized and easy-to-check interface.

# DeadlineHub — Product Requirements Document

## 1. Product Name

**DeadlineHub — Smart Academic Deadline & Announcement Board**

---

## 2. Product Purpose

DeadlineHub is a centralized academic information platform for college students.

Students currently receive important academic information through multiple channels such as:

* WhatsApp groups
* Faculty messages
* CR messages
* PDFs
* Google Classroom
* Verbal announcements

The information exists, but students have to remember **where to look and when to act**.

DeadlineHub provides one organized place to quickly check:

* What's due?
* What's coming up?
* What's changed?
* What's important?

---

## 3. Core Product Principle

DeadlineHub is primarily an **academic reminder and announcement platform**.

It is NOT intended to become:

* An assignment submission system
* A complete LMS
* A college ERP
* A chat application
* A marks or attendance portal

Students do not submit assignments through DeadlineHub.

Deadline cards are only used to communicate deadlines and reminders.

---

## 4. Target Users

The initial version has two permission levels.

### Student

Students can eventually:

* Register
* Login
* Join a class/division
* View deadlines
* View announcements
* Search deadlines
* Filter deadlines
* Search announcements
* Filter announcements
* View urgent and upcoming information

### Teacher / Admin / CR

Teacher, Admin and CR use the same administrative permission level in the MVP.

They can eventually:

* Login
* Create/manage classes
* Approve student join requests
* Add students manually
* Add deadlines
* Edit deadlines
* Archive/delete deadlines
* Add announcements
* Edit announcements
* Archive announcements
* Pin important announcements
* Manage subjects

---

## 5. Student Identity

Each student account may contain:

* Full name
* College email
* Student code / roll number
* Password
* Role
* Class membership

College email and student code should be unique identifiers.

---

## 6. Class / Division Model

DeadlineHub organizes students by class/division.

Example:

* Branch: Information Technology
* Semester: 5
* Division: D15C

Each class has a join code.

Example:

`D15C-5IT`

---

## 7. Student Joining Flow

Student registers

→ enters class join code

→ DeadlineHub displays class information

→ student requests to join

→ Teacher/Admin/CR approves request

→ student becomes a member of the class

→ student sees deadlines and announcements targeted to that class

A Teacher/Admin/CR can also add a student using:

* College email

OR

* Student code / roll number

---

## 8. Deadline Module

Deadlines represent academic activities that have a due date or time.

Examples:

* Assignment
* Practical
* Experiment
* Viva
* Quiz
* Examination
* Project review
* Registration
* Form submission
* Report submission

A deadline may contain:

* Title
* Description
* Subject
* Type
* Priority
* Due date/time
* Target class/division
* Posted by
* Created/updated time

DeadlineHub should automatically communicate urgency visually.

Examples:

* Due Today
* Due Tomorrow
* Due in 2–3 Days
* This Week
* Upcoming
* Past

There must be **no Submit button** on deadline cards.

---

## 9. Announcement Module

Announcements are used for important academic information that may not have a deadline.

Examples:

* Lecture cancelled
* Practical room changed
* Exam instructions
* Timetable modification
* Project review schedule
* Department notice
* Event information
* Registration instructions

Announcements may contain:

* Title
* Message
* Category
* Priority
* Pinned status
* Target class/division
* Posted by
* Created/updated time

Possible priorities:

* Normal
* Important
* Urgent

Important announcements may be pinned.

---

## 10. Content Targeting

A deadline or announcement may target:

* One division
* Multiple divisions
* All relevant divisions

Example:

A Teacher/Admin/CR may publish a deadline for:

`IT • Semester 5 • D15C`

or:

`IT • Semester 5 • D15A, D15B, D15C`

or:

`IT • Semester 5 • All Divisions`

---

## 11. Student Dashboard

The dashboard should immediately answer:

* What needs my attention?
* What is due soon?
* What announcements are important?
* What is coming next?

Main sections:

1. Greeting and class information
2. Needs Attention
3. Latest Announcements
4. Upcoming Deadlines

The dashboard should remain simple and easy to scan.

---

## 12. Main Screens

### Public

* Welcome / Role Selection
* Student Login
* Teacher/Admin Login
* Student Registration

### Student

* Join Class
* Join Request Status
* Dashboard
* Deadlines
* Announcements
* Deadline Details

### Teacher / Admin / CR

* Dashboard
* Classes
* Join Requests
* Manage Deadlines
* Create/Edit Deadline
* Manage Announcements
* Create/Edit Announcement
* Manage Subjects

Some create/edit actions may later use modals instead of separate pages.

---

## 13. Search and Filtering

Students should eventually be able to search and filter information.

Deadline filters may include:

* Subject
* Type
* Priority
* Date
* Due Today
* Due Tomorrow
* This Week
* Upcoming
* Past

Announcement filters may include:

* Category
* Priority
* Date

---

## 14. Real-Time Updates

In a later experiment, DeadlineHub will use Socket.IO/WebSockets.

Examples:

* New deadline posted
* Deadline updated
* Deadline removed
* New announcement posted
* Announcement updated

Students currently using DeadlineHub should receive updates without manually refreshing.

This is NOT part of Experiment 1.

---

## 15. MVP

The final MVP should eventually include:

* Student registration/login
* Teacher/Admin login
* Student identification using email/student code
* Class joining using join code
* Join request approval
* Student dashboard
* Deadline listing
* Announcement board
* Search/filter
* Automatic deadline urgency
* Admin deadline management
* Admin announcement management
* Subject management
* Authentication and authorization
* Real-time updates

---

## 16. Experiment-Based Development

DeadlineHub will be built incrementally.

### Experiment 1

Tailwind CSS — static responsive UI

### Experiment 2

React Hooks — interaction, search, filters, deadline calculations

### Experiment 3

Context API / Redux — global state

### Experiment 4

MongoDB + Mongoose — database and CRUD

### Experiment 5

Secure REST APIs — backend validation and security

### Experiment 6

JWT — authentication and roles

### Experiment 7

Postman — API testing

### Experiment 8

WebSockets — real-time updates

### Experiment 9

CI/CD — deployment

### Experiment 10

Docker — containerization

Each experiment extends the same application.

---

## 17. Experiment 1 Scope

Experiment 1 should only focus on static responsive frontend design.

Use:

* React
* Tailwind CSS
* Hardcoded mock data

Possible static UI screens:

* Welcome screen
* Student login
* Teacher/Admin login
* Join class
* Student dashboard
* Deadlines
* Announcements
* Basic Teacher/Admin interface

Do NOT implement:

* Real authentication
* Backend
* Database
* APIs
* JWT
* WebSockets
* Real class approval logic

---

## 18. Out of Scope

The MVP should not include:

* Assignment submission
* File uploads
* Marks
* Attendance
* Chat
* AI assistant
* Notes sharing
* Automatic timetable generation
* Native mobile app
* Full college ERP functionality
* Google Classroom replacement

---

## 19. Design Goal

DeadlineHub should be:

* Easy to use
* Visually attractive
* Modern
* Minimal
* Student-friendly
* Responsive
* Fast to understand

A student should understand the important information within a few seconds of opening the dashboard.

When visual complexity conflicts with usability, prioritize usability.

---

## 20. One-Line Pitch

**DeadlineHub is a centralized academic deadline and announcement board that helps students quickly see what's due, what's coming up, and what's important without searching through scattered class messages and platforms.**

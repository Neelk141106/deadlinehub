# DeadlineHub — Experiment 7: Postman API Testing Documentation

## Experiment Overview

- **Experiment**: Experiment 7 — Validating RESTful APIs using Postman
- **Scope**:
  - E7-001 — Postman Collection & API Testing Setup
  - E7-002 — Validate GET APIs
  - E7-003 — Validate POST APIs
  - E7-004 — Validate PUT and DELETE APIs
  - E7-005 — JWT Authentication Testing
  - E7-006 — Role-Based Authorization Testing
- **Base URL**: `http://localhost:5000`
- **Environment**: Node.js / Express backend with MongoDB Atlas persistence, JWT authentication, role-based authorization (`teacher` vs `student`), and centralized error handling.
- **Collection File**: `postman/DeadlineHub_API.postman_collection.json`
- **Environment File**: `postman/DeadlineHub_Environment.postman_environment.json`

---

## Postman Collection Structure

```
DeadlineHub API
├── Auth
│   ├── Register
│   ├── Login - Student
│   ├── Login - Teacher
│   └── Get Current User
├── Deadlines
│   ├── GET
│   │   ├── GET All Deadlines (200)
│   │   ├── GET Deadline by ID (200)
│   │   ├── GET Deadlines - Missing Token (401)
│   │   ├── GET Deadline by ID - Malformed ID (400)
│   │   └── GET Deadline by ID - Nonexistent ID (404)
│   ├── POST
│   │   ├── POST Create Deadline - Teacher (201)
│   │   ├── POST Create Deadline - Missing Required Fields (400)
│   │   ├── POST Create Deadline - Invalid Data (400)
│   │   ├── POST Create Deadline - No JWT (401)
│   │   └── POST Create Deadline - Student JWT (403)
│   ├── PUT
│   │   ├── PUT Update Deadline - Teacher (200)
│   │   ├── PUT Update Deadline - Malformed ID (400)
│   │   ├── PUT Update Deadline - Nonexistent ID (404)
│   │   ├── PUT Update Deadline - Student JWT (403)
│   │   └── PUT Update Deadline - No JWT (401)
│   └── DELETE
│       ├── DELETE Deadline - Teacher (200)
│       ├── DELETE Deadline - Malformed ID (400)
│       ├── DELETE Deadline - Nonexistent ID (404)
│       ├── DELETE Deadline - Student JWT (403)
│       └── DELETE Deadline - No JWT (401)
└── Announcements
    ├── GET
    │   ├── GET All Announcements (200)
    │   ├── GET Announcement by ID (200)
    │   ├── GET Announcements - Missing Token (401)
    │   ├── GET Announcement by ID - Malformed ID (400)
    │   └── GET Announcement by ID - Nonexistent ID (404)
    ├── POST
    │   ├── POST Create Announcement - Teacher (201)
    │   ├── POST Create Announcement - Missing Required Fields (400)
    │   ├── POST Create Announcement - Invalid Data (400)
    │   ├── POST Create Announcement - No JWT (401)
    │   └── POST Create Announcement - Student JWT (403)
    ├── PUT
    │   ├── PUT Update Announcement - Teacher (200)
    │   ├── PUT Update Announcement - Malformed ID (400)
    │   ├── PUT Update Announcement - Nonexistent ID (404)
    │   ├── PUT Update Announcement - Student JWT (403)
    │   └── PUT Update Announcement - No JWT (401)
    └── DELETE
        ├── DELETE Announcement - Teacher (200)
        ├── DELETE Announcement - Malformed ID (400)
        ├── DELETE Announcement - Nonexistent ID (404)
        ├── DELETE Announcement - Student JWT (403)
        └── DELETE Announcement - No JWT (401)
```

---

## E7-005: JWT Authentication Testing

Tested against `POST /api/auth/login` and `GET /api/auth/me`:

| Test Case | Method | Endpoint | Auth Header | Body / Params | Expected Status | Actual Status | Response Message / Data | Result |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| 1. Valid Student Credentials | `POST` | `/api/auth/login` | None | `{"email":"student_e7@college.edu","password":"..."}` | `200` | `200` | JWT token returned; `user.role: "student"` | **PASSED** |
| 2. Valid Teacher Credentials | `POST` | `/api/auth/login` | None | `{"email":"teacher_e7@college.edu","password":"..."}` | `200` | `200` | JWT token returned; `user.role: "teacher"` | **PASSED** |
| 3. Wrong Password | `POST` | `/api/auth/login` | None | `{"email":"student_e7@college.edu","password":"wrong"}` | `401` | `401` | `{"success":false,"message":"Invalid email or password"}` | **PASSED** |
| 4. Unknown Email | `POST` | `/api/auth/login` | None | `{"email":"unknown@college.edu","password":"..."}` | `401` | `401` | `{"success":false,"message":"Invalid email or password"}` | **PASSED** |
| 5a. Missing Both Fields | `POST` | `/api/auth/login` | None | `{}` | `400` | `400` | `{"success":false,"message":"Please provide email and password"}` | **PASSED** |
| 5b. Missing Password | `POST` | `/api/auth/login` | None | `{"email":"student_e7@college.edu"}` | `400` | `400` | `{"success":false,"message":"Please provide email and password"}` | **PASSED** |
| 6. Without Auth Header | `GET` | `/api/auth/me` | None | None | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |
| 7. With Invalid JWT | `GET` | `/api/auth/me` | `Bearer invalid.jwt` | None | `401` | `401` | `{"success":false,"message":"Invalid token. Authentication failed."}` | **PASSED** |
| 8. With Student JWT | `GET` | `/api/auth/me` | `Bearer {{studentToken}}` | None | `200` | `200` | User profile returned (`role: "student"`, no password) | **PASSED** |
| 9. With Teacher JWT | `GET` | `/api/auth/me` | `Bearer {{teacherToken}}` | None | `200` | `200` | User profile returned (`role: "teacher"`, no password) | **PASSED** |

---

## E7-006: Role-Based Authorization Testing

Tested using two distinct Postman tokens: `{{studentToken}}` and `{{teacherToken}}`.

### Student Role Tests

| Test Case | Method | Endpoint | Auth | Expected Status | Actual Status | Semantics & Verification | Result |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| Student Read Deadlines | `GET` | `/api/deadlines` | Student JWT | `200` | `200` | Read access permitted | **PASSED** |
| Student Read Announcements | `GET` | `/api/announcements` | Student JWT | `200` | `200` | Read access permitted | **PASSED** |
| Student Create Deadline | `POST` | `/api/deadlines` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |
| Student Update Deadline | `PUT` | `/api/deadlines/:id` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |
| Student Delete Deadline | `DELETE` | `/api/deadlines/:id` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |
| Student Create Announcement | `POST` | `/api/announcements` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |
| Student Update Announcement | `PUT` | `/api/announcements/:id` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |
| Student Delete Announcement | `DELETE` | `/api/announcements/:id` | Student JWT | `403` | `403` | Forbidden: requires teacher role | **PASSED** |

### Teacher Role Tests

| Test Case | Method | Endpoint | Auth | Expected Status | Actual Status | Semantics & Verification | Result |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| Teacher Read Deadlines | `GET` | `/api/deadlines` | Teacher JWT | `200` | `200` | Read access permitted | **PASSED** |
| Teacher Create Deadline | `POST` | `/api/deadlines` | Teacher JWT | `201` | `201` | Allowed; document created | **PASSED** |
| Teacher Update Deadline | `PUT` | `/api/deadlines/:id` | Teacher JWT | `200` | `200` | Allowed; document updated | **PASSED** |
| Teacher Delete Deadline | `DELETE` | `/api/deadlines/:id` | Teacher JWT | `200` | `200` | Allowed; document deleted | **PASSED** |
| Teacher Read Announcements | `GET` | `/api/announcements` | Teacher JWT | `200` | `200` | Read access permitted | **PASSED** |
| Teacher Create Announcement | `POST` | `/api/announcements` | Teacher JWT | `201` | `201` | Allowed; document created | **PASSED** |
| Teacher Update Announcement | `PUT` | `/api/announcements/:id` | Teacher JWT | `200` | `200` | Allowed; document updated | **PASSED** |
| Teacher Delete Announcement | `DELETE` | `/api/announcements/:id` | Teacher JWT | `200` | `200` | Allowed; document deleted | **PASSED** |

---

## 401 Unauthorized vs 403 Forbidden Semantic Distinction

- **401 Unauthorized**:
  - Meaning: The requester has not provided valid authentication credentials.
  - Triggered by: Missing `Authorization` header, missing `Bearer ` prefix, expired token, or signature verification failure.
  - Example Response: `{"success":false,"message":"Authentication required. No token provided."}` or `{"success":false,"message":"Invalid token. Authentication failed."}`.
- **403 Forbidden**:
  - Meaning: The requester is authenticated (valid JWT decoded), but their assigned role does not have permission to execute the requested operation.
  - Triggered by: A user with `role: "student"` attempting `POST`, `PUT`, or `DELETE` on `/api/deadlines` or `/api/announcements`.
  - Example Response: `{"success":false,"message":"Forbidden: this action requires one of the following roles: teacher."}`.

---

## E7-002: GET APIs Validation & Test Results

| Endpoint | Method | Auth Required | Expected Status | Actual Status | Purpose | Result |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/deadlines` | `GET` | Yes (Bearer) | `200` | `200` | Fetch all deadlines sorted chronologically | **PASSED** |
| `/api/deadlines/:id` | `GET` | Yes (Bearer) | `200` | `200` | Fetch single deadline by valid ObjectId | **PASSED** |
| `/api/announcements` | `GET` | Yes (Bearer) | `200` | `200` | Fetch all announcements (pinned first, then chronological) | **PASSED** |
| `/api/announcements/:id` | `GET` | Yes (Bearer) | `200` | `200` | Fetch single announcement by valid ObjectId | **PASSED** |
| `/api/deadlines` | `GET` | No Auth | `401` | `401` | Reject unauthenticated request | **PASSED** |
| `/api/deadlines/invalid-id-123` | `GET` | Yes (Bearer) | `400` | `400` | Intercept malformed ObjectId | **PASSED** |
| `/api/deadlines/000000000000000000000000` | `GET` | Yes (Bearer) | `404` | `404` | Handle nonexistent valid ObjectId | **PASSED** |
| `/api/announcements` | `GET` | No Auth | `401` | `401` | Reject unauthenticated request | **PASSED** |
| `/api/announcements/invalid-id-123` | `GET` | Yes (Bearer) | `400` | `400` | Intercept malformed ObjectId | **PASSED** |
| `/api/announcements/000000000000000000000000` | `GET` | Yes (Bearer) | `404` | `404` | Handle nonexistent valid ObjectId | **PASSED** |

---

## E7-003 & E7-004: POST, PUT & DELETE Validation

| Endpoint | Method | Action | Auth | Expected Status | Actual Status | Result |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| `/api/deadlines` | `POST` | Valid creation | Teacher JWT | `201` | `201` | **PASSED** |
| `/api/deadlines` | `POST` | Missing required fields | Teacher JWT | `400` | `400` | **PASSED** |
| `/api/deadlines` | `POST` | Invalid date | Teacher JWT | `400` | `400` | **PASSED** |
| `/api/deadlines/:id` | `PUT` | Valid update | Teacher JWT | `200` | `200` | **PASSED** |
| `/api/deadlines/:id` | `DELETE` | Valid delete | Teacher JWT | `200` | `200` | **PASSED** |
| `/api/announcements` | `POST` | Valid creation | Teacher JWT | `201` | `201` | **PASSED** |
| `/api/announcements` | `POST` | Missing title/message | Teacher JWT | `400` | `400` | **PASSED** |
| `/api/announcements/:id` | `PUT` | Valid update | Teacher JWT | `200` | `200` | **PASSED** |
| `/api/announcements/:id` | `DELETE` | Valid delete | Teacher JWT | `200` | `200` | **PASSED** |

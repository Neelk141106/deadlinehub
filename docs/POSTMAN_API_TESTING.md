# DeadlineHub — Experiment 7: Postman API Testing Documentation

## Experiment Overview

- **Experiment**: Experiment 7 — Validating RESTful APIs using Postman
- **Scope**:
  - E7-001 — Postman Collection & API Testing Setup
  - E7-002 — Validate GET APIs
  - E7-003 — Validate POST APIs
  - E7-004 — Validate PUT and DELETE APIs
- **Base URL**: `http://localhost:5000`
- **Environment**: Node.js / Express backend with MongoDB Atlas persistence, JWT authentication, role-based authorization (`teacher` vs `student`), and centralized error handling.
- **Collection File**: `postman/DeadlineHub_API.postman_collection.json`
- **Environment File**: `postman/DeadlineHub_Environment.postman_environment.json`

---

## Postman Collection Structure

```
DeadlineHub API
├── Auth
│   ├── Register User (POST /api/auth/register)
│   ├── Login Teacher (POST /api/auth/login)
│   ├── Login Student (POST /api/auth/login)
│   └── Get Authenticated User Profile (GET /api/auth/me)
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

## E7-002: GET APIs Validation & Test Results

All GET endpoints were executed against the active backend server (`http://localhost:5000`) and validated.

| Endpoint | Method | Auth Required | Expected Status | Actual Status | Purpose | Result |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/deadlines` | `GET` | Yes (Bearer) | `200` | `200` | Fetch all deadlines sorted chronologically | **PASSED** |
| `/api/deadlines/:id` | `GET` | Yes (Bearer) | `200` | `200` | Fetch single deadline by valid ObjectId | **PASSED** |
| `/api/announcements` | `GET` | Yes (Bearer) | `200` | `200` | Fetch all announcements (pinned first, then chronological) | **PASSED** |
| `/api/announcements/:id` | `GET` | Yes (Bearer) | `200` | `200` | Fetch single announcement by valid ObjectId | **PASSED** |
| `/api/auth/me` | `GET` | Yes (Bearer) | `200` | `200` | Retrieve authenticated user profile | **PASSED** |
| `/api/deadlines` | `GET` | No Auth | `401` | `401` | Reject unauthenticated request | **PASSED** |
| `/api/deadlines/invalid-id-123` | `GET` | Yes (Bearer) | `400` | `400` | Intercept malformed ObjectId | **PASSED** |
| `/api/deadlines/000000000000000000000000` | `GET` | Yes (Bearer) | `404` | `404` | Handle nonexistent valid ObjectId | **PASSED** |
| `/api/announcements` | `GET` | No Auth | `401` | `401` | Reject unauthenticated request | **PASSED** |
| `/api/announcements/invalid-id-123` | `GET` | Yes (Bearer) | `400` | `400` | Intercept malformed ObjectId | **PASSED** |
| `/api/announcements/000000000000000000000000` | `GET` | Yes (Bearer) | `404` | `404` | Handle nonexistent valid ObjectId | **PASSED** |

---

## E7-003: POST APIs Validation & Test Results

POST endpoints were verified for Teacher authorization, payload validation, missing authentication, and RBAC rejection for Student role.

### 1. POST /api/deadlines

| Test Case | Method | Endpoint | Auth | Request Purpose | Expected Status | Actual Status | Result |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| Valid Teacher Request | `POST` | `/api/deadlines` | Teacher JWT | Create deadline with valid title, dueDate, etc. | `201` | `201` | **PASSED** |
| MongoDB Persistence | `GET` | `/api/deadlines/:id` | Teacher JWT | Confirm created document exists in MongoDB | `200` | `200` | **PASSED** |
| Missing Required Fields | `POST` | `/api/deadlines` | Teacher JWT | Omit title and dueDate in payload | `400` | `400` | **PASSED** |
| Invalid Due Date | `POST` | `/api/deadlines` | Teacher JWT | Pass malformed non-date string as `dueDate` | `400` | `400` | **PASSED** |
| Empty Title | `POST` | `/api/deadlines` | Teacher JWT | Pass whitespace-only title | `400` | `400` | **PASSED** |
| Missing JWT | `POST` | `/api/deadlines` | None | Attempt creation without Authorization header | `401` | `401` | **PASSED** |
| Student JWT Attempt | `POST` | `/api/deadlines` | Student JWT | Attempt creation with student role (RBAC check) | `403` | `403` | **PASSED** |

- **Response Payloads Verified**:
  - `201 Created`: Returns newly created Deadline document with `_id`, `createdAt`, and `updatedAt`.
  - `400 Bad Request`: `{"success":false,"message":"Title is required and cannot be empty"}` / `{"success":false,"message":"Due date must be a valid date"}`.
  - `401 Unauthorized`: `{"success":false,"message":"Authentication required. No token provided."}`.
  - `403 Forbidden`: `{"success":false,"message":"Forbidden: teacher role required"}`.

---

### 2. POST /api/announcements

| Test Case | Method | Endpoint | Auth | Request Purpose | Expected Status | Actual Status | Result |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| Valid Teacher Request | `POST` | `/api/announcements` | Teacher JWT | Create announcement with title, message, category | `201` | `201` | **PASSED** |
| MongoDB Persistence | `GET` | `/api/announcements/:id` | Teacher JWT | Confirm created document exists in MongoDB | `200` | `200` | **PASSED** |
| Missing Required Fields | `POST` | `/api/announcements` | Teacher JWT | Omit title and message in payload | `400` | `400` | **PASSED** |
| Empty Message | `POST` | `/api/announcements` | Teacher JWT | Pass whitespace-only message | `400` | `400` | **PASSED** |
| Missing JWT | `POST` | `/api/announcements` | None | Attempt creation without Authorization header | `401` | `401` | **PASSED** |
| Student JWT Attempt | `POST` | `/api/announcements` | Student JWT | Attempt creation with student role (RBAC check) | `403` | `403` | **PASSED** |

- **Response Payloads Verified**:
  - `201 Created`: Returns newly created Announcement document with `_id`, `isPinned`, `priorityVariant`, and timestamps.
  - `400 Bad Request`: `{"success":false,"message":"Title is required and cannot be empty"}` / `{"success":false,"message":"Message is required and cannot be empty"}`.
  - `401 Unauthorized`: `{"success":false,"message":"Authentication required. No token provided."}`.
  - `403 Forbidden`: `{"success":false,"message":"Forbidden: teacher role required"}`.

---

## E7-004: PUT & DELETE APIs Validation & Test Results

PUT and DELETE endpoints were tested using temporary test documents created specifically for this stage to protect existing application data.

### 1. PUT & DELETE /api/deadlines/:id

| Test Case | Method | Endpoint | Auth | Request Purpose | Expected Status | Actual Status | Result |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| Missing JWT (PUT) | `PUT` | `/api/deadlines/:id` | None | Attempt update without token | `401` | `401` | **PASSED** |
| Student JWT (PUT) | `PUT` | `/api/deadlines/:id` | Student JWT | Attempt update with student role (RBAC) | `403` | `403` | **PASSED** |
| Malformed ID (PUT) | `PUT` | `/api/deadlines/malformed-id-999` | Teacher JWT | Update with invalid non-hex ID | `400` | `400` | **PASSED** |
| Nonexistent ID (PUT) | `PUT` | `/api/deadlines/000000000000000000000000` | Teacher JWT | Update with valid hex ID not in DB | `404` | `404` | **PASSED** |
| Valid Teacher (PUT) | `PUT` | `/api/deadlines/:id` | Teacher JWT | Update title & priority of test deadline | `200` | `200` | **PASSED** |
| MongoDB Update Verified | `GET` | `/api/deadlines/:id` | Teacher JWT | Verify updated fields in MongoDB | `200` | `200` | **PASSED** |
| Missing JWT (DELETE) | `DELETE` | `/api/deadlines/:id` | None | Attempt deletion without token | `401` | `401` | **PASSED** |
| Student JWT (DELETE) | `DELETE` | `/api/deadlines/:id` | Student JWT | Attempt deletion with student role (RBAC) | `403` | `403` | **PASSED** |
| Malformed ID (DELETE) | `DELETE` | `/api/deadlines/malformed-id-999` | Teacher JWT | Delete with invalid non-hex ID | `400` | `400` | **PASSED** |
| Nonexistent ID (DELETE) | `DELETE` | `/api/deadlines/000000000000000000000000` | Teacher JWT | Delete with valid hex ID not in DB | `404` | `404` | **PASSED** |
| Valid Teacher (DELETE) | `DELETE` | `/api/deadlines/:id` | Teacher JWT | Delete test deadline document | `200` | `200` | **PASSED** |
| MongoDB Deletion Verified | `GET` | `/api/deadlines/:id` | Teacher JWT | Verify document is permanently removed | `404` | `404` | **PASSED** |

---

### 2. PUT & DELETE /api/announcements/:id

| Test Case | Method | Endpoint | Auth | Request Purpose | Expected Status | Actual Status | Result |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| Missing JWT (PUT) | `PUT` | `/api/announcements/:id` | None | Attempt update without token | `401` | `401` | **PASSED** |
| Student JWT (PUT) | `PUT` | `/api/announcements/:id` | Student JWT | Attempt update with student role (RBAC) | `403` | `403` | **PASSED** |
| Malformed ID (PUT) | `PUT` | `/api/announcements/malformed-id-999` | Teacher JWT | Update with invalid non-hex ID | `400` | `400` | **PASSED** |
| Nonexistent ID (PUT) | `PUT` | `/api/announcements/000000000000000000000000` | Teacher JWT | Update with valid hex ID not in DB | `404` | `404` | **PASSED** |
| Valid Teacher (PUT) | `PUT` | `/api/announcements/:id` | Teacher JWT | Update title & priority of test announcement | `200` | `200` | **PASSED** |
| MongoDB Update Verified | `GET` | `/api/announcements/:id` | Teacher JWT | Verify updated fields in MongoDB | `200` | `200` | **PASSED** |
| Missing JWT (DELETE) | `DELETE` | `/api/announcements/:id` | None | Attempt deletion without token | `401` | `401` | **PASSED** |
| Student JWT (DELETE) | `DELETE` | `/api/announcements/:id` | Student JWT | Attempt deletion with student role (RBAC) | `403` | `403` | **PASSED** |
| Malformed ID (DELETE) | `DELETE` | `/api/announcements/malformed-id-999` | Teacher JWT | Delete with invalid non-hex ID | `400` | `400` | **PASSED** |
| Nonexistent ID (DELETE) | `DELETE` | `/api/announcements/000000000000000000000000` | Teacher JWT | Delete with valid hex ID not in DB | `404` | `404` | **PASSED** |
| Valid Teacher (DELETE) | `DELETE` | `/api/announcements/:id` | Teacher JWT | Delete test announcement document | `200` | `200` | **PASSED** |
| MongoDB Deletion Verified | `GET` | `/api/announcements/:id` | Teacher JWT | Verify document is permanently removed | `404` | `404` | **PASSED** |

---

## Security and Integrity Verification

1. **Role-Based Access Control (RBAC)**:
   - `student` role is strictly restricted to read-only (`GET`) requests on both `/api/deadlines` and `/api/announcements`.
   - Any mutation request (`POST`, `PUT`, `DELETE`) with a student token is intercepted by `roleMiddleware` returning `403 Forbidden` (`{"success":false,"message":"Forbidden: teacher role required"}`).
2. **Authentication Middleware**:
   - Requests omitting `Authorization: Bearer <token>` are intercepted immediately by `authMiddleware` returning `401 Unauthorized` (`{"success":false,"message":"Authentication required. No token provided."}`).
3. **Database Cast Protection**:
   - Requests with non-24-character hexadecimal IDs are intercepted by `validateObjectId` returning `400 Bad Request` (`{"success":false,"message":"Invalid ID format"}`), preventing unhandled Mongoose CastError exceptions.
4. **Data Lifecycle Safety**:
   - Test data used for PUT and DELETE validations was created dynamically during testing and purged cleanly upon completion, leaving existing project deadlines and announcements intact.

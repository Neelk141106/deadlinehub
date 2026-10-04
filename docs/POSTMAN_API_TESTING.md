# DeadlineHub — Experiment 7: Postman API Testing Documentation

## Experiment Overview

- **Experiment**: Experiment 7 — Validating RESTful APIs using Postman
- **Scope**: E7-001 (Postman Testing Setup) & E7-002 (Validate GET APIs)
- **Base URL**: `http://localhost:5000`
- **Environment**: Node.js / Express backend with MongoDB Atlas persistence, JWT authentication, and centralized error handling.
- **Collection File**: `postman/DeadlineHub_API.postman_collection.json`
- **Environment File**: `postman/DeadlineHub_Environment.postman_environment.json`

---

## Postman Collection Structure

```
DeadlineHub API
├── Auth
│   ├── Register User (POST /api/auth/register)
│   ├── Login User (POST /api/auth/login)
│   └── Get Authenticated User Profile (GET /api/auth/me)
├── Deadlines
│   ├── GET All Deadlines (GET /api/deadlines)
│   ├── GET Deadline by ID (GET /api/deadlines/:id)
│   ├── POST Create Deadline (POST /api/deadlines)
│   ├── PUT Update Deadline (PUT /api/deadlines/:id)
│   ├── DELETE Deadline (DELETE /api/deadlines/:id)
│   ├── GET Deadlines - Missing Token (401 Unauthorized)
│   ├── GET Deadline by ID - Malformed ID (400 Bad Request)
│   └── GET Deadline by ID - Nonexistent ID (404 Not Found)
└── Announcements
    ├── GET All Announcements (GET /api/announcements)
    ├── GET Announcement by ID (GET /api/announcements/:id)
    ├── POST Create Announcement (POST /api/announcements)
    ├── PUT Update Announcement (PUT /api/announcements/:id)
    ├── DELETE Announcement (DELETE /api/announcements/:id)
    ├── GET Announcements - Missing Token (401 Unauthorized)
    ├── GET Announcement by ID - Malformed ID (400 Bad Request)
    └── GET Announcement by ID - Nonexistent ID (404 Not Found)
```

---

## E7-002: GET APIs Validation & Test Results

All tests below were executed against the active backend server (`http://localhost:5000`) and validated.

### 1. GET /api/deadlines (All Deadlines)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/deadlines`
- **Authentication required?**: Yes (`Authorization: Bearer {{token}}`)
- **Expected status**: `200 OK`
- **Actual status**: `200 OK`
- **Purpose**: Fetch all academic deadlines sorted chronologically by due date (`dueDate: 1, createdAt: -1`).
- **Response Format**: Array of deadline objects containing `_id`, `title`, `subject`, `description`, `type`, `priority`, `dueDate`, `dueTime`, `branch`, `semester`, `division`, `createdAt`, `updatedAt`.
- **Result**: **PASSED**

---

### 2. GET /api/deadlines/:id (Single Deadline by ID)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/deadlines/:id` (Tested with ID: `6a94f544fd4a9deb1cf05e9d`)
- **Authentication required?**: Yes (`Authorization: Bearer {{token}}`)
- **Expected status**: `200 OK`
- **Actual status**: `200 OK`
- **Purpose**: Retrieve the details of an individual deadline by its unique MongoDB ObjectId.
- **Response Format**: JSON object representing the deadline entity.
- **Result**: **PASSED**

---

### 3. GET /api/announcements (All Announcements)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/announcements`
- **Authentication required?**: Yes (`Authorization: Bearer {{token}}`)
- **Expected status**: `200 OK`
- **Actual status**: `200 OK`
- **Purpose**: Fetch all class announcements sorted with pinned items first, then descending by timestamp (`isPinned: -1, postedAt: -1, createdAt: -1`).
- **Response Format**: Array of announcement objects containing `_id`, `title`, `message`, `category`, `priority`, `priorityVariant`, `priorityText`, `isPinned`, `postedBy`, `postedTime`, `postedAt`, `createdAt`, `updatedAt`.
- **Result**: **PASSED**

---

### 4. GET /api/announcements/:id (Single Announcement by ID)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/announcements/:id` (Tested with ID: `6a914f4a18ad8b56c9d3d7d1`)
- **Authentication required?**: Yes (`Authorization: Bearer {{token}}`)
- **Expected status**: `200 OK`
- **Actual status**: `200 OK`
- **Purpose**: Retrieve the details of an individual announcement by its unique MongoDB ObjectId.
- **Response Format**: JSON object representing the announcement entity.
- **Result**: **PASSED**

---

### 5. GET /api/auth/me (Authenticated User Profile)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/me`
- **Authentication required?**: Yes (`Authorization: Bearer {{token}}`)
- **Expected status**: `200 OK`
- **Actual status**: `200 OK`
- **Purpose**: Verify the active JWT token and retrieve authenticated user profile information (passwords/hashes excluded).
- **Response Format**: `{ "success": true, "user": { "id", "name", "email", "role", ... } }`
- **Result**: **PASSED**

---

## Negative and Edge Case Validations

### 6. Missing Authentication Token (401 Unauthorized)

| Endpoint | Method | Authorization Header | Expected Status | Actual Status | Response Payload | Result |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/deadlines` | `GET` | *(None)* | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |
| `/api/deadlines/:id` | `GET` | *(None)* | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |
| `/api/announcements` | `GET` | *(None)* | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |
| `/api/announcements/:id` | `GET` | *(None)* | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |
| `/api/auth/me` | `GET` | *(None)* | `401` | `401` | `{"success":false,"message":"Authentication required. No token provided."}` | **PASSED** |

- **Purpose**: Ensure that all protected resource routes reject unauthenticated requests before reaching controller logic.
- **Result**: **PASSED**

---

### 7. Malformed ObjectId (400 Bad Request)

| Endpoint | Method | Parameter Value | Expected Status | Actual Status | Response Payload | Result |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/deadlines/invalid-id-123` | `GET` | `invalid-id-123` | `400` | `400` | `{"success":false,"message":"Invalid ID format"}` | **PASSED** |
| `/api/announcements/invalid-id-123` | `GET` | `invalid-id-123` | `400` | `400` | `{"success":false,"message":"Invalid ID format"}` | **PASSED** |

- **Purpose**: Ensure that malformed IDs (not conforming to 24-character hexadecimal ObjectId standard) are intercepted by validation middleware before querying the database, preventing unhandled CastErrors.
- **Result**: **PASSED**

---

### 8. Nonexistent Valid ObjectId (404 Not Found)

| Endpoint | Method | Parameter Value | Expected Status | Actual Status | Response Payload | Result |
| :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| `/api/deadlines/000000000000000000000000` | `GET` | `000000000000000000000000` | `404` | `404` | `{"success":false,"message":"Resource not found"}` | **PASSED** |
| `/api/announcements/000000000000000000000000` | `GET` | `000000000000000000000000` | `404` | `404` | `{"success":false,"message":"Resource not found"}` | **PASSED** |

- **Purpose**: Verify that syntactically valid ObjectIds that do not correspond to any document in MongoDB yield a clean `404 Resource not found` error rather than null or an unhandled crash.
- **Result**: **PASSED**

---

## Instructions for Postman Import & Execution

1. Open Postman desktop or web client.
2. Click **Import** (top left).
3. Select `postman/DeadlineHub_API.postman_collection.json` and `postman/DeadlineHub_Environment.postman_environment.json`.
4. Select the **DeadlineHub Local Environment** in the environment dropdown.
5. Execute `POST /api/auth/login` to automatically authenticate and populate `{{token}}` in the environment.
6. Execute the GET, POST, PUT, DELETE, and error test cases across the Auth, Deadlines, and Announcements folders.

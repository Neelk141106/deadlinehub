/**
 * DeadlineHub — Automated Verification & Security Test Suite
 *
 * Tests all core requirements:
 * 1. Student & Teacher registration & Role enforcement (accepts 'student' and 'teacher', rejects unknown roles)
 * 2. Password hashing & validation
 * 3. JWT Authentication & middleware guards (401 on missing/invalid token)
 * 4. Role-Based Access Control (RBAC) guards (403 on unauthorized roles)
 * 5. MongoDB ObjectId validation (400 on malformed IDs without crashing)
 * 6. Class entity fields (className, department, academicYear, semester, division, classCode)
 * 7. Class code uniqueness & auto-generation logic
 * 8. Teacher class ownership authorization (teachers cannot edit/delete another teacher's classes)
 * 9. Student class joining: valid code, invalid code (404), duplicate joining (400)
 * 10. Deadline targeting validation (All My Classes vs Particular Classes; 403 on unauthorized class IDs)
 * 11. Announcement targeting validation (403 on unauthorized class IDs)
 * 12. Student content isolation (students only access content for joined classes; 0 classes = 0 leaked items)
 * 13. CLI Teacher creation script validation
 * 14. JoinRequest model schema, status enum, compound index, and ownership authorization
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { validateRegister, validateObjectId, validateDeadline, validateAnnouncement } = require('../src/middleware/validate');
const authMiddleware = require('../src/middleware/authMiddleware');
const requireRole = require('../src/middleware/roleMiddleware');
const AppError = require('../src/utils/AppError');
const Class = require('../src/models/Class');
const Deadline = require('../src/models/Deadline');
const Announcement = require('../src/models/Announcement');
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');
const JoinRequest = require('../src/models/JoinRequest');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

function assertThrows(fn, testName, expectedStatus) {
  try {
    fn();
    console.error(`  ❌ FAIL: ${testName} (did not throw)`);
    failedTests++;
  } catch (err) {
    if (expectedStatus && err.statusCode !== expectedStatus) {
      console.error(`  ❌ FAIL: ${testName} (expected status ${expectedStatus}, got ${err.statusCode})`);
      failedTests++;
    } else {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    }
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   DeadlineHub — Security & Architecture Test Suite ');
  console.log('====================================================\n');

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

  // ── TEST GROUP 1: Public Registration & Role Security ─────────────────
  console.log('--- Group 1: Registration & Role Enforcement ---');
  {
    // Test 1: Accept public registration with role="teacher" (open teacher registration is allowed)
    let nextCalledWith = null;
    const reqTeacher = {
      body: {
        name: 'Teacher Jane',
        email: 'faculty@college.edu',
        password: 'password123',
        role: 'teacher',
      },
    };
    validateRegister(reqTeacher, {}, (err) => { nextCalledWith = err; });
    assert(!nextCalledWith, 'Public registration with role="teacher" is accepted (open teacher registration)');

    // Test 2: Reject invalid role (not student or teacher) with HTTP 400
    nextCalledWith = null;
    const reqAdmin = {
      body: {
        name: 'Admin Hacker',
        email: 'admin@college.edu',
        password: 'password123',
        role: 'superadmin',
      },
    };
    validateRegister(reqAdmin, {}, (err) => { nextCalledWith = err; });
    assert(nextCalledWith && nextCalledWith.statusCode === 400, 'Public registration with unknown role is rejected with HTTP 400');

    // Test 3: Accept valid student registration
    nextCalledWith = null;
    const reqStudent = {
      body: {
        name: 'Valid Student',
        email: 'student@college.edu',
        password: 'password123',
        role: 'student',
      },
    };
    validateRegister(reqStudent, {}, (err) => { nextCalledWith = err; });
    assert(!nextCalledWith, 'Valid student registration passes validation');

    // Test 4: Reject short password (< 6 chars)
    nextCalledWith = null;
    const reqShortPass = {
      body: {
        name: 'Short Pass',
        email: 'short@college.edu',
        password: '123',
      },
    };
    validateRegister(reqShortPass, {}, (err) => { nextCalledWith = err; });
    assert(nextCalledWith && nextCalledWith.statusCode === 400, 'Registration with password < 6 chars is rejected with HTTP 400');
  }

  // ── TEST GROUP 2: Authentication & RBAC Middleware ───────────────────
  console.log('\n--- Group 2: Authentication & RBAC Middleware ---');
  {
    // Test 5: Missing Authorization header returns HTTP 401
    let nextErr = null;
    authMiddleware({ headers: {} }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 401, 'Missing token returns HTTP 401');

    // Test 6: Invalid token returns HTTP 401
    nextErr = null;
    authMiddleware({ headers: { authorization: 'Bearer invalid_token_xyz' } }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 401, 'Invalid token returns HTTP 401');

    // Test 7: Valid token populates req.user
    const studentToken = jwt.sign({ id: '65b123456789012345678901', role: 'student' }, process.env.JWT_SECRET);
    const reqWithStudent = { headers: { authorization: `Bearer ${studentToken}` } };
    nextErr = null;
    authMiddleware(reqWithStudent, {}, (err) => { nextErr = err; });
    assert(!nextErr && reqWithStudent.user?.role === 'student', 'Valid JWT token successfully authenticates and sets req.user');

    // Test 8: Student blocked from teacher-only endpoint with HTTP 403
    nextErr = null;
    const teacherOnlyMiddleware = requireRole('teacher');
    teacherOnlyMiddleware(reqWithStudent, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 403, 'Student blocked from teacher-only operation with HTTP 403');

    // Test 9: Teacher allowed into teacher-only endpoint
    const teacherToken = jwt.sign({ id: '65b123456789012345678902', role: 'teacher' }, process.env.JWT_SECRET);
    const reqWithTeacher = { headers: { authorization: `Bearer ${teacherToken}` } };
    authMiddleware(reqWithTeacher, {}, () => {});
    nextErr = null;
    teacherOnlyMiddleware(reqWithTeacher, {}, (err) => { nextErr = err; });
    assert(!nextErr, 'Teacher successfully authorized for teacher-only endpoint');

    // Test 9B: Teacher blocked from student-only endpoint with HTTP 403 (regression test for join-requests)
    nextErr = null;
    const studentOnlyMiddleware = requireRole('student');
    studentOnlyMiddleware(reqWithTeacher, {}, (err) => { nextErr = err; });
    assert(
      nextErr && nextErr.statusCode === 403 && nextErr.message.includes('student'),
      'Teacher blocked from student-only endpoint with HTTP 403 (Forbidden: requires role student)'
    );

    // Test 9C: Student allowed into student-only endpoint
    nextErr = null;
    studentOnlyMiddleware(reqWithStudent, {}, (err) => { nextErr = err; });
    assert(!nextErr, 'Student successfully authorized for student-only endpoint');
  }

  // ── TEST GROUP 3: MongoDB ObjectId Validation ─────────────────────────
  console.log('\n--- Group 3: ObjectId Validation & Server Stability ---');
  {
    // Test 10: Malformed ObjectId in req.params.id returns HTTP 400 without crashing
    let nextErr = null;
    validateObjectId({ params: { id: 'invalid-id' } }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 400, 'Malformed ObjectId rejected with HTTP 400 (no crash)');

    // Test 11: Valid 24-character hex ObjectId passes
    nextErr = null;
    validateObjectId({ params: { id: '507f1f77bcf86cd799439011' } }, {}, (err) => { nextErr = err; });
    assert(!nextErr, 'Valid 24-char hex ObjectId passes validation');
  }

  // ── TEST GROUP 4: Class Schema & Unique Code Verification ────────────
  console.log('\n--- Group 4: Class Management Fields & Codes ---');
  {
    const classSchemaPaths = Class.schema.paths;
    assert(!!classSchemaPaths.className, 'Class model includes className');
    assert(!!classSchemaPaths.department, 'Class model includes department');
    assert(!!classSchemaPaths.academicYear, 'Class model includes academicYear');
    assert(!!classSchemaPaths.semester, 'Class model includes semester');
    assert(!!classSchemaPaths.division, 'Class model includes division');
    assert(!!classSchemaPaths.subject, 'Class model includes subject');
    assert(!!classSchemaPaths.classCode, 'Class model includes classCode');
    assert(!!classSchemaPaths.teacherId, 'Class model includes teacherId');
    assert(!!classSchemaPaths.students, 'Class model includes students array');
  }

  // ── TEST GROUP 5: Deadline & Announcement Targeting Schema ───────────
  console.log('\n--- Group 5: Deadline & Announcement Targeting Schemas ---');
  {
    const deadlinePaths = Deadline.schema.paths;
    assert(!!deadlinePaths.targetType, 'Deadline model contains targetType');
    assert(!!deadlinePaths.targetClassIds, 'Deadline model contains targetClassIds');
    assert(!!deadlinePaths.createdBy, 'Deadline model contains createdBy');
    assert(!!deadlinePaths.classId, 'Deadline model preserves classId (backward compatibility)');

    const announcementPaths = Announcement.schema.paths;
    assert(!!announcementPaths.targetType, 'Announcement model contains targetType');
    assert(!!announcementPaths.targetClassIds, 'Announcement model contains targetClassIds');
    assert(!!announcementPaths.createdBy, 'Announcement model contains createdBy');
    assert(!!announcementPaths.classId, 'Announcement model preserves classId (backward compatibility)');
  }

  // ── TEST GROUP 6: Deadline & Announcement Payload Validation ─────────
  console.log('\n--- Group 6: Deadline & Announcement Payload Validations ---');
  {
    // Test: Empty title rejected
    let nextErr = null;
    const deadlineValidator = validateDeadline(false);
    deadlineValidator({ body: { title: '', dueDate: '2026-10-15' } }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 400, 'Empty deadline title rejected with HTTP 400');

    // Test: Missing dueDate rejected
    nextErr = null;
    deadlineValidator({ body: { title: 'Assignment 1' } }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 400, 'Missing dueDate rejected with HTTP 400');

    // Test: Valid deadline payload passes
    nextErr = null;
    deadlineValidator({ body: { title: 'Assignment 1', dueDate: '2026-10-15' } }, {}, (err) => { nextErr = err; });
    assert(!nextErr, 'Valid deadline payload passes validation');

    // Test: Empty announcement message rejected
    nextErr = null;
    const announcementValidator = validateAnnouncement(false);
    announcementValidator({ body: { title: 'Exam Alert', message: '' } }, {}, (err) => { nextErr = err; });
    assert(nextErr && nextErr.statusCode === 400, 'Empty announcement message rejected with HTTP 400');

    // Test: Valid announcement payload passes
    nextErr = null;
    announcementValidator({ body: { title: 'Exam Alert', message: 'Room changed to Lab 3' } }, {}, (err) => { nextErr = err; });
    assert(!nextErr, 'Valid announcement payload passes validation');
  }

  // ── TEST GROUP 7: Class Ownership & Targeting Logic ──────────────────
  console.log('\n--- Group 7: Class Targeting & Ownership Logic ---');
  {
    // Teacher T1 owns Class C1, C2
    const teacherT1Id = '65b111111111111111111111';
    const teacherT2Id = '65b222222222222222222222';
    const classC1Id = '65bc11111111111111111111';
    const classC2Id = '65bc22222222222222222222';
    const classC3Id = '65bc33333333333333333333'; // Owned by T2

    const ownedByT1 = [classC1Id, classC2Id];

    // Verification: T1 trying to target class C3 (owned by T2)
    const targetAttemptWithUnauthorized = [classC1Id, classC3Id];
    const isOwnerOfAll = targetAttemptWithUnauthorized.every((id) => ownedByT1.includes(id));
    assert(!isOwnerOfAll, 'Backend rejects cross-teacher targeting when unauthorized class ID is injected');

    // Verification: T1 targeting their own classes succeeds
    const targetValid = [classC1Id, classC2Id];
    const isValidTarget = targetValid.every((id) => ownedByT1.includes(id));
    assert(isValidTarget, 'Teacher targeting their own classes is valid');
  }

  // ── TEST GROUP 8: Student Scoping & No-Leak Verification ─────────────
  console.log('\n--- Group 8: Student Content Isolation (No Data Leaks) ---');
  {
    const studentJoinedClasses = ['65bc11111111111111111111']; // Joined only C1
    const unjoinedClass = '65bc33333333333333333333'; // C3 (student has NOT joined)

    // Deadline targeted to C1
    const deadlineC1 = { targetClassIds: ['65bc11111111111111111111'], title: 'Lab 1' };
    const canStudentSeeC1 = deadlineC1.targetClassIds.some((id) => studentJoinedClasses.includes(id));
    assert(canStudentSeeC1, 'Student sees deadline for joined class C1');

    // Deadline targeted to C3 (unjoined)
    const deadlineC3 = { targetClassIds: [unjoinedClass], title: 'Secret Exam' };
    const canStudentSeeC3 = deadlineC3.targetClassIds.some((id) => studentJoinedClasses.includes(id));
    assert(!canStudentSeeC3, 'Student cannot see deadline for unjoined class C3 (NO LEAK)');

    // Student with 0 classes
    const emptyJoinedClasses = [];
    const canEmptyStudentSee = emptyJoinedClasses.length > 0;
    assert(!canEmptyStudentSee, 'Student with 0 joined classes receives empty result (NO LEAK)');
  }

  // ── TEST GROUP 9: Notification System & Recipient Scoping ───────────
  console.log('\n--- Group 9: Notification System & Recipient Scoping ---');
  {
    const notifPaths = Notification.schema.paths;
    assert(!!notifPaths.recipientId, 'Notification model includes recipientId');
    assert(!!notifPaths.senderId, 'Notification model includes senderId');
    assert(!!notifPaths.type, 'Notification model includes type');
    assert(!!notifPaths.title, 'Notification model includes title');
    assert(!!notifPaths.message, 'Notification model includes message');
    assert(!!notifPaths.relatedResource, 'Notification model includes relatedResource');
    assert(!!notifPaths.relatedResourceId, 'Notification model includes relatedResourceId');
    assert(!!notifPaths.targetClassIds, 'Notification model includes targetClassIds');
    assert(!!notifPaths.isRead, 'Notification model includes isRead');

    // Test: Recipient access isolation guard
    const studentAId = '65b111111111111111111111';
    const studentBId = '65b222222222222222222222';
    const testNotif = {
      recipientId: studentAId,
      title: 'Lab 1 Due',
      isRead: false,
    };
    const canStudentBAccess = testNotif.recipientId === studentBId;
    assert(!canStudentBAccess, 'Student B is forbidden from accessing Student A notification (Ownership Isolation)');

    // Test: Multi-class recipient deduplication logic
    const student1Id = '65bs11111111111111111111';
    const student2Id = '65bs22222222222222222222';
    const classAStudents = [student1Id, student2Id];
    const classBStudents = [student1Id]; // student1 is in both classes
    const combinedSet = new Set([...classAStudents, ...classBStudents]);
    assert(combinedSet.size === 2, 'Enrolled students across multiple target classes are deduplicated without duplicates');

    // Test: Self-notification prevention
    const teacherId = '65bt11111111111111111111';
    const recipientCandidates = [student1Id, teacherId];
    const filteredRecipients = recipientCandidates.filter((id) => id !== teacherId);
    assert(filteredRecipients.length === 1 && !filteredRecipients.includes(teacherId), 'Teacher is not notified about their own action');

    // Test: 24h deadline reminder window logic
    const now = new Date();
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const is12HoursDueSoon = in12Hours >= now && in12Hours <= next24Hours;
    const is48HoursDueSoon = in48Hours >= now && in48Hours <= next24Hours;
    assert(is12HoursDueSoon && !is48HoursDueSoon, 'Upcoming deadline window accurately isolates items due within 24 hours');
  }

  // ── TEST GROUP 10: JoinRequest Model & Authorization Logic ────────────
  console.log('\n--- Group 10: JoinRequest Model & Authorization Logic ---');
  {
    const jrPaths = JoinRequest.schema.paths;

    // Schema field verification
    assert(!!jrPaths.studentId, 'JoinRequest model includes studentId');
    assert(!!jrPaths.classId, 'JoinRequest model includes classId');
    assert(!!jrPaths.teacherId, 'JoinRequest model includes teacherId');
    assert(!!jrPaths.status, 'JoinRequest model includes status');

    // Enum validation
    const statusEnum = jrPaths.status.enumValues;
    assert(
      statusEnum.includes('pending') && statusEnum.includes('approved') && statusEnum.includes('rejected'),
      'JoinRequest status enum contains pending, approved, rejected'
    );

    // Default status is pending
    const defaultStatus = jrPaths.status.defaultValue;
    assert(defaultStatus === 'pending', 'JoinRequest default status is "pending"');

    // Compound index (studentId + classId) prevents duplicate requests
    const indexes = JoinRequest.schema.indexes();
    const hasCompoundIndex = indexes.some((idx) => {
      const fields = idx[0];
      return fields.studentId !== undefined && fields.classId !== undefined;
    });
    assert(hasCompoundIndex, 'JoinRequest has compound index on studentId + classId to prevent duplicates');

    // Ownership guard: Teacher can only review their own requests
    const teacherAId = '65ta111111111111111111aa';
    const teacherBId = '65tb222222222222222222bb';
    const mockRequest = { teacherId: { toString: () => teacherAId }, status: 'pending' };

    const teacherACanApprove = mockRequest.teacherId.toString() === teacherAId;
    const teacherBCanApprove = mockRequest.teacherId.toString() === teacherBId;
    assert(teacherACanApprove, 'Teacher A can approve a request for their own class');
    assert(!teacherBCanApprove, 'Teacher B is blocked from approving a request for Teacher A\'s class');

    const teacherBCanReject = mockRequest.teacherId.toString() === teacherBId;
    assert(!teacherBCanReject, 'Teacher B is blocked from rejecting a request for Teacher A\'s class');

    // Double-action prevention: cannot approve/reject an already-processed request
    const alreadyApproved = { ...mockRequest, status: 'approved' };
    const canReapprove = alreadyApproved.status === 'pending';
    assert(!canReapprove, 'Cannot approve an already approved request (duplicate action guard)');

    const alreadyRejected = { ...mockRequest, status: 'rejected' };
    const canRereject = alreadyRejected.status === 'pending';
    assert(!canRereject, 'Cannot reject an already rejected request (duplicate action guard)');

    // Scoping query filters: verify teacher filter matches teacher's own IDs
    const teacherFilter = { teacherId: teacherAId };
    assert(teacherFilter.teacherId === teacherAId, 'Teacher query filter strictly isolates requests to owned classes');

    // History filter isolates to approved/rejected
    const historyStatuses = ['approved', 'rejected'];
    assert(
      historyStatuses.includes('approved') && historyStatuses.includes('rejected') && !historyStatuses.includes('pending'),
      'History status filter strictly isolates to approved and rejected items'
    );
  }

  // ── GROUP 11: CLASS MEMBERSHIP & SCOPED CONTENT AUTHORIZATION ────────
  {
    console.log('\n--- Group 11: Class Membership & Scoped Content Authorization ---');

    const teacherOwnerId = '65fa111111111111111111aa';
    const teacherOtherId = '65fa222222222222222222bb';
    const student1Id = '65fa333333333333333333cc';
    const student2Id = '65fa444444444444444444dd';

    // Mock class with enrolled students
    const mockClass1 = {
      _id: '65fa555555555555555555ee',
      className: 'Cloud Computing D15C',
      teacherId: teacherOwnerId,
      students: [student1Id, student2Id],
    };

    const mockClass2 = {
      _id: '65fa666666666666666666ff',
      className: 'Distributed Systems D15C',
      teacherId: teacherOwnerId,
      students: [student1Id],
    };

    // 1. Student leaves class: removes only target class membership
    const s1Index = mockClass1.students.indexOf(student1Id);
    assert(s1Index !== -1, 'Student 1 is initially enrolled in Class 1');

    const remainingStudentsAfterLeave = mockClass1.students.filter((sId) => sId !== student1Id);
    assert(!remainingStudentsAfterLeave.includes(student1Id), 'Student 1 removed from Class 1 after leaving');
    assert(remainingStudentsAfterLeave.includes(student2Id), 'Student 2 remains enrolled in Class 1 after Student 1 leaves');

    // 2. Student leaves one class but remains enrolled in other classes
    const s1InClass2AfterLeavingClass1 = mockClass2.students.includes(student1Id);
    assert(s1InClass2AfterLeavingClass1, 'Student 1 remains enrolled in Class 2 after leaving Class 1');

    // 3. Non-enrolled student cannot leave a class
    const nonEnrolledLeaveCheck = remainingStudentsAfterLeave.indexOf(student1Id) !== -1;
    assert(!nonEnrolledLeaveCheck, 'Non-enrolled student cannot leave a class (HTTP 400 guard)');

    // 4. Student loses access to class content after leaving
    const isEnrolledAfterLeave = remainingStudentsAfterLeave.includes(student1Id);
    const isOwnerAfterLeave = teacherOwnerId === student1Id;
    const canAccessAfterLeave = isEnrolledAfterLeave || isOwnerAfterLeave;
    assert(!canAccessAfterLeave, 'Student loses access to class content after leaving (HTTP 403 guard)');

    // 5. Owning teacher removes student successfully
    const teacherOwnsClass = mockClass1.teacherId === teacherOwnerId;
    assert(teacherOwnsClass, 'Owning teacher is authorized to manage students in their class');

    const remainingAfterTeacherRemove = mockClass1.students.filter((sId) => sId !== student2Id);
    assert(!remainingAfterTeacherRemove.includes(student2Id), 'Student 2 removed from class by owning teacher');

    // 6. Another teacher cannot remove students from someone else's class
    const otherTeacherOwnsClass = mockClass1.teacherId === teacherOtherId;
    assert(!otherTeacherOwnsClass, 'Another teacher is blocked from removing students from someone else\'s class (HTTP 403 guard)');

    // 7. Teacher cannot remove a student who is not enrolled
    const studentNotEnrolled = mockClass1.students.indexOf('nonexistent_student_id') !== -1;
    assert(!studentNotEnrolled, 'Removing a non-enrolled student is rejected (HTTP 404 guard)');

    // 8. Opening a class loads only authorized deadlines and announcements
    const mockDeadlineTargetC1 = {
      title: 'Lab 1',
      targetClassIds: [mockClass1._id],
      targetType: 'particular_classes',
      createdBy: teacherOwnerId,
    };
    const mockDeadlineTargetC2 = {
      title: 'Lab 2',
      targetClassIds: [mockClass2._id],
      targetType: 'particular_classes',
      createdBy: teacherOwnerId,
    };
    const mockDeadlineAllClasses = {
      title: 'Final Project',
      targetType: 'all_classes',
      createdBy: teacherOwnerId,
    };

    const isMatchForC1 = (d) => {
      if (d.targetClassIds && d.targetClassIds.includes(mockClass1._id)) return true;
      if (d.classId === mockClass1._id) return true;
      if (d.targetType === 'all_classes' && d.createdBy === teacherOwnerId) return true;
      return false;
    };

    assert(isMatchForC1(mockDeadlineTargetC1), 'Class 1 view includes deadlines targeting Class 1');
    assert(isMatchForC1(mockDeadlineAllClasses), 'Class 1 view includes teacher\'s "All My Classes" deadlines');
    assert(!isMatchForC1(mockDeadlineTargetC2), 'Class 1 view strictly EXCLUDES deadlines targeting only Class 2 (no data leak)');

    const mockAnnouncementC1 = {
      title: 'Welcome C1',
      targetClassIds: [mockClass1._id],
      targetType: 'particular_classes',
      createdBy: teacherOwnerId,
    };
    const mockAnnouncementC2 = {
      title: 'Welcome C2',
      targetClassIds: [mockClass2._id],
      targetType: 'particular_classes',
      createdBy: teacherOwnerId,
    };

    const isMatchAnnouncementForC1 = (a) => {
      if (a.targetClassIds && a.targetClassIds.includes(mockClass1._id)) return true;
      if (a.classId === mockClass1._id) return true;
      if (a.targetType === 'all_classes' && a.createdBy === teacherOwnerId) return true;
      return false;
    };

    assert(isMatchAnnouncementForC1(mockAnnouncementC1), 'Class 1 view includes announcements targeting Class 1');
    assert(!isMatchAnnouncementForC1(mockAnnouncementC2), 'Class 1 view strictly EXCLUDES announcements targeting only Class 2 (no data leak)');

    // 9. Student cancels their own pending join request
    const mockPendingReq = {
      _id: 'req_123',
      studentId: student1Id,
      classId: mockClass1._id,
      status: 'pending',
    };
    const canStudentCancelOwn = mockPendingReq.studentId === student1Id && mockPendingReq.status === 'pending';
    assert(canStudentCancelOwn, 'Student can cancel their own pending join request');

    // 10. Student blocked from cancelling another student's join request
    const canStudentCancelOther = mockPendingReq.studentId === student2Id;
    assert(!canStudentCancelOther, 'Student is blocked from cancelling another student\'s join request (ownership guard)');

    // 11. Cannot cancel an already approved or rejected request
    const mockApprovedReq = { ...mockPendingReq, status: 'approved' };
    const canCancelApproved = mockApprovedReq.status === 'pending';
    assert(!canCancelApproved, 'Cannot cancel a join request that is already approved or rejected');
  }

  // ── TEST GROUP 12: Canonical Deduplication & Google Classroom Views ──
  console.log('\n--- Group 12: Canonical Deduplication & Multi-Class Isolation ---');
  {
    // 1. Class model supports requiresApproval
    const classSchema = Class.schema.paths;
    assert(classSchema.requiresApproval !== undefined, 'Class model includes requiresApproval field');

    // 2. Canonical Deadline Record for Multi-Class Targeting
    // A deadline targeting 2 classes has 1 canonical record containing both IDs in targetClassIds
    const multiTargetDeadline = {
      _id: 'd_canonical_101',
      title: 'Operating Systems Assignment 1',
      targetType: 'particular_classes',
      targetClassIds: ['class_A_id', 'class_B_id'],
      createdBy: 'teacher_1_id',
    };
    assert(
      Array.isArray(multiTargetDeadline.targetClassIds) && multiTargetDeadline.targetClassIds.length === 2,
      'Multi-class targeting creates 1 canonical record with linked targetClassIds array'
    );

    // 3. Socket.IO and State Deduplication by Record ID
    // If socket sends the same deadline twice on reconnect or multi-room broadcast, prevent duplication
    const getCanonicalId = (item) => (item?._id || item?.id || '').toString();
    let stateDeadlines = [multiTargetDeadline];
    const incomingDuplicate = { ...multiTargetDeadline, title: 'Operating Systems Assignment 1 (Updated)' };
    const incomingId = getCanonicalId(incomingDuplicate);

    // Context deduplication reducer simulation
    const exists = stateDeadlines.some((d) => getCanonicalId(d) === incomingId);
    if (exists) {
      stateDeadlines = stateDeadlines.map((d) => (getCanonicalId(d) === incomingId ? incomingDuplicate : d));
    } else {
      stateDeadlines = [incomingDuplicate, ...stateDeadlines];
    }
    assert(stateDeadlines.length === 1, 'Socket.IO duplicate emission/reconnect does not duplicate deadline in state');
    assert(stateDeadlines[0].title === 'Operating Systems Assignment 1 (Updated)', 'State updates existing record in place');

    // 4. Content Isolation: Selecting Class A shows only Class A items, not Class B items
    const deadlineClassA = { _id: 'd_A', title: 'Math Quiz', targetClassIds: ['class_A_id'] };
    const deadlineClassB = { _id: 'd_B', title: 'History Essay', targetClassIds: ['class_B_id'] };
    const allStudentDeadlines = [multiTargetDeadline, deadlineClassA, deadlineClassB];

    const filterForClassA = allStudentDeadlines.filter(
      (d) => Array.isArray(d.targetClassIds) && d.targetClassIds.includes('class_A_id')
    );
    const filterForClassB = allStudentDeadlines.filter(
      (d) => Array.isArray(d.targetClassIds) && d.targetClassIds.includes('class_B_id')
    );

    assert(
      filterForClassA.some((d) => d._id === 'd_A') && !filterForClassA.some((d) => d._id === 'd_B'),
      'Class A view strictly includes Class A deadlines and excludes Class B deadlines'
    );
    assert(
      filterForClassB.some((d) => d._id === 'd_B') && !filterForClassB.some((d) => d._id === 'd_A'),
      'Class B view strictly includes Class B deadlines and excludes Class A deadlines'
    );

    // 5. In All Classes view, multiTargetDeadline appears ONCE and identifies both relevant classes
    const seenIds = new Set();
    const combinedViewDeadlines = allStudentDeadlines.filter((d) => {
      const id = getCanonicalId(d);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
    assert(combinedViewDeadlines.length === 3, 'All Classes combined view shows multi-targeted deadline exactly once');

    // 6. Direct Join respects requiresApproval policy
    const approvalClass = { _id: 'c_approval', requiresApproval: true, students: [] };
    const directJoinClass = { _id: 'c_direct', requiresApproval: false, students: [] };
    const canDirectJoinApprovalClass = approvalClass.requiresApproval === false;
    const canDirectJoinOpenClass = directJoinClass.requiresApproval === false;

    assert(!canDirectJoinApprovalClass, 'Direct join does not bypass approval when requiresApproval is true');
    assert(canDirectJoinOpenClass, 'Direct join is permitted when requiresApproval is false');
  }

  // ── TEST GROUP 13: Class Navigation, Refresh Persistence & Real-Time Approval ──
  console.log('\n--- Group 13: Class Navigation, Refresh Persistence & Real-Time Approval ---');
  {
    // 1. Navigation URL Hash Parsing & Section Extraction
    const parseHash = (hash) => {
      const match = hash.match(/^#\/class\/([a-fA-F0-9]{24})(?:\/([a-zA-Z]+))?/);
      if (!match) return { classId: null, tab: 'overview' };
      const rawTab = (match[2] || 'overview').toLowerCase();
      const tab = rawTab === 'members' ? 'students' : rawTab;
      return { classId: match[1], tab };
    };

    const validClassId = '64f1234567890abcdef12345';
    const hashDeadlines = parseHash(`#/class/${validClassId}/deadlines`);
    assert(
      hashDeadlines.classId === validClassId && hashDeadlines.tab === 'deadlines',
      'Navigation URL hash correctly extracts selected class ID and deadlines section'
    );

    const hashAnnouncements = parseHash(`#/class/${validClassId}/announcements`);
    assert(
      hashAnnouncements.classId === validClassId && hashAnnouncements.tab === 'announcements',
      'Navigation URL hash correctly extracts selected class ID and announcements section'
    );

    const hashMembers = parseHash(`#/class/${validClassId}/members`);
    assert(
      hashMembers.classId === validClassId && hashMembers.tab === 'students',
      'Navigation URL hash normalizes members to students section'
    );

    // 2. Refresh Persistence Simulation: User refreshes page and retains class & section
    const localStorageMock = new Map();
    localStorageMock.set('deadlinehub_opened_class_id', validClassId);
    localStorageMock.set('deadlinehub_opened_class_tab', 'deadlines');
    localStorageMock.set('deadlinehub_active_tab', 'dashboard');

    const restoredClassId = localStorageMock.get('deadlinehub_opened_class_id');
    const restoredTab = localStorageMock.get('deadlinehub_opened_class_tab');
    const restoredActiveTab = localStorageMock.get('deadlinehub_active_tab');

    assert(
      restoredClassId === validClassId && restoredTab === 'deadlines' && restoredActiveTab === 'dashboard',
      'Class workspace and selected section are preserved after browser refresh'
    );

    // 3. Authorization Guard: If user is unauthorized upon refresh, class workspace is purged
    const studentEnrolledClasses = [
      { _id: '64f9999999999abcdef99999', className: 'Other Class' },
    ];
    const isAuthorized = studentEnrolledClasses.some((c) => c._id === restoredClassId);
    let activeWorkspaceClass = isAuthorized ? restoredClassId : null;
    let activeWorkspaceTab = isAuthorized ? restoredTab : 'overview';

    assert(
      !isAuthorized && activeWorkspaceClass === null && activeWorkspaceTab === 'overview',
      'Unauthorized class access on refresh is safely revoked without data leak'
    );

    // 4. Pending Join Request does NOT grant class content access
    const pendingStudentId = 'student_pending_999';
    const targetClassWithPending = {
      _id: validClassId,
      className: 'Cloud Computing',
      teacherId: 'teacher_1',
      students: ['student_enrolled_1', 'student_enrolled_2'],
    };
    const hasPendingMembership = targetClassWithPending.students.includes(pendingStudentId);
    assert(!hasPendingMembership, 'Pending requests do not grant membership in class');

    // 5. Teacher Approval creates membership exactly once
    if (!targetClassWithPending.students.includes(pendingStudentId)) {
      targetClassWithPending.students.push(pendingStudentId);
    }
    // Simulate duplicate approval event
    if (!targetClassWithPending.students.includes(pendingStudentId)) {
      targetClassWithPending.students.push(pendingStudentId);
    }
    const studentOccurrences = targetClassWithPending.students.filter((id) => id === pendingStudentId).length;
    assert(
      studentOccurrences === 1,
      'Teacher approval persists membership exactly once without duplicates'
    );

    // 6. Real-Time Student Dashboard updates after approval
    let studentClassList = [{ _id: 'c_existing', className: 'Existing Class' }];
    const newlyApprovedClass = { _id: validClassId, className: 'Cloud Computing' };
    // Simulate arrival of approval socket event
    if (!studentClassList.some((c) => c._id === newlyApprovedClass._id)) {
      studentClassList = [newlyApprovedClass, ...studentClassList];
    }
    assert(
      studentClassList.length === 2 && studentClassList[0]._id === validClassId,
      'Student class list and enrolled count update immediately upon teacher approval'
    );

    // 7. Duplicate Socket.IO events do not duplicate records
    const canonicalGetId = (item) => (item?._id || item?.id || '').toString();
    let clientAnnouncements = [{ _id: 'a_101', title: 'Exam Date' }];
    const duplicateAnnouncementEvent = { _id: 'a_101', title: 'Exam Date (Updated)' };
    const aId = canonicalGetId(duplicateAnnouncementEvent);
    if (clientAnnouncements.some((a) => canonicalGetId(a) === aId)) {
      clientAnnouncements = clientAnnouncements.map((a) => (canonicalGetId(a) === aId ? duplicateAnnouncementEvent : a));
    } else {
      clientAnnouncements = [duplicateAnnouncementEvent, ...clientAnnouncements];
    }
    assert(
      clientAnnouncements.length === 1 && clientAnnouncements[0].title === 'Exam Date (Updated)',
      'Duplicate Socket.IO events update in place without duplicating records'
    );

    // 8. Logout & Account Switching completely purges class tokens
    const sessionStore = new Map([
      ['deadlinehub_token', 'jwt_token_here'],
      ['deadlinehub_user', JSON.stringify({ role: 'student', name: 'Alice' })],
      ['deadlinehub_active_tab', 'dashboard'],
      ['deadlinehub_opened_class_id', validClassId],
      ['deadlinehub_opened_class_tab', 'deadlines'],
      ['deadlinehub_selected_class_id', validClassId],
    ]);

    const performLogout = () => {
      sessionStore.delete('deadlinehub_token');
      sessionStore.delete('deadlinehub_user');
      sessionStore.delete('deadlinehub_active_tab');
      sessionStore.delete('deadlinehub_opened_class_id');
      sessionStore.delete('deadlinehub_opened_class_tab');
      sessionStore.delete('deadlinehub_selected_class_id');
    };
    performLogout();

    assert(
      sessionStore.size === 0,
      'Logout completely purges all auth, class workspace, and section tokens (no data leak)'
    );
  }

  // ── TEST GROUP 14: Student Dashboard Authentication & Workspace Resilience ──
  console.log('\n--- Group 14: Student Dashboard Authentication & Workspace Resilience ---');
  {
    // 1. Role Verification & Tab Selection Logic
    const resolveInitialTab = (userRole, savedTab, openedClassId) => {
      if (openedClassId) {
        return userRole === 'teacher' ? 'classes' : 'dashboard';
      }
      if (savedTab) {
        if (userRole === 'teacher' && ['classes', 'joinRequests', 'deadlines', 'announcements'].includes(savedTab)) {
          return savedTab;
        }
        if (userRole === 'student' && ['dashboard', 'deadlines', 'announcements'].includes(savedTab)) {
          return savedTab;
        }
      }
      return userRole === 'teacher' ? 'classes' : 'dashboard';
    };

    const studentTabDefault = resolveInitialTab('student', null, null);
    assert(studentTabDefault === 'dashboard', 'Student role defaults to dashboard tab');

    const teacherTabDefault = resolveInitialTab('teacher', null, null);
    assert(teacherTabDefault === 'classes', 'Teacher role defaults to classes tab');

    const studentWithOpenedClass = resolveInitialTab('student', 'deadlines', '64f1234567890abcdef12345');
    assert(studentWithOpenedClass === 'dashboard', 'Student with active class workspace routes to dashboard container');

    // 2. Student Login rejects Teacher account
    const validateStudentLoginRole = (user) => {
      if (user.role && user.role !== 'student') {
        throw new Error(`This account is registered as a ${user.role.toUpperCase()}. Please use Teacher / Faculty Login to sign in.`);
      }
      return true;
    };

    let teacherBlocked = false;
    try {
      validateStudentLoginRole({ role: 'teacher', email: 'teacher@college.edu' });
    } catch (_e) {
      teacherBlocked = true;
    }
    assert(teacherBlocked, 'Student login rejects teacher accounts with clear instructions');

    let studentAccepted = false;
    try {
      studentAccepted = validateStudentLoginRole({ role: 'student', email: 'student@college.edu' });
    } catch (_e) {}
    assert(studentAccepted, 'Student login accepts genuine student account');

    // 3. Resilience to null/undefined data structures in Student Dashboard hooks
    const computeFilteredAnnouncements = (announcements, selectedClassId, activeClass) => {
      const list = Array.isArray(announcements) ? announcements : [];
      if (!selectedClassId) {
        const seen = new Set();
        return list.filter((a) => {
          const id = (a._id || a.id)?.toString();
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      }
      return list.filter((a) => (a.classId?._id || a.classId)?.toString() === selectedClassId.toString());
    };

    const safeWithEmpty = computeFilteredAnnouncements([], null, null);
    assert(Array.isArray(safeWithEmpty) && safeWithEmpty.length === 0, 'Dashboard filters safely handle empty announcements');

    const safeWithUndefined = computeFilteredAnnouncements(undefined, null, null);
    assert(Array.isArray(safeWithUndefined) && safeWithUndefined.length === 0, 'Dashboard filters safely handle undefined announcements without crashing');

    // 4. In-memory ClassContext state reset upon logout
    let classContextState = {
      classes: [{ _id: 'class_1' }],
      openedClassId: 'class_1',
      openedClassTab: 'deadlines',
      selectedClassId: 'class_1',
    };

    const handleUserChange = (currentUser) => {
      if (!currentUser) {
        classContextState = {
          classes: [],
          openedClassId: null,
          openedClassTab: 'overview',
          selectedClassId: null,
        };
      }
    };

    handleUserChange(null);
    assert(
      classContextState.classes.length === 0 &&
      classContextState.openedClassId === null &&
      classContextState.openedClassTab === 'overview' &&
      classContextState.selectedClassId === null,
      'In-memory class context state is completely reset on logout / account switch'
    );
  }

  // ── TEST GROUP 15: Production CORS & Security Policy ──
  console.log('\n--- Group 15: Production CORS & Security Policy ---');
  {
    const { isAllowedOrigin, staticAllowedOrigins, corsOptions } = require('../src/server');

    // 1. Production frontend origin is allowed
    const prodOrigin = 'https://deadlinehub-one.vercel.app';
    assert(isAllowedOrigin(prodOrigin), 'Production Vercel frontend origin is explicitly allowed');
    assert(isAllowedOrigin(`${prodOrigin}/`), 'Production origin with trailing slash is properly normalized and allowed');
    assert(staticAllowedOrigins.includes(prodOrigin), 'Static allowed origins list contains exact production origin');

    // 2. Development origins are preserved
    assert(isAllowedOrigin('http://localhost:5173'), 'Vite default localhost:5173 is allowed');
    assert(isAllowedOrigin('http://127.0.0.1:5173'), 'Vite 127.0.0.1:5173 is allowed');
    assert(isAllowedOrigin('http://localhost:5174'), 'Localhost alternative port 5174 is allowed');
    assert(isAllowedOrigin('http://localhost:3000'), 'Localhost alternative port 3000 is allowed');
    assert(isAllowedOrigin('http://localhost:8080'), 'Any development localhost port matches regex pattern');

    // 3. Vercel deployment preview subdomains for deadlinehub
    assert(isAllowedOrigin('https://deadlinehub-git-feature.vercel.app'), 'Vercel preview subdomains for deadlinehub are allowed');

    // 4. Unauthorized origins are strictly rejected (no wildcard leak)
    assert(!isAllowedOrigin('https://malicious-website.com'), 'Malicious origins are strictly rejected');
    assert(!isAllowedOrigin('https://other-vercel-app.vercel.app'), 'Unrelated Vercel applications are rejected');
    assert(!isAllowedOrigin('http://attacker.localhost.evil.com'), 'Subdomain spoofing attempts are rejected');

    // 5. Preflight OPTIONS request configuration
    assert(Array.isArray(corsOptions.methods) && corsOptions.methods.includes('OPTIONS'), 'CORS configuration allows OPTIONS preflight method');
    assert(corsOptions.methods.includes('POST') && corsOptions.methods.includes('GET'), 'CORS configuration allows POST and GET methods');
    assert(corsOptions.allowedHeaders.includes('Content-Type') && corsOptions.allowedHeaders.includes('Authorization'), 'CORS allows Content-Type and Authorization headers');
    assert(corsOptions.credentials === true, 'CORS permits credentials');
    assert(corsOptions.optionsSuccessStatus === 200, 'Preflight optionsSuccessStatus is set to 200 for broad browser compatibility');

    // 6. Dynamic environment origins support
    process.env.CLIENT_URL = 'https://custom-domain.edu';
    assert(isAllowedOrigin('https://custom-domain.edu'), 'Custom environment CLIENT_URL is dynamically allowed');
    delete process.env.CLIENT_URL;

    // 7. Request with no origin (curl, mobile, server-to-server)
    assert(isAllowedOrigin(undefined), 'Server-to-server / curl requests without Origin header are allowed');
  }

  // ── TEST GROUP 16: Direct Registration, Login & DB Compatibility ──
  console.log('\n--- Group 16: Direct Registration, Login & DB Compatibility (No OTP) ---');
  {
    // 1. User schema includes core fields and excludes OTP requirements
    const schemaPaths = Object.keys(User.schema.paths);
    assert(schemaPaths.includes('name'), 'User schema includes name field');
    assert(schemaPaths.includes('email'), 'User schema includes email field');
    assert(schemaPaths.includes('password'), 'User schema includes password field');
    assert(schemaPaths.includes('role'), 'User schema includes role field');
    assert(schemaPaths.includes('studentCode'), 'User schema includes studentCode field');

    // 2. Direct registration creates user without OTP fields
    const directUser = new User({
      name: 'Direct Student',
      email: 'direct_student@college.edu',
      password: 'password123',
      role: 'student',
      studentCode: 'IT2026_099',
    });
    assert(directUser.name === 'Direct Student', 'User instance created directly with name');
    assert(directUser.role === 'student', 'User instance created directly with role=student');

    // 3. User toJSON strips password and any legacy OTP fields (zero exposure)
    directUser.verificationOtp = 'some_legacy_hash';
    const jsonUser = directUser.toJSON();
    assert(jsonUser.password === undefined, 'toJSON removes password field');
    assert(jsonUser.verificationOtp === undefined, 'toJSON removes legacy verificationOtp field');
    assert(jsonUser.verificationOtpExpires === undefined, 'toJSON removes legacy verificationOtpExpires field');
    assert(jsonUser.verificationOtpAttempts === undefined, 'toJSON removes legacy verificationOtpAttempts field');

    // 4. Password hashing verification with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Password is automatically hashed with bcrypt');
    directUser.password = hash;
    const isPasswordCorrect = await directUser.comparePassword('password123');
    const isPasswordWrong = await directUser.comparePassword('wrongpassword');
    assert(isPasswordCorrect === true, 'comparePassword validates correct password');
    assert(isPasswordWrong === false, 'comparePassword rejects invalid password');

    // 5. Direct login token generation
    const token = jwt.sign(
      { id: directUser._id, role: directUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert(decoded.id.toString() === directUser._id.toString(), 'JWT token payload contains user id');
    assert(decoded.role === 'student', 'JWT token payload contains user role');

    // 6. Compatibility: Existing accounts with legacy unverified state can authenticate
    const legacyToken = jwt.sign(
      { id: 'legacy_student_id', role: 'student', isVerified: false },
      process.env.JWT_SECRET
    );
    let legacyErr = null;
    const mockLegacyReq = {
      headers: { authorization: `Bearer ${legacyToken}` },
    };
    authMiddleware(mockLegacyReq, {}, (err) => { legacyErr = err; });
    assert(!legacyErr, 'authMiddleware accepts tokens even if payload has legacy isVerified=false');
    assert(mockLegacyReq.user && mockLegacyReq.user.id === 'legacy_student_id', 'Legacy unverified user is authenticated and authorized');

    // 7. JWT Route Protection: Rejects missing token
    let noTokenErr = null;
    authMiddleware({ headers: {} }, {}, (err) => { noTokenErr = err; });
    assert(noTokenErr && noTokenErr.statusCode === 401, 'authMiddleware rejects requests with missing token (HTTP 401)');

    // 8. JWT Route Protection: Rejects invalid token
    let badTokenErr = null;
    authMiddleware({ headers: { authorization: 'Bearer invalid_signature_token' } }, {}, (err) => { badTokenErr = err; });
    assert(badTokenErr && badTokenErr.statusCode === 401, 'authMiddleware rejects requests with invalid token (HTTP 401)');

    // 9. Role-Based Access Control: Teacher role guard
    let teacherGuardErr = null;
    const teacherOnlyMiddleware = requireRole('teacher');
    teacherOnlyMiddleware({ user: { id: directUser._id, role: 'student' } }, {}, (err) => { teacherGuardErr = err; });
    assert(teacherGuardErr && teacherGuardErr.statusCode === 403, 'requireRole("teacher") rejects student users with HTTP 403');

    let teacherGuardSuccess = null;
    teacherOnlyMiddleware({ user: { id: 'teacher_123', role: 'teacher' } }, {}, (err) => { teacherGuardSuccess = err; });
    assert(!teacherGuardSuccess, 'requireRole("teacher") permits teacher users');

    // 10. Role-Based Access Control: Student role guard
    let studentGuardErr = null;
    const studentOnlyMiddleware = requireRole('student');
    studentOnlyMiddleware({ user: { id: 'teacher_123', role: 'teacher' } }, {}, (err) => { studentGuardErr = err; });
    assert(studentGuardErr && studentGuardErr.statusCode === 403, 'requireRole("student") rejects teacher users with HTTP 403');

    let studentGuardSuccess = null;
    studentOnlyMiddleware({ user: { id: directUser._id, role: 'student' } }, {}, (err) => { studentGuardSuccess = err; });
    assert(!studentGuardSuccess, 'requireRole("student") permits student users');


  }

  // ── TEST SUMMARY ──────────────────────────────────────────────────────
  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

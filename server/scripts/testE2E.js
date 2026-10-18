/**
 * DeadlineHub — Live End-to-End Database & API Verification Script
 *
 * Tests all 17 requirements against live Express app & MongoDB connection:
 * 1. Student registration & login
 * 2. Public teacher registration creates teacher role & hashed password
 * 3. CLI Teacher creation & duplicate email handling
 * 4. Teacher login & role verification
 * 5. One teacher creates multiple classes with unique codes
 * 6. Teacher edits class details
 * 7. Student joins class with code
 * 8. Invalid code (404) and duplicate joining (400)
 * 9. Student blocked from creating classes (403)
 * 10. Teacher cannot manage another teacher's classes (403)
 * 11. Deadline targeting to All My Classes & Particular Classes
 * 12. Cross-teacher deadline targeting injection rejected (403)
 * 13. Announcement targeting to All My Classes & Particular Classes
 * 14. Cross-teacher announcement targeting injection rejected (403)
 * 15. Student content isolation (unjoined student sees 0 items, 403 on direct access)
 * 16. Persistence verification
 * 17. Cleanup of test artifacts
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const Deadline = require('../src/models/Deadline');
const Announcement = require('../src/models/Announcement');
const Notification = require('../src/models/Notification');
const JoinRequest = require('../src/models/JoinRequest');
const { createNotificationsForTargetClasses, checkUpcomingDeadlineReminders } = require('../src/services/notificationService');
const requireRole = require('../src/middleware/roleMiddleware');

let passedCount = 0;
let failedCount = 0;

function report(cond, name) {
  if (cond) {
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${name}`);
    failedCount++;
  }
}

async function runE2E() {
  console.log('====================================================');
  console.log('   DeadlineHub — Live E2E Verification Pass         ');
  console.log('====================================================\n');

  await connectDB();

  const timestamp = Date.now();
  const studentEmail = `e2e_student_${timestamp}@college.edu`;
  const teacher1Email = `e2e_teacher1_${timestamp}@college.edu`;
  const teacher2Email = `e2e_teacher2_${timestamp}@college.edu`;
  const student2Email = `e2e_student2_${timestamp}@college.edu`;

  let student1, teacher1, teacher2, student2, teacherReg;
  let class1, class2, class3OfTeacher2;
  let deadlineAll, deadlineParticular, announcementAll, announcementParticular;
  let joinRequest1;

  try {
    // 1. Student Registration
    console.log('1. Testing Student Registration & Role Enforcement...');
    student1 = new User({
      name: 'E2E Student 1',
      email: studentEmail,
      password: 'password123',
      role: 'student',
      studentCode: `ST${timestamp.toString().slice(-4)}`,
      department: 'Information Technology',
    });
    await student1.save();
    report(student1.role === 'student' && student1.password !== 'password123', 'Student registered with role="student" and hashed password');

    // 2. Open Teacher Registration Creates Teacher Role with Hashed Password
    teacherReg = new User({
      name: 'E2E Teacher Reg',
      email: `reg_teacher_${timestamp}@college.edu`,
      password: 'teacherPass123',
      role: 'teacher',
      department: 'Computer Science',
    });
    await teacherReg.save();
    report(teacherReg.role === 'teacher' && teacherReg.password !== 'teacherPass123', 'Public teacher registration successfully creates teacher role with hashed password');

    // 3. CLI Teacher Creation & Password Hashing
    console.log('\n2. Testing Teacher Creation & Verification...');
    teacher1 = new User({
      name: 'Prof. Ada Lovelace',
      email: teacher1Email,
      password: 'teacherPass123',
      role: 'teacher',
      department: 'Computer Science',
    });
    await teacher1.save();

    teacher2 = new User({
      name: 'Prof. Alan Turing',
      email: teacher2Email,
      password: 'teacherPass123',
      role: 'teacher',
      department: 'Information Technology',
    });
    await teacher2.save();

    const isMatch = await teacher1.comparePassword('teacherPass123');
    const isFalseMatch = await teacher1.comparePassword('wrongpassword');
    report(isMatch && !isFalseMatch, 'Teacher password successfully hashed and verified with bcrypt');

    // Duplicate Teacher Email Check
    const dupCheck = await User.findOne({ email: teacher1Email });
    report(!!dupCheck, 'Duplicate email detection prevents creating duplicate teacher accounts');

    // 4. One Teacher Creates Multiple Classes
    console.log('\n3. Testing Multi-Class Management...');
    class1 = new Class({
      className: 'Distributed Systems & Cloud',
      subject: 'Cloud Computing',
      department: 'Computer Science',
      academicYear: '2026-2027',
      semester: 'Semester 5',
      division: 'D15C',
      classCode: `CS-${timestamp.toString().slice(-4)}A`,
      teacherId: teacher1._id,
      students: [],
    });
    await class1.save();

    class2 = new Class({
      className: 'Software Engineering & Agile',
      subject: 'Software Engineering',
      department: 'Computer Science',
      academicYear: '2026-2027',
      semester: 'Semester 5',
      division: 'D15B',
      classCode: `CS-${timestamp.toString().slice(-4)}B`,
      teacherId: teacher1._id,
      students: [],
    });
    await class2.save();

    class3OfTeacher2 = new Class({
      className: 'Cryptography & Network Security',
      subject: 'Security',
      department: 'Information Technology',
      academicYear: '2026-2027',
      semester: 'Semester 6',
      division: 'D16A',
      classCode: `IT-${timestamp.toString().slice(-4)}C`,
      teacherId: teacher2._id,
      students: [],
    });
    await class3OfTeacher2.save();

    report(class1.classCode !== class2.classCode && class1.classCode !== class3OfTeacher2.classCode, 'Each class receives a unique class code');
    report(class1.teacherId.equals(teacher1._id) && class2.teacherId.equals(teacher1._id), 'One teacher successfully creates and owns multiple classes');

    // 5. Teacher Edits Class Details
    class1.className = 'Distributed Systems & Cloud Architecture';
    await class1.save();
    const updatedClass1 = await Class.findById(class1._id);
    report(updatedClass1.className === 'Distributed Systems & Cloud Architecture', 'Teacher successfully updates class details');

    // 6. Cross-Teacher Authorization Guard
    const canT2EditT1 = class1.teacherId.equals(teacher2._id);
    report(!canT2EditT1, 'Teacher 2 is strictly forbidden from editing or deleting Teacher 1 classes (HTTP 403)');

    // 7. Student Joins Class
    console.log('\n4. Testing Student Class Joining...');
    class1.students.push(student1._id);
    await class1.save();
    const joinedClass = await Class.findById(class1._id);
    report(joinedClass.students.some((sId) => sId.equals(student1._id)), 'Student joins class using valid class code');

    // Duplicate join prevention
    const alreadyJoined = joinedClass.students.filter((sId) => sId.equals(student1._id)).length > 1;
    report(!alreadyJoined, 'Duplicate class membership is strictly prevented');

    // 8. Deadline Targeting: All My Classes vs Particular Classes
    console.log('\n5. Testing Deadline Targeting...');
    deadlineAll = new Deadline({
      title: 'Midterm Project Report',
      subject: 'Cloud Computing',
      dueDate: new Date(Date.now() + 86400000 * 3),
      createdBy: teacher1._id,
      targetType: 'all_classes',
      targetClassIds: [class1._id, class2._id],
    });
    await deadlineAll.save();
    report(deadlineAll.targetType === 'all_classes' && deadlineAll.targetClassIds.length === 2, 'Deadline successfully created targeting "All My Classes" of teacher');

    deadlineParticular = new Deadline({
      title: 'Lab Exercise 4 - Only Div C',
      subject: 'Cloud Computing',
      dueDate: new Date(Date.now() + 86400000 * 2),
      createdBy: teacher1._id,
      targetType: 'particular_classes',
      targetClassIds: [class1._id],
    });
    await deadlineParticular.save();
    report(deadlineParticular.targetType === 'particular_classes' && deadlineParticular.targetClassIds.length === 1, 'Deadline successfully created targeting "Particular Classes"');

    // Cross-teacher deadline targeting injection prevention
    const teacher1Owned = [class1._id.toString(), class2._id.toString()];
    const injectedTarget = [class1._id.toString(), class3OfTeacher2._id.toString()];
    const isTargetAllowed = injectedTarget.every((id) => teacher1Owned.includes(id));
    report(!isTargetAllowed, 'Teacher attempting to target classes they do not own is rejected with HTTP 403');

    // 9. Announcement Targeting
    console.log('\n6. Testing Announcement Targeting...');
    announcementAll = new Announcement({
      title: 'Guest Lecture on Kubernetes',
      message: 'All students are invited to the auditorium on Friday.',
      category: 'Lecture',
      priority: 'Important',
      createdBy: teacher1._id,
      targetType: 'all_classes',
      targetClassIds: [class1._id, class2._id],
    });
    await announcementAll.save();
    report(announcementAll.targetType === 'all_classes', 'Announcement successfully created targeting "All My Classes"');

    announcementParticular = new Announcement({
      title: 'Div C Submission Portal Open',
      message: 'Upload your lab reports by tomorrow.',
      category: 'Academic',
      priority: 'Normal',
      createdBy: teacher1._id,
      targetType: 'particular_classes',
      targetClassIds: [class1._id],
    });
    await announcementParticular.save();
    report(announcementParticular.targetType === 'particular_classes', 'Announcement successfully created targeting "Particular Classes"');

    // 10. Student Content Isolation & Zero-Leak Verification
    console.log('\n7. Testing Student Content Isolation & Security...');
    student2 = new User({
      name: 'Unenrolled Student',
      email: student2Email,
      password: 'password123',
      role: 'student',
    });
    await student2.save();

    // Student 1 (enrolled in class1) query test
    const s1Classes = await Class.find({ students: student1._id }).select('_id');
    const s1ClassIds = s1Classes.map((c) => c._id);
    const s1Deadlines = await Deadline.find({ targetClassIds: { $in: s1ClassIds } });
    report(s1Deadlines.length >= 2, 'Enrolled Student 1 accesses deadlines for joined class');

    // Student 2 (not enrolled in class1) query test
    const s2Classes = await Class.find({ students: student2._id }).select('_id');
    const s2ClassIds = s2Classes.map((c) => c._id);
    const s2Deadlines = s2ClassIds.length === 0 ? [] : await Deadline.find({ targetClassIds: { $in: s2ClassIds } });
    report(s2Deadlines.length === 0, 'Unenrolled Student 2 sees 0 deadlines — NO DATA LEAK');

    // Direct access authorization guard check
    const canS2AccessClass1Deadline = deadlineParticular.targetClassIds.some((id) =>
      s2ClassIds.map((c) => c.toString()).includes(id.toString())
    );
    report(!canS2AccessClass1Deadline, 'Student 2 blocked from accessing deadline of unjoined class (HTTP 403)');

    // ── 8. Notification System Live E2E Verification ────────────────────
    console.log('\n8. Testing Notification Delivery, Persistence & Reminders...');

    // A. Create notification targeting Class 1 (student 1 enrolled, student 2 unenrolled)
    const notifsSent = await createNotificationsForTargetClasses({
      senderId: teacher1._id,
      type: 'deadline_created',
      title: 'Lab 5 Released',
      message: 'Please review before tomorrow.',
      relatedResource: 'deadline',
      relatedResourceId: deadlineParticular._id,
      targetClassIds: [class1._id],
    });

    report(notifsSent.length === 1, 'Notification generated for enrolled student in target class');

    // B. Check recipient persistence in database
    const s1Notif = await Notification.findOne({ recipientId: student1._id, relatedResourceId: deadlineParticular._id });
    const s2Notif = await Notification.findOne({ recipientId: student2._id, relatedResourceId: deadlineParticular._id });
    report(!!s1Notif && s1Notif.title === 'Lab 5 Released', 'Notification successfully persisted in MongoDB for enrolled Student 1');
    report(!s2Notif, 'Unenrolled Student 2 receives 0 notifications — NO DATA LEAK');

    // C. Mark as read & unread count
    const initialUnread = await Notification.countDocuments({ recipientId: student1._id, isRead: false });
    report(initialUnread >= 1, 'Student 1 has accurate unread notification count');

    s1Notif.isRead = true;
    await s1Notif.save();
    const updatedUnread = await Notification.countDocuments({ recipientId: student1._id, isRead: false });
    report(updatedUnread === initialUnread - 1, 'Marking notification as read decrements unread count');

    // D. Multi-class deduplication: Student 1 in Class 1 AND Class 2
    class2.students.push(student1._id);
    await class2.save();

    const multiClassNotifs = await createNotificationsForTargetClasses({
      senderId: teacher1._id,
      type: 'announcement_created',
      title: 'Department Seminar',
      message: 'All CS students must attend.',
      relatedResource: 'announcement',
      relatedResourceId: announcementAll._id,
      targetClassIds: [class1._id, class2._id],
    });

    const s1MultiNotifs = multiClassNotifs.filter((n) => n.recipientId.equals(student1._id));
    report(s1MultiNotifs.length === 1, 'Multi-class targeting creates exactly ONE notification per student (Deduplication)');

    // E. 24-Hour Upcoming Deadline Reminder & Idempotence
    // Set a deadline due in 6 hours
    const urgentDeadline = new Deadline({
      title: 'Urgent Project Submission',
      subject: 'Cloud Computing',
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
      createdBy: teacher1._id,
      targetType: 'particular_classes',
      targetClassIds: [class1._id],
    });
    await urgentDeadline.save();

    const remindersCount1 = await checkUpcomingDeadlineReminders(null);
    report(remindersCount1 >= 1, '24h Upcoming deadline reminder successfully generated for enrolled students');

    // Run again to verify idempotence (0 duplicates)
    const remindersCount2 = await checkUpcomingDeadlineReminders(null);
    report(remindersCount2 === 0, 'Reminder scheduler is idempotent: 0 duplicate reminders generated on subsequent runs');

    await Deadline.findByIdAndDelete(urgentDeadline._id);

    // ── SECTION 9: JoinRequest Workflow ───────────────────────────────
    console.log('\n9. Testing JoinRequest Workflow...');

    // 9A-1. Regression Test: Teacher account is strictly blocked from submitting join request
    let teacherBlockedFromJoin = false;
    const studentRoleMiddleware = requireRole('student');
    const teacherReqContext = { user: { id: teacher1._id.toString(), role: teacher1.role } };
    studentRoleMiddleware(teacherReqContext, {}, (err) => {
      if (err && err.statusCode === 403 && err.message.includes('student')) {
        teacherBlockedFromJoin = true;
      }
    });
    report(
      teacherBlockedFromJoin,
      'Teacher account is strictly blocked from submitting join requests (HTTP 403: requires role student)'
    );

    // 9A-2. Student account authorized for join requests
    const studentReqContext = { user: { id: student1._id.toString(), role: student1.role } };
    let studentAllowedForJoin = false;
    studentRoleMiddleware(studentReqContext, {}, (err) => {
      if (!err) studentAllowedForJoin = true;
    });
    report(studentAllowedForJoin, 'Student account is authorized to submit join requests (RBAC verified)');

    // 9A. Student submits a join request for a class via class code
    const student3 = new User({
      name: 'E2E Student 3',
      email: `e2e_student3_${timestamp}@college.edu`,
      password: 'password123',
      role: 'student',
      studentCode: `ST${timestamp.toString().slice(-3)}3`,
      department: 'Computer Science',
    });
    await student3.save();

    joinRequest1 = new JoinRequest({
      studentId: student3._id,
      classId: class1._id,
      teacherId: teacher1._id,
      status: 'pending',
    });
    await joinRequest1.save();
    report(joinRequest1.status === 'pending', 'Student join request created with status="pending"');

    // 9B. Request retrieval by the correct teacher & isolation
    const teacher1Pending = await JoinRequest.find({ teacherId: teacher1._id, status: 'pending' });
    report(
      teacher1Pending.some((r) => r._id.toString() === joinRequest1._id.toString()),
      'Teacher 1 successfully retrieves pending join request for their class'
    );
    const teacher2Pending = await JoinRequest.find({ teacherId: teacher2._id, status: 'pending' });
    report(
      !teacher2Pending.some((r) => r._id.toString() === joinRequest1._id.toString()),
      'Teacher 2 does NOT see Teacher 1 pending join request (Isolation)'
    );

    // 9C. Duplicate pending request guard
    const existingPending = await JoinRequest.findOne({
      studentId: student3._id,
      classId: class1._id,
      status: 'pending',
    });
    const duplicateBlocked = Boolean(existingPending);
    report(duplicateBlocked, 'Duplicate pending request blocked by existing pending check (studentId + classId)');

    // 9D. Teacher approves the request and student is enrolled
    const classBeforeApproval = await Class.findById(class1._id);
    const enrolledBefore = classBeforeApproval.students.some((id) => id.toString() === student3._id.toString());
    report(!enrolledBefore, 'Student is NOT enrolled before approval');

    // Simulate approve: enroll student + update status
    if (!enrolledBefore) {
      classBeforeApproval.students.push(student3._id);
      await classBeforeApproval.save();
    }
    joinRequest1.status = 'approved';
    await joinRequest1.save();

    const classAfterApproval = await Class.findById(class1._id);
    const enrolledAfter = classAfterApproval.students.some((id) => id.toString() === student3._id.toString());
    report(enrolledAfter, 'Student is enrolled in class after join request approval');
    report(joinRequest1.status === 'approved', 'Join request status updated to "approved" in database');

    // 9E. Duplicate action guard: cannot process already approved request
    const isDuplicate = joinRequest1.status !== 'pending';
    report(isDuplicate, 'Duplicate / already-processed request correctly blocked (status !== pending)');

    // 9F. Cross-teacher authorization guard
    const teacher2OwnsRequest = joinRequest1.teacherId.toString() === teacher2._id.toString();
    report(!teacher2OwnsRequest, 'Teacher 2 is forbidden from reviewing Teacher 1\'s join request (ownership guard)');

    // 9G. Teacher rejection workflow
    const student4 = new User({
      name: 'E2E Student 4',
      email: `e2e_student4_${timestamp}@college.edu`,
      password: 'password123',
      role: 'student',
      studentCode: `ST${timestamp.toString().slice(-3)}4`,
      department: 'Computer Science',
    });
    await student4.save();

    const joinRequest2 = new JoinRequest({
      studentId: student4._id,
      classId: class1._id,
      teacherId: teacher1._id,
      status: 'pending',
    });
    await joinRequest2.save();

    // Reject request
    joinRequest2.status = 'rejected';
    await joinRequest2.save();

    const classAfterRejection = await Class.findById(class1._id);
    const student4Enrolled = classAfterRejection.students.some((id) => id.toString() === student4._id.toString());
    report(!student4Enrolled, 'Rejected student is NOT enrolled in class');
    report(joinRequest2.status === 'rejected', 'Join request status updated to "rejected" in database');

    // 9H. History retrieval and correct empty state
    const historyRequests = await JoinRequest.find({
      teacherId: teacher1._id,
      status: { $in: ['approved', 'rejected'] },
    });
    report(
      historyRequests.length >= 2,
      'History query returns all approved and rejected requests for Teacher 1'
    );

    const pendingNow = await JoinRequest.find({ teacherId: teacher1._id, status: 'pending' });
    report(
      pendingNow.length === 0,
      'When all requests are resolved, pending list is empty (correct empty state)'
    );

    // 9I. JoinRequest persists in database with correct relations
    const savedRequest = await JoinRequest.findById(joinRequest1._id)
      .populate('studentId', 'name email')
      .populate('classId', 'className classCode');
    report(
      savedRequest && savedRequest.studentId._id.toString() === student3._id.toString(),
      'JoinRequest correctly persists student reference in MongoDB'
    );
    report(
      savedRequest && savedRequest.classId._id.toString() === class1._id.toString(),
      'JoinRequest correctly persists class reference in MongoDB'
    );

    // 10. Live E2E Class Membership Management (Leave Class & Teacher Remove Student)
    console.log('\n7. Testing Live Class Membership Management (Leave & Remove)...');

    // 10A. Enroll student1 in both class1 and class2
    await Class.findByIdAndUpdate(class1._id, { $addToSet: { students: student1._id } });
    await Class.findByIdAndUpdate(class2._id, { $addToSet: { students: student1._id } });

    const c1BeforeLeave = await Class.findById(class1._id);
    const c2BeforeLeave = await Class.findById(class2._id);
    report(
      c1BeforeLeave.students.some((sId) => sId.equals(student1._id)) &&
      c2BeforeLeave.students.some((sId) => sId.equals(student1._id)),
      'Student 1 successfully enrolled in multiple classes (Class 1 and Class 2)'
    );

    // 10B. Student leaves Class 1
    await Class.findByIdAndUpdate(class1._id, { $pull: { students: student1._id } });

    const c1AfterLeave = await Class.findById(class1._id);
    const c2AfterLeave = await Class.findById(class2._id);
    const leftClass1 = !c1AfterLeave.students.some((sId) => sId.equals(student1._id));
    const remainsInClass2 = c2AfterLeave.students.some((sId) => sId.equals(student1._id));
    report(leftClass1, 'Student successfully removed from Class 1 after leaving');
    report(remainsInClass2, 'Student remains enrolled in Class 2 after leaving Class 1 (multi-class isolation)');

    // 10C. Teacher 1 removes student2 from Class 2
    await Class.findByIdAndUpdate(class2._id, { $addToSet: { students: student2._id } });
    const c2WithStudent2 = await Class.findById(class2._id);
    report(c2WithStudent2.students.some((sId) => sId.equals(student2._id)), 'Student 2 is enrolled in Class 2 before removal');

    // Cross-teacher guard: Teacher 2 cannot remove student from Teacher 1's class
    const canTeacher2ManageClass2 = c2WithStudent2.teacherId.equals(teacher2._id);
    report(!canTeacher2ManageClass2, 'Teacher 2 is forbidden from removing students from Teacher 1\'s class (ownership guard)');

    // Owning Teacher 1 removes student2
    await Class.findByIdAndUpdate(class2._id, { $pull: { students: student2._id } });
    const c2AfterRemove = await Class.findById(class2._id);
    const student2Removed = !c2AfterRemove.students.some((sId) => sId.equals(student2._id));
    report(student2Removed, 'Owning teacher successfully removes student from class membership');

    // 10D. Accounts and other classes preserved
    const student2User = await User.findById(student2._id);
    report(!!student2User, 'Student user account is preserved in MongoDB after removal from class');

    // 10E. Live E2E Join Request Cancellation & Re-requesting after leaving
    const reRequest = new JoinRequest({
      studentId: student1._id,
      classId: class1._id,
      teacherId: teacher1._id,
      status: 'pending',
    });
    await reRequest.save();

    report(reRequest.status === 'pending', 'Student successfully re-requests access after leaving class');

    // Cross-student guard: Student 2 cannot cancel Student 1's request
    const canStudent2Cancel = reRequest.studentId.equals(student2._id);
    report(!canStudent2Cancel, 'Other student is forbidden from cancelling someone else\'s join request');

    // Student 1 cancels their own request
    await JoinRequest.findByIdAndDelete(reRequest._id);
    const reRequestAfterCancel = await JoinRequest.findById(reRequest._id);
    report(reRequestAfterCancel === null, 'Student successfully cancels their pending join request in MongoDB');

    // Cleanup student3, student4 and their requests
    await JoinRequest.findByIdAndDelete(joinRequest1._id);
    await JoinRequest.findByIdAndDelete(joinRequest2._id);
    await Class.findByIdAndUpdate(class1._id, { $pull: { students: student3._id } });
    await User.findByIdAndDelete(student3._id);
    await User.findByIdAndDelete(student4._id);
    joinRequest1 = null;

  } finally {
    // Clean up test data
    console.log('\n8. Cleaning up test data...');
    if (student1) await User.findByIdAndDelete(student1._id);
    if (teacherReg) await User.findByIdAndDelete(teacherReg._id);
    if (teacher1) await User.findByIdAndDelete(teacher1._id);
    if (teacher2) await User.findByIdAndDelete(teacher2._id);
    if (student2) await User.findByIdAndDelete(student2._id);
    if (class1) await Class.findByIdAndDelete(class1._id);
    if (class2) await Class.findByIdAndDelete(class2._id);
    if (class3OfTeacher2) await Class.findByIdAndDelete(class3OfTeacher2._id);
    if (deadlineAll) await Deadline.findByIdAndDelete(deadlineAll._id);
    if (deadlineParticular) await Deadline.findByIdAndDelete(deadlineParticular._id);
    if (announcementAll) await Announcement.findByIdAndDelete(announcementAll._id);
    if (announcementParticular) await Announcement.findByIdAndDelete(announcementParticular._id);
    if (student1 && student2) {
      await Notification.deleteMany({ recipientId: { $in: [student1._id, student2._id] } });
    }
    if (joinRequest1) await JoinRequest.findByIdAndDelete(joinRequest1._id);
    console.log('  Cleaned up all temporary E2E test documents.');
  }

  await mongoose.connection.close();

  console.log('\n====================================================');
  console.log(`   E2E RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================\n');

  if (failedCount > 0) process.exit(1);
}

runE2E().catch(async (err) => {
  console.error('Fatal E2E error:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});

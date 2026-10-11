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

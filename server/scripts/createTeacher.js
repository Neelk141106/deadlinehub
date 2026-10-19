const path = require('path');
const readline = require('readline');
const { Writable } = require('stream');
const mongoose = require('mongoose');

// Load environment variables from server/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');

function askQuestion(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askPassword(query) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    let muted = false;
    const mutableStdout = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    process.stdout.write(query);
    muted = true;

    rl.question('', (answer) => {
      process.stdout.write('\n');
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('   DeadlineHub — Teacher Account Creation CLI       ');
  console.log('====================================================\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not set in environment or server/.env');
    process.exit(1);
  }

  // Connect to Database
  await connectDB();

  let name = '';
  let email = '';
  let password = '';
  let department = 'Information Technology';

  // Support CLI arguments if supplied non-interactively or prompt interactively
  const args = process.argv.slice(2);
  if (args.length >= 3) {
    name = args[0].trim();
    email = args[1].trim();
    password = args[2].trim();
    if (args[3]) department = args[3].trim();
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    name = await askQuestion(rl, 'Enter Teacher Full Name: ');
    email = await askQuestion(rl, 'Enter Teacher College Email: ');
    rl.close();

    password = await askPassword('Enter Teacher Password (min 6 chars, hidden): ');
  }

  // Validations
  if (!name) {
    console.error('\n❌ Error: Teacher name is required.');
    await mongoose.connection.close();
    process.exit(1);
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!email || !emailRegex.test(email)) {
    console.error('\n❌ Error: Please provide a valid email address.');
    await mongoose.connection.close();
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('\n❌ Error: Password must be at least 6 characters long.');
    await mongoose.connection.close();
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    console.error(`\n❌ Error: User with email "${normalizedEmail}" already exists (role: ${existingUser.role}).`);
    await mongoose.connection.close();
    process.exit(1);
  }

  // Create Teacher (password is automatically hashed by User model pre-save hook)
  const teacher = new User({
    name,
    email: normalizedEmail,
    password,
    role: 'teacher',
    department,
    isVerified: true,
  });

  await teacher.save();

  console.log('\n✅ Teacher account created successfully!');
  console.log('----------------------------------------------------');
  console.log(`  Name:       ${teacher.name}`);
  console.log(`  Email:      ${teacher.email}`);
  console.log(`  Role:       ${teacher.role}`);
  console.log(`  Department: ${teacher.department}`);
  console.log(`  User ID:    ${teacher._id}`);
  console.log('----------------------------------------------------');
  console.log('The teacher can now log in using the Teacher / Admin Login screen.\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('\n❌ Unexpected error:', err.message);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});

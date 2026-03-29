// backend/src/scripts/seedAdmin.ts
import dotenv from 'dotenv';
// IMPORTANT: Load environment variables BEFORE importing the database
dotenv.config();

import pool from '../config/db'; // Adjust path to your db config
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding Super Admin...");

    const name = "Super Admin";
    const email = "admin@ngo.org"; 
    const password = "admin123"; // You can change this here

    // 1. Check if Admin exists
    const check = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      console.log("⚠️ Admin already exists. Aborting.");
      return;
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 3. Insert User
    await client.query(
      `INSERT INTO users (name, email, password, role, needs_password_change) 
       VALUES ($1, $2, $3, 'ADMIN', false)`,
      [name, email, hash]
    );

    console.log("✅ Super Admin Created Successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

  } catch (error) {
    console.error("❌ Seeding Failed:", error);
  } finally {
    client.release();
    process.exit(); // Kill the script
  }
};

seedAdmin();
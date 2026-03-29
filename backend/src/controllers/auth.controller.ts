import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import jwt from 'jsonwebtoken';

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert User (Using 'password' column, NOT 'password_hash')
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, needs_password_change)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || 'MEMBER']
    );

    const user = result.rows[0];

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' } // Security: Short expiration
    );

    res.status(201).json({ 
      message: "Registration successful",
      user, 
      token 
    });

  } catch (error: any) {
    console.error("REGISTER ERROR:", error);
    if (error.code === "23505") { // Unique constraint violation
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Check User
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // 2. Check Password
    // Using 'password' column based on our recent schema fix
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate Token (Short-lived for security)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' } // <--- SECURITY: Token dies in 1 hour (Auto-logout)
    );

    // =========================================================
    // 4. [SAFE] LOG THE LOGIN ACTIVITY
    // We wrap this in a separate try/catch so it doesn't break login if it fails
    // =========================================================
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      let ip = req.ip || req.socket.remoteAddress || 'Unknown IP';
      
      // Clean up local IPv6 address
      if (ip === '::1') ip = '127.0.0.1'; 

      // Ensure the table exists before inserting (Optional safety check)
      await pool.query(
        `INSERT INTO login_history (user_id, ip_address, device_info, login_time) 
         VALUES ($1, $2, $3, NOW())`,
        [user.id, ip, userAgent]
      );
    } catch (logError) {
      // Just log the error to console, but ALLOW the user to login
      console.error("⚠️ Login Activity Log Failed (Non-fatal):", logError);
    }
    // =========================================================

    // 5. Send Response
    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image // Assuming you might join or have this field now
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
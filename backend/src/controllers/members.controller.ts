import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";

// ==========================================
// 1. PUBLIC: GET SHOWCASE MEMBERS
// ==========================================
export const getPublicMembers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.designation, m.bio, m.image, m.linkedin, m.join_date, u.name, u.email
       FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE m.is_public = true
       ORDER BY m.id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET PUBLIC MEMBERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. MEMBER: GET MY PROFILE
// ==========================================
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch combined data from members and users table
    const result = await pool.query(
      `SELECT m.*, u.name, u.email, u.role
       FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 3. MEMBER: UPDATE MY PROFILE
// ==========================================
export const updateMyProfile = async (req: any, res: Response) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { name, email, designation, bio, image, linkedin } = req.body;

    await client.query('BEGIN');

    // A. Update User Account (Name & Email)
    if (name || email) {
      await client.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email)
         WHERE id = $3`,
        [name, email, userId]
      );
    }

    // B. Update Member Profile (Bio, Image, LinkedIn)
    await client.query(
      `UPDATE members
       SET designation = COALESCE($1, designation),
           bio = COALESCE($2, bio),
           image = COALESCE($3, image),
           linkedin = COALESCE($4, linkedin),
           updated_at = NOW()
       WHERE user_id = $5`,
      [designation, bio, image, linkedin, userId]
    );

    await client.query('COMMIT');
    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to update profile" });
  } finally {
    client.release();
  }
};

// ==========================================
// 4. ADMIN: GET ALL MEMBERS
// ==========================================
export const getAllMembers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name, u.email, u.role
       FROM members m
       JOIN users u ON m.user_id = u.id
       ORDER BY m.id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// ==========================================
// 5. ADMIN: CREATE MEMBER
// ==========================================
export const createMember = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      name, email, password, role, designation, bio, join_date, image, is_public, linkedin
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }

    await client.query('BEGIN');

    // Check existing email
    const userCheck = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, needs_password_change)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email`,
      [name, email, hashedPassword, role || 'MEMBER']
    );
    const newUserId = userResult.rows[0].id;

    // Create Member Profile
    const memberResult = await client.query(
      `INSERT INTO members (user_id, designation, bio, join_date, status, image, is_public, linkedin)
       VALUES ($1, $2, $3, $4, 'Active', $5, $6, $7)
       RETURNING *`,
      [
        newUserId,
        designation || 'Member',
        bio || '',
        join_date || new Date(),
        image || '',
        is_public || false,
        linkedin || ''
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: "Member created successfully",
      user: userResult.rows[0],
      member: memberResult.rows[0]
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("CREATE MEMBER ERROR:", error.message);
    res.status(500).json({ message: "Failed to create member" });
  } finally {
    client.release();
  }
};

// ==========================================
// 6. ADMIN: UPDATE MEMBER (Full Edit - Name & Profile)
// ==========================================
export const updateMember = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const memberId = Number(req.params.id);
    const { name, designation, status, bio, image, is_public, linkedin } = req.body;

    await client.query('BEGIN');

    // 1. Get the user_id linked to this member
    const memberResult = await client.query(
      "SELECT user_id FROM members WHERE id = $1",
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Member not found" });
    }

    const userId = memberResult.rows[0].user_id;

    // 2. Update Name in 'users' table (if provided)
    if (name) {
      await client.query(
        "UPDATE users SET name = $1 WHERE id = $2",
        [name, userId]
      );
    }

    // 3. Update Profile in 'members' table
    const result = await client.query(
      `UPDATE members
       SET designation = $1, status = $2, bio = $3, image = $4, is_public = $5, linkedin = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [designation, status, bio, image, is_public, linkedin, memberId]
    );

    await client.query('COMMIT');

    // Return combined data
    res.json({
      ...result.rows[0],
      name: name
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("UPDATE MEMBER ERROR:", error);
    res.status(500).json({ message: "Failed to update member" });
  } finally {
    client.release();
  }
};

// ==========================================
// 7. ADMIN: TOGGLE VISIBILITY
// ==========================================
export const toggleMemberVisibility = async (req: Request, res: Response) => {
  try {
    const memberId = Number(req.params.id);
    const { is_public } = req.body;

    const result = await pool.query(
      `UPDATE members SET is_public = $1 WHERE id = $2 RETURNING *`,
      [is_public, memberId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Member not found" });

    res.json({ message: "Visibility updated", member: result.rows[0] });
  } catch (error) {
    console.error("TOGGLE VISIBILITY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 8. ADMIN: DELETE MEMBER
// ==========================================
export const deleteMember = async (req: any, res: Response) => {
  const client = await pool.connect();
  try {
    const memberId = Number(req.params.id);

    // 1. Find the member to get their user_id
    const memberResult = await client.query("SELECT * FROM members WHERE id = $1", [memberId]);
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    const member = memberResult.rows[0];

    // 2. Prevent Self-Delete (You cannot delete your own logged-in admin account)
    // Note: req.user comes from the 'authenticate' middleware
    if (member.user_id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await client.query('BEGIN');

    // 3. Delete from 'members' table
    await client.query("DELETE FROM members WHERE id = $1", [memberId]);

    // 4. Delete from 'users' table (cascade will handle logs, but explicit is safer)
    await client.query("DELETE FROM users WHERE id = $1", [member.user_id]);

    await client.query('COMMIT');

    return res.json({ message: "Member deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("DELETE MEMBER ERROR:", error);
    return res.status(500).json({ message: "Member cannot be deleted" });
  } finally {
    client.release();
  }
};
import { Request, Response } from "express";
import pool from "../config/db";

// ================= CREATE ANNOUNCEMENT =================
export const createAnnouncement = async (req: any, res: Response) => {
  try {
    // CHANGE 1: 'message' -> 'content', Added 'category'
    const { title, content, category } = req.body;

    const result = await pool.query(
      `INSERT INTO announcements (title, content, category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, content, category || 'General']

    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

// ================= GET ALL ANNOUNCEMENTS =================
export const getAnnouncements = async (_req: Request, res: Response) => {
  try {

    const result = await pool.query(
      `SELECT * FROM announcements ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

// ================= UPDATE ANNOUNCEMENT =================
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // CHANGE 3: 'message' -> 'content', Added 'category'
    const { title, content, category } = req.body;

    const result = await pool.query(
      `UPDATE announcements
       SET title = $1, content = $2, category = $3
       WHERE id = $4
       RETURNING *`,
      [title, content, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Failed to update announcement" });
  }
};

// ================= DELETE ANNOUNCEMENT =================
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};
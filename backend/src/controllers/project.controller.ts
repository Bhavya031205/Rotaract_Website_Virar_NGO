import { Request, Response } from "express";
import pool from "../config/db";

// ==========================================
// 1. PUBLIC & ADMIN SHOWCASE FEATURES
// ==========================================

// GET ALL (Public + Admin)
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 NEW: GET SINGLE PROJECT BY ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET PROJECT BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE (Admin)
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, status, location, beneficiaries, image } = req.body;

    // FIX: Convert empty strings to NULL for PostgreSQL dates
    const safeStartDate = start_date === '' ? null : start_date;
    const safeEndDate = end_date === '' ? null : end_date;

    const result = await pool.query(
      `INSERT INTO projects (title, description, start_date, end_date, status, location, beneficiaries, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, safeStartDate, safeEndDate, status || 'Ongoing', location, beneficiaries, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
};

// UPDATE (Admin)
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, status, location, beneficiaries, image } = req.body;

    // FIX: Convert empty strings to NULL for PostgreSQL dates
    const safeStartDate = start_date === '' ? null : start_date;
    const safeEndDate = end_date === '' ? null : end_date;

    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, description = $2, start_date = $3, end_date = $4, 
           status = $5, location = $6, beneficiaries = $7, image = $8
       WHERE id = $9 RETURNING *`,
      [title, description, safeStartDate, safeEndDate, status, location, beneficiaries, image, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Project not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE (Admin)
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. INTERNAL TEAM MANAGEMENT FEATURES
// ==========================================

export const assignTeam = async (req: Request, res: Response) => {
  try {
    const { project_id, member_id, role_in_project } = req.body;

    const result = await pool.query(
      `INSERT INTO project_teams (project_id, member_id, role_in_project)
       VALUES ($1, $2, $3) RETURNING *`,
      [project_id, member_id, role_in_project]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ASSIGN TEAM ERROR:", err);
    res.status(500).json({ message: "Failed to assign team" });
  }
};

export const myProjects = async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM projects p
       JOIN project_teams pt ON p.id = pt.project_id
       WHERE pt.member_id = $1`, 
      [req.user.id] 
    );
    res.json(result.rows);
  } catch (err) {
    console.error("MY PROJECTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitProjectReport = async (req: any, res: Response) => {
  try {
    const { project_id, content } = req.body;

    const result = await pool.query(
      `INSERT INTO project_reports (project_id, submitted_by, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [project_id, req.user.id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("SUBMIT REPORT ERROR:", err);
    res.status(500).json({ message: "Failed to submit report" });
  }
};

export const reviewProjectReport = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const reportId = req.params.id;

    const result = await pool.query(
      `UPDATE project_reports
       SET status=$1
       WHERE id=$2 RETURNING *`,
      [status, reportId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("REVIEW REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
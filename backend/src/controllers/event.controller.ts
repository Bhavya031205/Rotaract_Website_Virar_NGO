import { Request, Response } from "express";
import pool from "../config/db";

// ================= CREATE EVENT (ADMIN) =================
export const createEvent = async (req: any, res: Response) => {
  try {
    // Extracted all fields including 'gallery' and 'registration_status'
    const { 
      title, 
      description, 
      event_date, 
      event_time, 
      location, 
      image, 
      registration_link, 
      gallery, 
      registration_status // <--- NEW FIELD
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events 
       (title, description, event_date, event_time, location, image, registration_link, created_by, gallery, registration_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title, 
        description, 
        event_date, 
        event_time, 
        location, 
        image, 
        registration_link, 
        req.user.id, 
        gallery || [], 
        registration_status || 'open' // Default to 'open' if not sent
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

// ================= GET ALL EVENTS (PUBLIC & ADMIN) =================
export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    // The query automatically fetches all columns including 'registration_status'
    const result = await pool.query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// ================= UPDATE EVENT (ADMIN) =================
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    
    // Extracted all fields
    const { 
      title, 
      description, 
      event_date, 
      event_time, 
      location, 
      image, 
      registration_link, 
      gallery,
      registration_status // <--- NEW FIELD
    } = req.body;

    const result = await pool.query(
      `UPDATE events
       SET title = $1,
           description = $2,
           event_date = $3,
           event_time = $4,
           location = $5,
           image = $6,
           registration_link = $7,
           gallery = $8,
           registration_status = $9
       WHERE id = $10
       RETURNING *`,
      [
        title, 
        description, 
        event_date, 
        event_time, 
        location, 
        image, 
        registration_link, 
        gallery || [], 
        registration_status || 'open', // Default to 'open'
        eventId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

// ================= DELETE EVENT (ADMIN) =================
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

// ================= RSVP TO EVENT (MEMBER) =================
export const rsvpEvent = async (req: any, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const { status } = req.body;
    
    // AUTO-FIX: Ensure table exists before inserting
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);
    // Ensure column exists
    await pool.query(`ALTER TABLE event_rsvps ADD COLUMN IF NOT EXISTS status VARCHAR(50);`);

    await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id)
       DO UPDATE SET status = EXCLUDED.status`,
      [eventId, req.user.id, status]
    );

    res.json({ message: "RSVP recorded" });
  } catch (error) {
    console.error("RSVP ERROR:", error);
    res.status(500).json({ message: "Failed to RSVP" });
  }
};

// ================= EVENT RSVP REPORT (ADMIN) =================
export const getEventRsvps = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);

    // 1. Ensure Table Exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    // 2. Force add the 'status' column if it's missing
    await pool.query(`
      ALTER TABLE event_rsvps 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50);
    `);

    // 3. Fetch Data
    const result = await pool.query(
      `SELECT u.name, u.email, r.status
       FROM event_rsvps r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1`,
      [eventId]
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error("RSVP REPORT ERROR:", error);
    res.status(500).json({ message: "Failed to fetch RSVP report: " + error.message });
  }
};
import { Request, Response } from 'express';
import pool from '../config/db';

export const getLoginLogs = async (req: Request, res: Response) => {
  try {
    // Join with users table to get names
    const result = await pool.query(`
      SELECT l.id, l.login_time, l.ip_address, l.device_info, u.name, u.email, u.role
      FROM login_history l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.login_time DESC
      LIMIT 100
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
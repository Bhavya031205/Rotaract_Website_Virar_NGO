import { Request, Response } from 'express';
import pool from '../config/db';

// 1. GET Content (Public - No Login Required)
export const getContent = async (req: Request, res: Response) => {
  const { pageKey } = req.params;

  try {
    const result = await pool.query(
      'SELECT content FROM site_content WHERE page_key = $1',
      [pageKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No content found for page: ${pageKey}` });
    }

    res.json(result.rows[0].content);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ message: 'Server Error fetching content' });
  }
};

// 2. UPDATE Content (Admin Only)
export const updateContent = async (req: Request, res: Response) => {
  const { pageKey } = req.params;
  const newContent = req.body; // The full JSON object from Frontend

  try {
    // This query does an "Upsert": Update if exists, Insert if it doesn't
    const result = await pool.query(
      `INSERT INTO site_content (page_key, content, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (page_key) 
       DO UPDATE SET content = $2, updated_at = NOW()
       RETURNING *`,
      [pageKey, newContent]
    );

    res.json({ message: 'Content updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error('Error updating content:', err);
    res.status(500).json({ message: 'Server Error updating content' });
  }
};
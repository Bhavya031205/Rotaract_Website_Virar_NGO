import { Request, Response } from 'express';
import pool from '../config/db';

// 1. Public: Get all PUBLISHED FAQs
export const getPublicFaqs = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM faqs WHERE is_published = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Public: User asks a question
export const askQuestion = async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO faqs (question, is_published) VALUES ($1, FALSE) RETURNING *',
      [question]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Admin: Get ALL questions (Pending & Published)
export const getAllFaqs = async (req: Request, res: Response) => {
  try {
    // Order by: Pending questions first, then newest
    const result = await pool.query(
      'SELECT * FROM faqs ORDER BY is_published ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Admin: Answer & Publish
export const answerFaq = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { answer } = req.body; // Admin sends the answer
  
  try {
    const result = await pool.query(
      'UPDATE faqs SET answer = $1, is_published = TRUE WHERE id = $2 RETURNING *',
      [answer, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Admin: Delete (Spam or bad questions)
export const deleteFaq = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM faqs WHERE id = $1', [id]);
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ... keep existing imports and functions ...

// 6. Admin: Update a specific FAQ (Question & Answer)
export const updateFaq = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE faqs SET question = $1, answer = $2 WHERE id = $3 RETURNING *',
      [question, answer, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7. Admin: Create a new FAQ directly (Already published)
export const createAdminFaq = async (req: Request, res: Response) => {
  const { question, answer } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO faqs (question, answer, is_published) VALUES ($1, $2, TRUE) RETURNING *',
      [question, answer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
import { Request, Response } from "express";
import pool from "../config/db";

// ==========================================
// 1. CREATE POST (With File Upload)
// ==========================================
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, category_id, author_name, author_role } = req.body;
    
    // Multer adds the 'files' object to request
    const files = req.files as Express.Multer.File[];
    
    // Map files to URL paths (assuming server serves /uploads)
    const filePaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

    const query = `
      INSERT INTO blog_posts 
      (title, excerpt, content, category_id, author_name, author_role, image_urls, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [
      title, 
      excerpt, 
      content, 
      Number(category_id), 
      author_name, 
      author_role, 
      filePaths // Postgres array
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// ==========================================
// 2. UPDATE POST (New Logic)
// ==========================================
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, excerpt, content, category_id, 
      author_name, author_role, existing_images 
    } = req.body;

    // 1. Process New Uploads
    const files = req.files as Express.Multer.File[];
    const newFilePaths = files ? files.map(file => `/uploads/${file.filename}`) : [];

    // 2. Process Existing Images
    // FormData sends arrays differently. If 1 item, it's a string; if multiple, it's an array.
    let currentImages: string[] = [];
    if (existing_images) {
        if (Array.isArray(existing_images)) {
            currentImages = existing_images;
        } else {
            currentImages = [existing_images];
        }
    }

    // 3. Combine Old + New
    const finalImages = [...currentImages, ...newFilePaths];

    const query = `
      UPDATE blog_posts 
      SET title = $1, excerpt = $2, content = $3, category_id = $4, 
          author_name = $5, author_role = $6, image_urls = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      title, excerpt, content, Number(category_id), 
      author_name, author_role, finalImages, id
    ];

    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("UPDATE POST ERROR:", error);
    res.status(500).json({ message: "Server error updating post" });
  }
};

// ... (Keep your existing getCategories, getPosts, deletePost here)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM blog_categories");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM blog_posts p 
      LEFT JOIN blog_categories c ON p.category_id = c.id 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM blog_posts WHERE id = $1", [id]);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
};

// ... existing imports

// GET SINGLE POST BY ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch post and join with category name for display
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM blog_posts p 
      LEFT JOIN blog_categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching single post:", error);
    res.status(500).json({ message: "Server error" });
  }
};
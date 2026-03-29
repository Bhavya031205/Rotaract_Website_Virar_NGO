

import { Request, Response } from 'express';
import pool from '../config/db';

// ==========================================
// 1. GET SETTINGS (Public & Admin)
// ==========================================
export const getDonationSettings = async (req: Request, res: Response) => {
  try {
    // We fetch the row with ID = 1 (our main configuration row)
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    
    if (result.rows.length === 0) {
      // Return empty default structure if DB is strictly empty
      return res.json({
        bank_name: '', account_name: '', account_number: '', 
        ifsc_code: '', branch_name: '', upi_id: '', 
        preset_amounts: [500, 1000, 2000], contact_email: ''
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================================
// 2. UPDATE SETTINGS (Admin Only)
// ==========================================
// Inside server/src/controllers/settings.controller.ts

export const updateDonationSettings = async (req: Request, res: Response) => {
  try {
    const { 
      bank_name, account_name, account_number, ifsc_code, 
      branch_name, upi_id, preset_amounts, contact_email, qr_code // 👈 Added this
    } = req.body;

    const amountsJson = JSON.stringify(preset_amounts);

    await pool.query(
      `INSERT INTO settings (id, category, bank_name, account_name, account_number, ifsc_code, branch_name, upi_id, preset_amounts, contact_email, qr_code, updated_at)
       VALUES (1, 'donation', $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) 
       DO UPDATE SET 
         bank_name = EXCLUDED.bank_name,
         account_name = EXCLUDED.account_name,
         account_number = EXCLUDED.account_number,
         ifsc_code = EXCLUDED.ifsc_code,
         branch_name = EXCLUDED.branch_name,
         upi_id = EXCLUDED.upi_id,
         preset_amounts = EXCLUDED.preset_amounts,
         contact_email = EXCLUDED.contact_email,
         qr_code = EXCLUDED.qr_code, 
         updated_at = NOW()`,
      [bank_name, account_name, account_number, ifsc_code, branch_name, upi_id, amountsJson, contact_email, qr_code]
    );

    res.json({ message: "Settings Updated Successfully" });

  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Update Failed" });
  }
};
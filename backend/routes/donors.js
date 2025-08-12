const express = require('express');
const { Pool } = require('pg');
// Authentication removed for simplicity

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

/**
 * GET /api/donors
 * Fetch all donors with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { name, minAmount, maxAmount, dateFrom, dateTo } = req.query;
        
        let query = 'SELECT * FROM donors WHERE 1=1';
        const params = [];
        let paramCount = 0;

        // Add filters
        if (name) {
            paramCount++;
            query += ` AND name ILIKE $${paramCount}`;
            params.push(`%${name}%`);
        }

        if (minAmount) {
            paramCount++;
            query += ` AND donation_amount >= $${paramCount}`;
            params.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            paramCount++;
            query += ` AND donation_amount <= $${paramCount}`;
            params.push(parseFloat(maxAmount));
        }

        if (dateFrom) {
            paramCount++;
            query += ` AND date >= $${paramCount}`;
            params.push(dateFrom);
        }

        if (dateTo) {
            paramCount++;
            query += ` AND date <= $${paramCount}`;
            params.push(dateTo);
        }

        query += ' ORDER BY date DESC';

        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/donors
 * Add new donor
 */
router.post('/', async (req, res) => {
    try {
        const { name, contact, donation_amount } = req.body;

        if (!name || !donation_amount) {
            return res.status(400).json({
                success: false,
                error: 'Name and donation amount are required'
            });
        }

        if (isNaN(donation_amount) || donation_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Donation amount must be a positive number'
            });
        }

        const result = await pool.query(
            'INSERT INTO donors (name, contact, donation_amount) VALUES ($1, $2, $3) RETURNING *',
            [name, contact, parseFloat(donation_amount)]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Donor added successfully'
        });

    } catch (error) {
        console.error('Error adding donor:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/donors/:id
 * Update donor
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, donation_amount } = req.body;

        if (!name || !donation_amount) {
            return res.status(400).json({
                success: false,
                error: 'Name and donation amount are required'
            });
        }

        if (isNaN(donation_amount) || donation_amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Donation amount must be a positive number'
            });
        }

        const result = await pool.query(
            'UPDATE donors SET name = $1, contact = $2, donation_amount = $3 WHERE id = $4 RETURNING *',
            [name, contact, parseFloat(donation_amount), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Donor not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Donor updated successfully'
        });

    } catch (error) {
        console.error('Error updating donor:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/donors/:id
 * Delete donor
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM donors WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Donor not found'
            });
        }

        res.json({
            success: true,
            message: 'Donor deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;

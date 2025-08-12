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
 * GET /api/expenses
 * Fetch all expenses
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM expenses ORDER BY date DESC'
        );
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/expenses
 * Add new expense
 */
router.post('/', async (req, res) => {
    try {
        const { description, amount } = req.body;

        if (!description || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Description and amount are required'
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number'
            });
        }

        const result = await pool.query(
            'INSERT INTO expenses (description, amount) VALUES ($1, $2) RETURNING *',
            [description, parseFloat(amount)]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Expense added successfully'
        });

    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/expenses/:id
 * Update expense
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount } = req.body;

        if (!description || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Description and amount are required'
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number'
            });
        }

        const result = await pool.query(
            'UPDATE expenses SET description = $1, amount = $2 WHERE id = $3 RETURNING *',
            [description, parseFloat(amount), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Expense updated successfully'
        });

    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/expenses/:id
 * Delete expense
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM expenses WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;

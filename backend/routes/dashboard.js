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
 * GET /api/dashboard/donors
 * Return all donors with same filters as /donors
 */
router.get('/donors', async (req, res) => {
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
        console.error('Error fetching dashboard donors:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/dashboard/summary
 * Return financial summary
 */
router.get('/summary', async (req, res) => {
    try {
        // Get total donations
        const donationsResult = await pool.query(
            'SELECT COALESCE(SUM(donation_amount), 0) as total_donations FROM donors'
        );

        const totalDonations = parseFloat(donationsResult.rows[0].total_donations);
        const estimateBudget = parseFloat(process.env.GANAPATI_BUDGET) || 0;
        const remainingBudget = estimateBudget - totalDonations;

        res.json({
            success: true,
            data: {
                totalDonations,
                estimateBudget,
                remainingBudget
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/dashboard/expenses
 * Return expenses summary and history
 */
router.get('/expenses', async (req, res) => {
    try {
        // Get total expenses
        const expensesResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses'
        );

        // Get total donations
        const donationsResult = await pool.query(
            'SELECT COALESCE(SUM(donation_amount), 0) as total_donations FROM donors'
        );

        // Get expense history
        const historyResult = await pool.query(
            'SELECT id, description, amount, date FROM expenses ORDER BY date DESC'
        );

        const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);
        const totalDonations = parseFloat(donationsResult.rows[0].total_donations);
        const remainingBalance = totalDonations - totalExpenses;

        res.json({
            success: true,
            data: {
                totalExpenses,
                totalDonations,
                remainingBalance,
                expenseHistory: historyResult.rows
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard expenses:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/dashboard/remaining
 * Return only remaining donation after expenses
 */
router.get('/remaining', async (req, res) => {
    try {
        // Get total donations
        const donationsResult = await pool.query(
            'SELECT COALESCE(SUM(donation_amount), 0) as total_donations FROM donors'
        );

        // Get total expenses
        const expensesResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses'
        );

        const totalDonations = parseFloat(donationsResult.rows[0].total_donations);
        const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses);
        const remainingDonation = totalDonations - totalExpenses;

        res.json({
            success: true,
            data: {
                remainingDonation,
                totalDonations,
                totalExpenses
            }
        });

    } catch (error) {
        console.error('Error fetching remaining donation:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;

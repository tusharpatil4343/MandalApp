const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

const initSQL = `
-- Ganesh Festival Donation Management Database Schema

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    donation_amount NUMERIC(10,2) NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

-- Insert sample donors
INSERT INTO donors (name, contact, donation_amount) VALUES
('Kundlik Bhikaji Patil', '+91-9359774343', 2500.00),
('Bhau Chaudhari', '+91-8765432109', 2500.00),
('Vaibhav Patil Mantri', '+91-7654321098', 2500.00),
('Rajesh Tukaram Patil', '+91-6543210987', 2500.00),
('Balu Vishwas Patil Singh', '+91-5432109876', 2525.00),
('Kunal Patil', '+91-8765432109', 2525.00),
('Dhiraj Vishnu Patil', '+91-8765432109', 2525.00),
('Sambhaji Pandurang Patil', '+91-6543210987', 2525.00)
ON CONFLICT DO NOTHING;

-- Insert sample expenses
INSERT INTO expenses (description, amount) VALUES
('Pandal Decoration', 15000.00),
('Sound System', 8000.00),
('Food & Prasad', 12000.00),
('Transportation', 5000.00),
('Miscellaneous', 3000.00)
ON CONFLICT DO NOTHING;


`;

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to Neon database...');
        
        // Test connection
        const client = await pool.connect();
        console.log('✅ Connected to database successfully!');
        
        console.log('📊 Creating tables and inserting sample data...');
        
        // Execute the SQL
        await client.query(initSQL);
        
        console.log('✅ Database setup completed successfully!');
        console.log('📋 Tables created: donors, expenses');
        console.log('📊 Sample data inserted');
        
        client.release();
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the setup
setupDatabase();

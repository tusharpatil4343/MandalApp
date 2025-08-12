const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing database connection...');
console.log('📋 DATABASE_URL format check:');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

// Parse the connection string to check format
const url = process.env.DATABASE_URL;
console.log('✅ DATABASE_URL found');

// Extract parts of the URL for debugging (without showing password)
const urlParts = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (urlParts) {
    console.log('✅ URL format looks correct');
    console.log(`👤 Username: ${urlParts[1]}`);
    console.log(`🌐 Host: ${urlParts[3]}`);
    console.log(`🔢 Port: ${urlParts[4]}`);
    console.log(`📊 Database: ${urlParts[5]}`);
    console.log(`🔑 Password: [hidden]`);
} else {
    console.error('❌ DATABASE_URL format appears incorrect');
    console.log('Expected format: postgresql://username:password@host:port/database');
    process.exit(1);
}

// Test connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Try without SSL first
    connectionTimeoutMillis: 5000
});

async function testConnection() {
    try {
        console.log('\n🔌 Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Connection successful!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time');
        console.log(`⏰ Database time: ${result.rows[0].current_time}`);
        
        client.release();
        await pool.end();
        console.log('✅ Connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        // If SSL was the issue, try with SSL
        if (error.message.includes('SSL') || error.message.includes('password')) {
            console.log('\n🔄 Retrying with SSL...');
            const sslPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 5000
            });
            
            try {
                const client = await sslPool.connect();
                console.log('✅ SSL connection successful!');
                client.release();
                await sslPool.end();
            } catch (sslError) {
                console.error('❌ SSL connection also failed:', sslError.message);
                console.log('\n💡 Troubleshooting tips:');
                console.log('1. Check if your Neon database URL is correct');
                console.log('2. Make sure the password doesn\'t contain special characters');
                console.log('3. Try regenerating the connection string in Neon console');
                console.log('4. Check if your database is active');
            }
        }
    }
}

testConnection();

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
    // Use the same database configuration as db.js
    const client = new pg.Client(
        process.env.DATABASE_URL ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        } : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
    );

    try {
        await client.connect();
        console.log('Connected to database');        // Drop existing types and tables
        await client.query(`
            DROP TYPE IF EXISTS notification_status CASCADE;
            DROP TYPE IF EXISTS notification_type CASCADE;
            DROP TYPE IF EXISTS user_role CASCADE;
            DROP TYPE IF EXISTS attachment_type CASCADE;
            
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS journal_students CASCADE;
            DROP TABLE IF EXISTS attachments CASCADE;
            DROP TABLE IF EXISTS journals CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('Dropped existing tables and types');

        // Read and execute schema.sql
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
        await client.query(schemaSQL);
        console.log('Schema created successfully');

        // Optionally, load seed data in production
        if (process.env.LOAD_SEED_DATA === 'true') {
            const seedSQL = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf8');
            await client.query(seedSQL);
            console.log('Seed data loaded successfully');
        }

        await client.end();
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase().catch(console.error);

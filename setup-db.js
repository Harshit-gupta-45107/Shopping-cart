// const { Pool, Client } = require('pg');
// const fs = require('fs');
// const path = require('path');
import pkg from 'pg';
const { Pool, Client } = pkg;
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
    // Create a client connection to postgres database (not using connection pooling)
    const client = new Client({
        user: 'postgres',
        password: 'H@rshit45107',
        host: 'localhost',
        port: 5432,
        database: 'postgres'
    });

    try {
        await client.connect();
        
        // Drop existing connections to journal_app
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'journal_app'
            AND pid <> pg_backend_pid();
        `);

        // Drop and recreate database (outside of transaction)
        await client.query('DROP DATABASE IF EXISTS journal_app;');
        await client.query('CREATE DATABASE journal_app;');
        console.log('Database created successfully');

        // Close postgres connection
        await client.end();

        // Create a new client connection to journal_app
        const journalClient = new Client({
            user: 'postgres',
            password: 'H@rshit45107',
            host: 'localhost',
            port: 5432,
            database: 'journal_app'
        });

        await journalClient.connect();

        // Read and execute schema.sql
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
        await journalClient.query(schemaSQL);
        console.log('Schema created successfully');

        await journalClient.end();
    } catch (error) {
        console.error('Error setting up database:', error.message);
        process.exit(1);
    }
}

// Call the setup function
setupDatabase()
  .then(() => console.log('Database setup completed successfully'))
  .catch(err => {
    console.error('Failed to setup database:', err);
    process.exit(1);
  });

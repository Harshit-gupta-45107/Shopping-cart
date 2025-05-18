// const { Client } = require('pg');
// const fs = require('fs');
// const path = require('path');
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';


async function loadSeedData() {
    const client = new Client({
        user: 'postgres',
        password: 'H@rshit45107',
        host: 'localhost',
        port: 5432,
        database: 'journal_app'
    });

    try {
        await client.connect();
        
        // Read and execute seed.sql
        const seedSQL = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf8');
        await client.query(seedSQL);
        console.log('Seed data loaded successfully');

        await client.end();
    } catch (error) {
        console.error('Error loading seed data:', error.message);
        process.exit(1);
    }
}

loadSeedData()
    .then(() => {
        console.log('Seed data loading completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Failed to load seed data:', err);
        process.exit(1);
    });

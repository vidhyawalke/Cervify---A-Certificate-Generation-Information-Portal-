/**
 * @file db.js
 * @description SQLite database connection singleton for Cervify.
 *
 * Exports a `connectDb()` function that opens (or creates) the SQLite
 * database file at `server/database/cervify.db`, and a `getDb()` getter
 * that returns the live connection after initialization.
 *
 * All route modules import `getDb()` rather than managing their own
 * connections, ensuring a single shared connection across the process.
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

/** Shared database connection instance — populated by `connectDb()`. */
let db;

/**
 * Opens the SQLite database file and stores the connection internally.
 * Must be called once during application startup (in `index.js`).
 *
 * @returns {Promise<void>}
 */
async function connectDb() {
    db = await open({
        filename: path.join(__dirname, '..', 'database', 'cervify.db'),
        driver: sqlite3.Database
    });
    console.log('[DB] Connected to SQLite database at server/database/cervify.db');
}

/**
 * Returns the active SQLite database connection.
 * Throws if called before `connectDb()` has completed.
 *
 * @returns {import('sqlite').Database} Active SQLite connection
 */
function getDb() {
    if (!db) throw new Error('[DB] Database not initialized. Call connectDb() first.');
    return db;
}

module.exports = { connectDb, getDb };

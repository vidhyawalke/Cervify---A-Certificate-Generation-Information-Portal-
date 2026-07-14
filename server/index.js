/**
 * @file index.js  (server entry point)
 * @description Express application bootstrap for the Cervify Certificate Portal.
 *
 * Responsibilities of this file:
 *  1. Initialize Express with global middleware (CORS, JSON parsing, static files)
 *  2. Connect to the SQLite database via the `config/db` module
 *  3. Mount all feature routers at their canonical API paths
 *  4. Serve the compiled React frontend build in production (monolithic deployment)
 *  5. Start the HTTP server
 *
 * Environment Variables:
 *  PORT             — HTTP port to listen on (default: 5000)
 *  GOOGLE_CLIENT_ID — Google OAuth 2.0 Client ID (set before deploying to production)
 *  JWT_SECRET       — Secret key for signing JWT tokens (overrides default in middleware/auth.js)
 *
 * Project Structure (server/):
 *  config/         — Database connection singleton
 *  middleware/     — Authentication guards and file upload handler
 *  routes/         — Feature-specific Express routers
 *  database/       — SQLite schema and seed initializer
 *  uploads/        — Uploaded activity documents (gitignored)
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const { connectDb }        = require('./config/db');
const { UPLOADS_DIR }      = require('./middleware/upload');

// Feature routers
const authRoutes        = require('./routes/auth.routes');
const masterRoutes      = require('./routes/master.routes');
const activityRoutes    = require('./routes/activity.routes');
const participantRoutes = require('./routes/participant.routes');
const certificateRoutes = require('./routes/certificate.routes');
const reportRoutes      = require('./routes/report.routes');
const verifyRoutes      = require('./routes/verify.routes');

// ── Application Setup ─────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ──────────────────────────────────────────────────────────

/** Allow cross-origin requests during development (Vite dev server on :5173). */
app.use(cors());

/** Parse incoming JSON request bodies. */
app.use(express.json());

/** Serve uploaded activity documents as static files. */
app.use('/uploads', express.static(UPLOADS_DIR));

// ── API Routes ─────────────────────────────────────────────────────────────────

app.use('/api/auth',         authRoutes);
app.use('/api/master',       masterRoutes);
app.use('/api/activities',   activityRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/verify',       verifyRoutes);

/**
 * Participant routes are mounted as a sub-router under activities so they
 * share the :id parameter from the parent path.
 *
 * Results in: GET/POST /api/activities/:id/participants
 */
app.use('/api/activities/:id/participants', participantRoutes);

// ── Production Static File Serving ────────────────────────────────────────────

/**
 * In production (or when the React build exists), serve the compiled frontend
 * from `client/dist/`.  The catch-all middleware ensures React Router works
 * correctly for all non-API, non-upload paths.
 */
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
    // Pass API and upload requests through to the 404 handler
    if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
        return next();
    }

    const htmlFile = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(htmlFile)) {
        res.sendFile(htmlFile);
    } else {
        // Friendly message when the React build hasn't been generated yet
        res.status(200).send(
            '<h2>Cervify API Server Running ✓</h2>' +
            '<p>Frontend build not found. Run <code>npm run build-client</code> from the project root.</p>'
        );
    }
});

// ── Start Server ───────────────────────────────────────────────────────────────

/**
 * Connect to the database THEN start listening.
 * This ensures no requests are handled before the DB is ready.
 */
connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`\n✅  Cervify server running → http://localhost:${PORT}`);
            console.log(`    API base: http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error('❌  Failed to start Cervify server:', err);
        process.exit(1);
    });

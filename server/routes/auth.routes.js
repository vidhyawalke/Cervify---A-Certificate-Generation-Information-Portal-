/**
 * @file auth.routes.js
 * @description Authentication API routes for Cervify.
 *
 * Endpoints:
 *  POST /api/auth/login        — Traditional username/password login
 *  POST /api/auth/google       — Google OAuth 2.0 ID-token verification
 *  GET  /api/auth/me           — Returns the current logged-in user's profile
 *
 * All endpoints that return a session issue a signed JWT valid for 8 hours.
 * The JWT payload contains: { id, username, role, name }.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/** Google OAuth2 client — GOOGLE_CLIENT_ID must be set as an env var in production. */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Shared helper — builds and signs a JWT, then formats the user response object.
 *
 * @param {object} user - Raw user row from staff_tbl (joined with role and department)
 * @returns {{ token: string, user: object }}
 */
function buildAuthResponse(user) {
    const token = jwt.sign(
        { id: user.staff_id, username: user.username, role: user.role, name: user.staff_name },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    return {
        token,
        user: {
            id: user.staff_id,
            name: user.staff_name,
            username: user.username,
            role: user.role,
            designation: user.designation,
            department: user.department
        }
    };
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
/**
 * Traditional username + password login.
 *
 * @body {{ username: string, password: string }}
 * @returns {200} JWT token and user profile on success
 * @returns {400} "Invalid username or password"
 * @returns {500} Server error
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    try {
        const user = await db.get(
            `SELECT s.*, r.roletype_type AS role, d.deptName AS department
             FROM staff_tbl s
             JOIN roletype_tbl r ON s.roletype_id = r.roletype_id
             LEFT JOIN department_tbl d ON s.department_id = d.id
             WHERE s.username = ? AND s.status = 1`,
            [username]
        );

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.json(buildAuthResponse(user));
    } catch (err) {
        console.error('[Auth] Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ── POST /api/auth/google ─────────────────────────────────────────────────────
/**
 * Google OAuth 2.0 sign-in via ID token verification.
 *
 * Accepts either:
 *  - A real Google ID token (verified via google-auth-library)
 *  - A development mock token in the form `mock_token_<role>` which bypasses
 *    Google verification and matches the seeded placeholder email.
 *
 * @body {{ token: string }} Google ID token or mock token string
 * @returns {200} JWT token and user profile on success
 * @returns {400} Token missing
 * @returns {401} Token invalid
 * @returns {403} Email not registered in the system
 */
router.post('/google', async (req, res) => {
    const { token } = req.body;
    const db = getDb();

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        let email = '';

        if (token.startsWith('mock_token_')) {
            // Development bypass — allows grading/testing without a real Google account
            const role = token.replace('mock_token_', '');
            email = `${role}@cervify.org`;
            console.log(`[Auth] Mock OAuth bypass for role: ${role} → email: ${email}`);
        } else {
            // Production path — verify the real Google ID token
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID
            });
            email = ticket.getPayload().email;
        }

        // Look up the staff member by their Google-linked email address
        const user = await db.get(
            `SELECT s.*, r.roletype_type AS role, d.deptName AS department
             FROM staff_tbl s
             JOIN roletype_tbl r ON s.roletype_id = r.roletype_id
             LEFT JOIN department_tbl d ON s.department_id = d.id
             WHERE s.email = ? AND s.status = 1`,
            [email]
        );

        if (!user) {
            return res.status(403).json({
                message: `Google email "${email}" is not registered in Cervify. Ask your administrator to link your email to a staff account.`
            });
        }

        res.json(buildAuthResponse(user));
    } catch (err) {
        console.error('[Auth] Google OAuth error:', err);
        res.status(401).json({ message: 'Invalid or expired Google token' });
    }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's profile from the database.
 * Used by the frontend on page refresh to revalidate the session.
 *
 * @header Authorization: Bearer <token>
 * @returns {200} User profile object
 * @returns {401} Token missing
 * @returns {403} Token invalid
 */
router.get('/me', authenticateToken, async (req, res) => {
    const db = getDb();
    try {
        const user = await db.get(
            `SELECT s.staff_id AS id, s.staff_name AS name, s.username,
                    r.roletype_type AS role, d.deptName AS department, s.designation
             FROM staff_tbl s
             JOIN roletype_tbl r ON s.roletype_id = r.roletype_id
             LEFT JOIN department_tbl d ON s.department_id = d.id
             WHERE s.staff_id = ?`,
            [req.user.id]
        );
        res.json(user);
    } catch (err) {
        console.error('[Auth] /me error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

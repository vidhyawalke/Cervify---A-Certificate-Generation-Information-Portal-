/**
 * @file auth.js  (middleware)
 * @description JWT authentication and role-based authorization middleware.
 *
 * Exports two Express middleware factories:
 *  - `authenticateToken` — verifies a Bearer JWT in the Authorization header
 *    and attaches the decoded payload to `req.user`.
 *  - `requireRoles(roles)` — factory that returns a middleware which rejects
 *    requests whose `req.user.role` is not in the allowed `roles` array.
 *
 * Both rely on the JWT_SECRET constant defined in this file.  In production,
 * override it via the `JWT_SECRET` environment variable.
 */

const jwt = require('jsonwebtoken');

/** Secret used to sign and verify JWT tokens. Override with env var in production. */
const JWT_SECRET = process.env.JWT_SECRET || 'cervify_secret_key_12345';

/**
 * Express middleware — validates the Bearer JWT sent in the Authorization header.
 *
 * On success: attaches `{ id, username, role, name }` to `req.user` and calls `next()`.
 * On failure: responds with 401 (missing token) or 403 (invalid/expired token).
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

/**
 * Express middleware factory — restricts access to users whose role matches one
 * of the values in the `roles` array.
 *
 * Must be used AFTER `authenticateToken` so that `req.user` is populated.
 *
 * @param {string[]} roles - Allowed role names, e.g. `['admin', 'coordinator']`
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.delete('/students/:id', authenticateToken, requireRoles(['admin']), handler);
 */
function requireRoles(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRoles, JWT_SECRET };

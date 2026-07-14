/**
 * @file report.routes.js
 * @description Analytics and summary report routes for Cervify.
 *
 * Endpoint:
 *  GET /api/reports/summary
 *
 * Returns aggregate statistics used by the dashboard analytics view:
 *  - Total counts: activities, students, staff, certificates, validated certificates
 *  - Certificates issued grouped by activity category
 *  - Certificates issued grouped by hosting department
 *
 * All report endpoints require a valid JWT session (any role).
 */

const express = require('express');
const { getDb } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Require a valid session for all report endpoints
router.use(authenticateToken);

// ── GET /api/reports/summary ──────────────────────────────────────────────────
/**
 * Aggregates institutional statistics for the dashboard analytics view.
 *
 * Response shape:
 * @returns {200} {
 *   totals: { activities, students, staff, certificates, validated },
 *   byCategory: [{ category_name, count }],
 *   byDepartment: [{ deptName, count }]
 * }
 * @returns {500} Database error
 */
router.get('/summary', async (_req, res) => {
    const db = getDb();
    try {
        // ── Scalar totals ──────────────────────────────────────────────────────
        const [activities, students, staff, certificates, validated] = await Promise.all([
            db.get('SELECT COUNT(*) AS count FROM activity_tbl'),
            db.get('SELECT COUNT(*) AS count FROM student_tbl'),
            db.get('SELECT COUNT(*) AS count FROM staff_tbl'),
            db.get('SELECT COUNT(*) AS count FROM certificate_tbl'),
            db.get('SELECT COUNT(*) AS count FROM certificate_tbl WHERE status = 2')
        ]);

        // ── Grouped — by activity category ────────────────────────────────────
        const byCategory = await db.all(
            `SELECT c.category_name, COUNT(p.part_id) AS count
             FROM participants_tbl p
             JOIN activity_tbl a   ON p.act_id = a.id
             JOIN category_tbl c   ON a.cat_id = c.category_id
             WHERE p.certificate_id IS NOT NULL
             GROUP BY c.category_id
             ORDER BY count DESC`
        );

        // ── Grouped — by hosting department ───────────────────────────────────
        const byDepartment = await db.all(
            `SELECT d.deptName, COUNT(p.part_id) AS count
             FROM participants_tbl p
             JOIN activity_tbl a    ON p.act_id = a.id
             JOIN department_tbl d  ON a.dept1_id = d.id
             WHERE p.certificate_id IS NOT NULL
             GROUP BY d.id
             ORDER BY count DESC`
        );

        res.json({
            totals: {
                activities: activities.count,
                students: students.count,
                staff: staff.count,
                certificates: certificates.count,
                validated: validated.count
            },
            byCategory,
            byDepartment
        });
    } catch (err) {
        console.error('[Report] Summary:', err);
        res.status(500).json({ message: 'Failed to compile report summary' });
    }
});

module.exports = router;

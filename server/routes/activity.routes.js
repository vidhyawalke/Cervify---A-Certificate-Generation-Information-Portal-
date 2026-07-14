/**
 * @file activity.routes.js
 * @description Activity management routes for Cervify.
 *
 * Endpoints:
 *  GET  /api/activities              — List all activities with joined metadata
 *  POST /api/activities              — Register a new activity (admin, coordinator)
 *  POST /api/activities/:id/upload   — Upload activity documents via multipart form (admin, coordinator)
 *  POST /api/activities/:id/cert-design-json — Save certificate template JSON (admin, coordinator)
 *
 * Activities are the central entity in Cervify — they link departments, agencies,
 * coordinators, participants, documents, and generated certificates together.
 */

const express = require('express');
const { getDb } = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// All activity routes require a valid session
router.use(authenticateToken);

// ── GET /api/activities ───────────────────────────────────────────────────────
/**
 * Returns all activities with human-readable names for all foreign-key
 * references (department names, category, agency, coordinator) and the
 * associated document paths from `activity_doc_tbl`.
 *
 * @returns {200} Array of enriched activity objects
 */
router.get('/', async (_req, res) => {
    const db = getDb();
    try {
        const rows = await db.all(
            `SELECT
                a.*,
                d1.deptName  AS department1,
                d2.deptName  AS department2,
                c.category_name AS category,
                ag.agencyName   AS agency,
                s.staff_name    AS coordinator,
                doc.activity_notice,
                doc.activity_brochure,
                doc.activity_report,
                doc.activity_attendance,
                doc.activity_cert_design
             FROM activity_tbl a
             LEFT JOIN department_tbl d1  ON a.dept1_id      = d1.id
             LEFT JOIN department_tbl d2  ON a.dept2_id      = d2.id
             LEFT JOIN category_tbl c     ON a.cat_id        = c.category_id
             LEFT JOIN agency_tbl ag      ON a.agency_id     = ag.id
             LEFT JOIN staff_tbl s        ON a.coordinator_id = s.staff_id
             LEFT JOIN activity_doc_tbl doc ON a.id          = doc.act_id
             ORDER BY a.f_date DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('[Activity] GET all:', err);
        res.status(500).json({ message: 'Failed to fetch activities' });
    }
});

// ── POST /api/activities ──────────────────────────────────────────────────────
/**
 * Registers a new activity and creates an empty document record for it.
 *
 * @body {{
 *   act_name: string, f_date: string, t_date: string,
 *   dept1_id?: number, dept2_id?: number, cat_id?: number,
 *   agency_id?: number, coordinator_id?: number, tag?: string
 * }}
 * @returns {201} New activity id and name
 */
router.post('/', requireRoles(['admin', 'coordinator']), async (req, res) => {
    const {
        act_name, f_date, t_date,
        dept1_id, dept2_id, cat_id,
        agency_id, coordinator_id, tag
    } = req.body;
    const db = getDb();

    try {
        const result = await db.run(
            `INSERT INTO activity_tbl
             (act_name, f_date, t_date, dept1_id, dept2_id, cat_id, agency_id, coordinator_id, tag, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                act_name, f_date, t_date,
                dept1_id || null, dept2_id || null, cat_id || null,
                agency_id || null, coordinator_id || req.user.id, tag || ''
            ]
        );
        const actId = result.lastID;

        // Initialize an empty document record so uploads can UPDATE instead of INSERT
        await db.run('INSERT INTO activity_doc_tbl (act_id, status) VALUES (?, 1)', [actId]);

        res.status(201).json({ id: actId, act_name, status: 1 });
    } catch (err) {
        console.error('[Activity] POST create:', err);
        res.status(500).json({ message: 'Failed to register activity' });
    }
});

// ── POST /api/activities/:id/upload ──────────────────────────────────────────
/**
 * Handles multipart document uploads for an activity.
 *
 * Accepted fields (all optional — only fields with files are updated):
 *  - notice       → activity_notice path
 *  - brochure     → activity_brochure path
 *  - report       → activity_report path
 *  - attendance   → activity_attendance path
 *  - certDesign   → activity_cert_design path (background image)
 *
 * @param {string} req.params.id - Activity ID
 */
router.post(
    '/:id/upload',
    requireRoles(['admin', 'coordinator']),
    upload.fields([
        { name: 'notice',     maxCount: 1 },
        { name: 'brochure',   maxCount: 1 },
        { name: 'report',     maxCount: 1 },
        { name: 'attendance', maxCount: 1 },
        { name: 'certDesign', maxCount: 1 }
    ]),
    async (req, res) => {
        const actId = req.params.id;
        const files = req.files;
        const db = getDb();

        try {
            const updates = [];
            const values = [];

            if (files.notice)     { updates.push('activity_notice = ?');     values.push(`/uploads/${files.notice[0].filename}`);     }
            if (files.brochure)   { updates.push('activity_brochure = ?');   values.push(`/uploads/${files.brochure[0].filename}`);   }
            if (files.report)     { updates.push('activity_report = ?');     values.push(`/uploads/${files.report[0].filename}`);     }
            if (files.attendance) { updates.push('activity_attendance = ?'); values.push(`/uploads/${files.attendance[0].filename}`); }
            if (files.certDesign) { updates.push('activity_cert_design = ?');values.push(`/uploads/${files.certDesign[0].filename}`); }

            if (updates.length > 0) {
                values.push(actId);
                await db.run(
                    `UPDATE activity_doc_tbl SET ${updates.join(', ')} WHERE act_id = ?`,
                    values
                );
            }
            res.json({ message: 'Documents uploaded successfully' });
        } catch (err) {
            console.error('[Activity] Upload docs:', err);
            res.status(500).json({ message: 'Failed to upload documents' });
        }
    }
);

// ── POST /api/activities/:id/cert-design-json ─────────────────────────────────
/**
 * Saves a certificate template configuration (as a JSON string) to the
 * `activity_cert_design` column of `activity_doc_tbl`.
 *
 * The JSON is an object with keys: title, subtext, border, bg, font, sig1, sig2.
 *
 * @body {{ designJson: object }}
 */
router.post('/:id/cert-design-json', requireRoles(['admin', 'coordinator']), async (req, res) => {
    const { designJson } = req.body;
    try {
        await getDb().run(
            'UPDATE activity_doc_tbl SET activity_cert_design = ? WHERE act_id = ?',
            [JSON.stringify(designJson), req.params.id]
        );
        res.json({ message: 'Certificate design configuration saved' });
    } catch (err) {
        console.error('[Activity] Save cert-design-json:', err);
        res.status(500).json({ message: 'Failed to save design configuration' });
    }
});

module.exports = router;

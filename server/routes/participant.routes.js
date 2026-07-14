/**
 * @file participant.routes.js
 * @description Participant selection routes for Cervify activities.
 *
 * Endpoints:
 *  GET  /api/activities/:id/participants
 *       Returns current participants for the activity (enriched with name/details)
 *       AND candidate lists (all students, staff, visitors) for the selection UI.
 *
 *  POST /api/activities/:id/participants
 *       Synchronises the participant selection — removes non-certified participants
 *       and inserts newly selected ones.  Blocked if the activity is frozen.
 *
 * Participant types supported: 'student', 'staff', 'visitor'
 * Each entry in `participants_tbl` stores the type and the actual_id which
 * refers to the primary key of the corresponding directory table.
 */

const express = require('express');
const { getDb } = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // inherit :id from parent router

// All participant routes require a valid session
router.use(authenticateToken);

// ── GET /api/activities/:id/participants ──────────────────────────────────────
/**
 * Returns two things:
 *  1. `participants` — current enrolled participants for this activity, enriched
 *     with name/roll/course details and their certificate info (if any).
 *  2. `candidates` — complete lists of students, staff, and visitors that can
 *     be selected for participation.
 *
 * @param {string} req.params.id - Activity ID
 * @returns {200} { participants: [], candidates: { students, staff, visitors } }
 */
router.get('/', async (req, res) => {
    const actId = req.params.id;
    const db = getDb();

    try {
        // Fetch participant rows joined with certificate info
        const participants = await db.all(
            `SELECT p.*, c.certificate_no, c.certificate_type, c.status AS cert_status
             FROM participants_tbl p
             LEFT JOIN certificate_tbl c ON p.certificate_id = c.certificate_id
             WHERE p.act_id = ?`,
            [actId]
        );

        // Enrich each participant with their human-readable details
        for (const part of participants) {
            if (part.part_type === 'student') {
                part.details = await db.get(
                    'SELECT student_name AS name, student_roll_no AS roll, student_course AS course FROM student_tbl WHERE stud_id = ?',
                    [part.actual_id]
                );
            } else if (part.part_type === 'staff') {
                part.details = await db.get(
                    'SELECT staff_name AS name, designation FROM staff_tbl WHERE staff_id = ?',
                    [part.actual_id]
                );
            } else if (part.part_type === 'visitor') {
                part.details = await db.get(
                    'SELECT visitor_name AS name, visitor_organization AS org, visitor_designation AS desig FROM visitor_tbl WHERE visitor_id = ?',
                    [part.actual_id]
                );
            }
        }

        // Fetch candidate lists for the participant-selector UI
        const [students, staff, visitors] = await Promise.all([
            db.all('SELECT stud_id AS id, student_name AS name, student_course AS course, student_roll_no AS roll FROM student_tbl WHERE status = 1'),
            db.all('SELECT staff_id AS id, staff_name AS name, designation FROM staff_tbl WHERE status = 1'),
            db.all('SELECT visitor_id AS id, visitor_name AS name, visitor_organization AS org FROM visitor_tbl WHERE status = 1')
        ]);

        res.json({ participants, candidates: { students, staff, visitors } });
    } catch (err) {
        console.error('[Participants] GET:', err);
        res.status(500).json({ message: 'Failed to fetch participants' });
    }
});

// ── POST /api/activities/:id/participants ─────────────────────────────────────
/**
 * Synchronises participant selection for an activity.
 *
 * Algorithm:
 *  1. Rejects update if activity status = 2 (frozen).
 *  2. Deletes all participants WITHOUT a certificate (i.e. pending selections).
 *  3. Inserts any new selections not already present.
 *
 * @body {{ selections: Array<{ type: 'student'|'staff'|'visitor', id: number }> }}
 * @param {string} req.params.id - Activity ID
 * @returns {200} Success message
 * @returns {400} Frozen activity
 */
router.post('/', requireRoles(['admin', 'coordinator']), async (req, res) => {
    const actId = req.params.id;
    const { selections } = req.body;
    const db = getDb();

    try {
        // Guard: frozen activities cannot be edited
        const activity = await db.get('SELECT status FROM activity_tbl WHERE id = ?', [actId]);
        if (activity?.status === 2) {
            return res.status(400).json({ message: 'Cannot edit participants. Activity records are frozen.' });
        }

        // Remove old non-certified selections (keep certified ones intact)
        await db.run('DELETE FROM participants_tbl WHERE act_id = ? AND certificate_id IS NULL', [actId]);

        // Insert new selections (skip duplicates already in db from certificates)
        for (const item of selections) {
            const existing = await db.get(
                'SELECT 1 FROM participants_tbl WHERE act_id = ? AND part_type = ? AND actual_id = ?',
                [actId, item.type, item.id]
            );
            if (!existing) {
                await db.run(
                    'INSERT INTO participants_tbl (act_id, part_type, actual_id, status) VALUES (?, ?, ?, 1)',
                    [actId, item.type, item.id]
                );
            }
        }

        res.json({ message: 'Participant selection saved successfully' });
    } catch (err) {
        console.error('[Participants] POST:', err);
        res.status(500).json({ message: 'Failed to save participants' });
    }
});

module.exports = router;

/**
 * @file certificate.routes.js
 * @description Certificate lifecycle management routes for Cervify.
 *
 * Endpoints:
 *  POST /api/certificates/generate  — Bulk-generate unique certificate numbers for
 *                                     all participants of a given activity (admin only)
 *  POST /api/certificates/validate  — Principal approves or rejects all certificates
 *                                     for a given activity (principal only)
 *  POST /api/certificates/freeze    — Locks an activity record permanently (admin only)
 *
 * Certificate status lifecycle:
 *   1 → Generated (issued by admin)
 *   2 → Validated (approved by principal)
 *   0 → Revoked/inactive
 *
 * Certificate number format: CERV-<YYMM>-<6-digit random>
 * e.g. CERV-202223-748392
 */

const express = require('express');
const { getDb } = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

// All certificate management routes require authentication
router.use(authenticateToken);

// ── POST /api/certificates/generate ──────────────────────────────────────────
/**
 * Bulk-generates unique certificate records for all uncertified participants
 * of the specified activity.
 *
 * Each certificate gets a unique certificate number in the format:
 *   CERV-<YYMM>-<6digitRandom>
 * and is linked to the participant row via `participants_tbl.certificate_id`.
 *
 * @body {{ act_id: number, template_type: string }}
 *   template_type: 'Participation' | 'Winner' | 'Runner Up' | 'Coordinator'
 * @returns {200} Success message with count of certificates generated
 * @returns {400} No pending participants, or activity not found
 */
router.post('/generate', requireRoles(['admin']), async (req, res) => {
    const { act_id, template_type } = req.body;
    const db = getDb();

    try {
        const activity = await db.get('SELECT * FROM activity_tbl WHERE id = ?', [act_id]);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Fetch participants who do not yet have a certificate assigned
        const pending = await db.all(
            'SELECT * FROM participants_tbl WHERE act_id = ? AND certificate_id IS NULL',
            [act_id]
        );

        if (pending.length === 0) {
            return res.status(400).json({ message: 'No pending participants need certificate generation.' });
        }

        // Generate one certificate per pending participant
        for (const part of pending) {
            const yearCode = '202223'; // Could derive from activity year in future
            const randomSuffix = Math.floor(100000 + Math.random() * 900000);
            const certNo = `CERV-${yearCode}-${randomSuffix}`;

            // Insert certificate record
            const certResult = await db.run(
                'INSERT INTO certificate_tbl (certificate_no, certificate_type, status) VALUES (?, ?, 1)',
                [certNo, template_type]
            );

            // Link certificate back to the participant
            await db.run(
                'UPDATE participants_tbl SET certificate_id = ? WHERE part_id = ?',
                [certResult.lastID, part.part_id]
            );
        }

        res.json({ message: `Successfully generated ${pending.length} certificate(s) for the activity.` });
    } catch (err) {
        console.error('[Certificate] Generate:', err);
        res.status(500).json({ message: 'Failed to generate certificates' });
    }
});

// ── POST /api/certificates/validate ──────────────────────────────────────────
/**
 * Principal approves or revokes all certificates belonging to an activity.
 *
 * When approved (`approve: true`):
 *  - `certificate_tbl.status` → 2 (validated)
 *  - `participants_tbl.status` → 2 (approved)
 *
 * When revoked (`approve: false`):
 *  - Both statuses → 1 (reverting to generated/pending)
 *
 * @body {{ act_id: number, approve: boolean }}
 * @returns {200} Success message
 * @returns {400} No certificates found for the activity
 */
router.post('/validate', requireRoles(['principal']), async (req, res) => {
    const { act_id, approve } = req.body;
    const db = getDb();

    try {
        // Fetch all certificate IDs linked to this activity's participants
        const linked = await db.all(
            'SELECT certificate_id FROM participants_tbl WHERE act_id = ? AND certificate_id IS NOT NULL',
            [act_id]
        );

        if (linked.length === 0) {
            return res.status(400).json({ message: 'No certificates found for this activity.' });
        }

        const newStatus = approve ? 2 : 1;
        const certIds = linked.map(p => p.certificate_id);

        // Bulk-update certificate statuses
        await db.run(
            `UPDATE certificate_tbl SET status = ? WHERE certificate_id IN (${certIds.join(',')})`,
            [newStatus]
        );

        // Mirror status to participants table
        await db.run(
            'UPDATE participants_tbl SET status = ? WHERE act_id = ? AND certificate_id IS NOT NULL',
            [newStatus, act_id]
        );

        res.json({
            message: approve
                ? `${certIds.length} certificate(s) validated and approved successfully.`
                : 'Certificate validation status has been reset to pending.'
        });
    } catch (err) {
        console.error('[Certificate] Validate:', err);
        res.status(500).json({ message: 'Failed to update certificate status' });
    }
});

// ── POST /api/certificates/freeze ────────────────────────────────────────────
/**
 * Freezes an activity's records permanently by setting its status to 2.
 *
 * Once frozen:
 *  - Coordinators can no longer modify participant selections or upload documents.
 *  - The activity appears as "Locked" in the UI with no edit controls.
 *
 * This action is IRREVERSIBLE through the UI (only direct DB intervention can undo it).
 *
 * @body {{ act_id: number }}
 * @returns {200} Success message
 */
router.post('/freeze', requireRoles(['admin']), async (req, res) => {
    const { act_id } = req.body;
    try {
        await getDb().run('UPDATE activity_tbl SET status = 2 WHERE id = ?', [act_id]);
        res.json({ message: 'Activity records have been permanently frozen.' });
    } catch (err) {
        console.error('[Certificate] Freeze:', err);
        res.status(500).json({ message: 'Failed to freeze activity records' });
    }
});

module.exports = router;

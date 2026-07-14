/**
 * @file verify.routes.js
 * @description Public certificate verification route for Cervify.
 *
 * Endpoint:
 *  GET /api/verify/:certNo  — Public (no authentication required)
 *
 * Allows anyone to verify the authenticity of a Cervify-issued certificate by
 * providing the certificate number (e.g. CERV-202223-748392).
 *
 * Returns enriched certificate data including:
 *  - Certificate number and template type
 *  - Validation status (generated vs. principal-approved)
 *  - Recipient name and identifying details
 *  - Associated activity name, date range, category, and agency
 */

const express = require('express');
const { getDb } = require('../config/db');

const router = express.Router();

// ── GET /api/verify/:certNo ───────────────────────────────────────────────────
/**
 * Public certificate authenticity lookup — no JWT required.
 *
 * Looks up the certificate by its unique certificate number, then enriches
 * the result with the participant's details (student / staff / visitor).
 *
 * @param {string} req.params.certNo - Certificate number to look up
 * @returns {200} {
 *   valid: true,
 *   status: 1|2,
 *   certificate_no: string,
 *   certificate_type: string,
 *   recipient_name: string,
 *   recipient_info: string,
 *   activity_name: string,
 *   activity_date: string,
 *   category: string,
 *   agency: string
 * }
 * @returns {404} { valid: false, message }  — Certificate not found
 * @returns {500} Database error
 */
router.get('/:certNo', async (req, res) => {
    const { certNo } = req.params;
    const db = getDb();

    try {
        // Fetch certificate + activity details in a single query
        const cert = await db.get(
            `SELECT
                c.certificate_no, c.certificate_type, c.status AS cert_status,
                a.act_name, a.f_date, a.t_date,
                p.part_type, p.actual_id,
                cat.category_name AS category,
                ag.agencyName AS agency
             FROM certificate_tbl c
             JOIN participants_tbl p ON c.certificate_id = p.certificate_id
             JOIN activity_tbl a     ON p.act_id = a.id
             LEFT JOIN category_tbl cat ON a.cat_id = cat.category_id
             LEFT JOIN agency_tbl ag    ON a.agency_id = ag.id
             WHERE c.certificate_no = ?`,
            [certNo]
        );

        if (!cert) {
            return res.status(404).json({
                valid: false,
                message: 'Certificate not found. Please double-check the certificate number and try again.'
            });
        }

        // ── Resolve recipient details based on participant type ────────────────
        let recipientName = 'Unknown';
        let recipientInfo = '';

        if (cert.part_type === 'student') {
            const info = await db.get(
                'SELECT student_name, student_roll_no, student_course, student_academic_year FROM student_tbl WHERE stud_id = ?',
                [cert.actual_id]
            );
            if (info) {
                recipientName = info.student_name;
                recipientInfo = `Roll No: ${info.student_roll_no} | Course: ${info.student_course} | Year: ${info.student_academic_year}`;
            }
        } else if (cert.part_type === 'staff') {
            const info = await db.get(
                'SELECT staff_name, designation FROM staff_tbl WHERE staff_id = ?',
                [cert.actual_id]
            );
            if (info) {
                recipientName = info.staff_name;
                recipientInfo = `Staff — ${info.designation}`;
            }
        } else if (cert.part_type === 'visitor') {
            const info = await db.get(
                'SELECT visitor_name, visitor_organization, visitor_designation FROM visitor_tbl WHERE visitor_id = ?',
                [cert.actual_id]
            );
            if (info) {
                recipientName = info.visitor_name;
                recipientInfo = `External Visitor — ${info.visitor_designation} @ ${info.visitor_organization}`;
            }
        }

        res.json({
            valid: true,
            status: cert.cert_status,          // 1 = generated, 2 = validated by principal
            certificate_no: cert.certificate_no,
            certificate_type: cert.certificate_type,
            recipient_name: recipientName,
            recipient_info: recipientInfo,
            activity_name: cert.act_name,
            activity_date: `${cert.f_date} to ${cert.t_date}`,
            category: cert.category || 'N/A',
            agency: cert.agency || 'N/A'
        });
    } catch (err) {
        console.error('[Verify] Certificate lookup:', err);
        res.status(500).json({ message: 'Certificate verification lookup failed' });
    }
});

module.exports = router;

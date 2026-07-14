/**
 * @file master.routes.js
 * @description Master data management routes for Cervify.
 *
 * Covers the institutional reference tables that seed all dropdowns and
 * selection lists throughout the application:
 *
 *  Departments  GET /api/master/departments         (all roles)
 *               POST /api/master/departments        (admin only)
 *               DELETE /api/master/departments/:id  (admin only)
 *
 *  Agencies     GET /api/master/agencies            (all roles)
 *               POST /api/master/agencies           (admin, coordinator)
 *               DELETE /api/master/agencies/:id     (admin, coordinator)
 *
 *  Categories   GET /api/master/categories          (all roles)
 *               POST /api/master/categories         (admin only)
 *               DELETE /api/master/categories/:id   (admin only)
 *
 *  Students     GET /api/master/students            (all roles)
 *               POST /api/master/students           (admin only)
 *               DELETE /api/master/students/:id     (admin only)
 *
 *  Staff        GET /api/master/staff               (all roles)
 *               POST /api/master/staff              (admin only)
 *               DELETE /api/master/staff/:id        (admin only)
 *
 *  Visitors     GET /api/master/visitors            (all roles)
 *               POST /api/master/visitors           (admin, coordinator)
 *               DELETE /api/master/visitors/:id     (admin, coordinator)
 *
 *  Roles        GET /api/master/roles               (admin only — for dropdowns)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { authenticateToken, requireRoles } = require('../middleware/auth');

const router = express.Router();

// All master routes require at least a valid JWT
router.use(authenticateToken);

// ════════════════════════════════════════════════════════
//  DEPARTMENTS
// ════════════════════════════════════════════════════════

/** GET /api/master/departments — Returns all department records. */
router.get('/departments', async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM department_tbl ORDER BY deptName');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET departments:', err);
        res.status(500).json({ message: 'Failed to fetch departments' });
    }
});

/**
 * POST /api/master/departments — Adds a new academic department.
 * @body {{ degree: string, deptName: string }}
 */
router.post('/departments', requireRoles(['admin']), async (req, res) => {
    const { degree, deptName } = req.body;
    try {
        const result = await getDb().run(
            'INSERT INTO department_tbl (degree, deptName, status) VALUES (?, ?, 1)',
            [degree, deptName]
        );
        res.status(201).json({ id: result.lastID, degree, deptName, status: 1 });
    } catch (err) {
        console.error('[Master] POST department:', err);
        res.status(500).json({ message: 'Failed to add department' });
    }
});

/** DELETE /api/master/departments/:id — Permanently removes a department record. */
router.delete('/departments/:id', requireRoles(['admin']), async (req, res) => {
    try {
        await getDb().run('DELETE FROM department_tbl WHERE id = ?', [req.params.id]);
        res.json({ message: 'Department deleted' });
    } catch (err) {
        console.error('[Master] DELETE department:', err);
        res.status(500).json({ message: 'Failed to delete department' });
    }
});

// ════════════════════════════════════════════════════════
//  AGENCIES
// ════════════════════════════════════════════════════════

/** GET /api/master/agencies — Returns all agency records. */
router.get('/agencies', async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM agency_tbl ORDER BY agencyName');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET agencies:', err);
        res.status(500).json({ message: 'Failed to fetch agencies' });
    }
});

/**
 * POST /api/master/agencies — Adds a new collaborating agency.
 * @body {{ agencyName: string, agencyDesc?: string }}
 */
router.post('/agencies', requireRoles(['admin', 'coordinator']), async (req, res) => {
    const { agencyName, agencyDesc } = req.body;
    try {
        const result = await getDb().run(
            'INSERT INTO agency_tbl (agencyName, agencyDesc, status) VALUES (?, ?, 1)',
            [agencyName, agencyDesc || '']
        );
        res.status(201).json({ id: result.lastID, agencyName, agencyDesc, status: 1 });
    } catch (err) {
        console.error('[Master] POST agency:', err);
        res.status(500).json({ message: 'Failed to add agency' });
    }
});

/** DELETE /api/master/agencies/:id — Removes an agency record. */
router.delete('/agencies/:id', requireRoles(['admin', 'coordinator']), async (req, res) => {
    try {
        await getDb().run('DELETE FROM agency_tbl WHERE id = ?', [req.params.id]);
        res.json({ message: 'Agency deleted' });
    } catch (err) {
        console.error('[Master] DELETE agency:', err);
        res.status(500).json({ message: 'Failed to delete agency' });
    }
});

// ════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════

/** GET /api/master/categories — Returns all activity category records. */
router.get('/categories', async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM category_tbl ORDER BY category_name');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET categories:', err);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

/**
 * POST /api/master/categories — Adds a new activity category.
 * @body {{ category_name: string }}
 */
router.post('/categories', requireRoles(['admin']), async (req, res) => {
    const { category_name } = req.body;
    try {
        const result = await getDb().run(
            'INSERT INTO category_tbl (category_name, status) VALUES (?, 1)',
            [category_name]
        );
        res.status(201).json({ category_id: result.lastID, category_name, status: 1 });
    } catch (err) {
        console.error('[Master] POST category:', err);
        res.status(500).json({ message: 'Failed to add category' });
    }
});

/** DELETE /api/master/categories/:id — Removes a category record. */
router.delete('/categories/:id', requireRoles(['admin']), async (req, res) => {
    try {
        await getDb().run('DELETE FROM category_tbl WHERE category_id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('[Master] DELETE category:', err);
        res.status(500).json({ message: 'Failed to delete category' });
    }
});

// ════════════════════════════════════════════════════════
//  STUDENTS
// ════════════════════════════════════════════════════════

/** GET /api/master/students — Returns all student records. */
router.get('/students', async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM student_tbl ORDER BY student_roll_no');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET students:', err);
        res.status(500).json({ message: 'Failed to fetch students' });
    }
});

/**
 * POST /api/master/students — Adds a new student record.
 * @body {{ student_name, student_roll_no, student_class, student_course, student_academic_year }}
 */
router.post('/students', requireRoles(['admin']), async (req, res) => {
    const { student_name, student_roll_no, student_class, student_course, student_academic_year } = req.body;
    try {
        const result = await getDb().run(
            `INSERT INTO student_tbl
             (student_name, student_roll_no, student_class, student_course, student_academic_year, status)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [student_name, Number(student_roll_no), student_class, student_course, student_academic_year]
        );
        res.status(201).json({ stud_id: result.lastID, student_name, student_roll_no, status: 1 });
    } catch (err) {
        console.error('[Master] POST student:', err);
        res.status(500).json({ message: 'Failed to add student' });
    }
});

/** DELETE /api/master/students/:id — Removes a student record. */
router.delete('/students/:id', requireRoles(['admin']), async (req, res) => {
    try {
        await getDb().run('DELETE FROM student_tbl WHERE stud_id = ?', [req.params.id]);
        res.json({ message: 'Student deleted' });
    } catch (err) {
        console.error('[Master] DELETE student:', err);
        res.status(500).json({ message: 'Failed to delete student' });
    }
});

// ════════════════════════════════════════════════════════
//  STAFF / USERS
// ════════════════════════════════════════════════════════

/** GET /api/master/staff — Returns all staff accounts with role and department names. */
router.get('/staff', async (_req, res) => {
    try {
        const rows = await getDb().all(
            `SELECT s.staff_id, s.staff_name, s.username, s.email, s.designation,
                    s.roletype_id, s.department_id, s.status,
                    r.roletype_type AS role, d.deptName AS department
             FROM staff_tbl s
             JOIN roletype_tbl r ON s.roletype_id = r.roletype_id
             LEFT JOIN department_tbl d ON s.department_id = d.id
             ORDER BY s.staff_name`
        );
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET staff:', err);
        res.status(500).json({ message: 'Failed to fetch staff' });
    }
});

/**
 * POST /api/master/staff — Creates a new staff user account.
 * Passwords are hashed with bcrypt (cost factor 10) before storage.
 * @body {{ staff_name, username, password, designation, roletype_id, department_id }}
 */
router.post('/staff', requireRoles(['admin']), async (req, res) => {
    const { staff_name, username, password, designation, roletype_id, department_id } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await getDb().run(
            `INSERT INTO staff_tbl
             (staff_name, username, password, designation, roletype_id, department_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [staff_name, username, hashedPassword, designation, roletype_id, department_id]
        );
        res.status(201).json({ staff_id: result.lastID, staff_name, username, status: 1 });
    } catch (err) {
        console.error('[Master] POST staff:', err);
        res.status(500).json({ message: 'Failed to create staff account. Username may already be taken.' });
    }
});

/**
 * DELETE /api/master/staff/:id — Removes a staff account.
 * Prevents self-deletion — an admin cannot delete their own account.
 */
router.delete('/staff/:id', requireRoles(['admin']), async (req, res) => {
    if (String(req.params.id) === String(req.user.id)) {
        return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    }
    try {
        await getDb().run('DELETE FROM staff_tbl WHERE staff_id = ?', [req.params.id]);
        res.json({ message: 'Staff account deleted' });
    } catch (err) {
        console.error('[Master] DELETE staff:', err);
        res.status(500).json({ message: 'Failed to delete staff account' });
    }
});

// ════════════════════════════════════════════════════════
//  VISITORS
// ════════════════════════════════════════════════════════

/** GET /api/master/visitors — Returns all external visitor records. */
router.get('/visitors', async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM visitor_tbl ORDER BY visitor_name');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET visitors:', err);
        res.status(500).json({ message: 'Failed to fetch visitors' });
    }
});

/**
 * POST /api/master/visitors — Logs a new external visitor.
 * @body {{ visitor_name, visitor_organization, visitor_designation }}
 */
router.post('/visitors', requireRoles(['admin', 'coordinator']), async (req, res) => {
    const { visitor_name, visitor_organization, visitor_designation } = req.body;
    try {
        const result = await getDb().run(
            'INSERT INTO visitor_tbl (visitor_name, visitor_organization, visitor_designation, status) VALUES (?, ?, ?, 1)',
            [visitor_name, visitor_organization, visitor_designation]
        );
        res.status(201).json({ visitor_id: result.lastID, visitor_name, status: 1 });
    } catch (err) {
        console.error('[Master] POST visitor:', err);
        res.status(500).json({ message: 'Failed to log visitor' });
    }
});

/** DELETE /api/master/visitors/:id — Removes a visitor log entry. */
router.delete('/visitors/:id', requireRoles(['admin', 'coordinator']), async (req, res) => {
    try {
        await getDb().run('DELETE FROM visitor_tbl WHERE visitor_id = ?', [req.params.id]);
        res.json({ message: 'Visitor record deleted' });
    } catch (err) {
        console.error('[Master] DELETE visitor:', err);
        res.status(500).json({ message: 'Failed to delete visitor' });
    }
});

// ════════════════════════════════════════════════════════
//  ROLE TYPES (reference — for dropdowns)
// ════════════════════════════════════════════════════════

/** GET /api/master/roles — Returns all system role types. */
router.get('/roles', requireRoles(['admin']), async (_req, res) => {
    try {
        const rows = await getDb().all('SELECT * FROM roletype_tbl');
        res.json(rows);
    } catch (err) {
        console.error('[Master] GET roles:', err);
        res.status(500).json({ message: 'Failed to fetch roles' });
    }
});

module.exports = router;

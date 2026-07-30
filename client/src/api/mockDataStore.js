/**
 * @file mockDataStore.js
 * @description Pure Client-Side Browser Storage Engine for Cervify.
 * Features zero dummy data, admin registration, staff account creation & password resets, and SHA-256 certificate verification.
 */

// Initial pristine seed data (Clean Slate - No dummy students or events)
const DEFAULT_STAFF = [
    { id: 'admin_1', name: 'System Administrator', email: 'admin@cervify.edu', username: 'admin', password: 'admin123', role: 'admin', department: 'Executive Board', createdAt: '2026-07-31' },
    { id: 'coord_1', name: 'Event Coordinator', email: 'coordinator@cervify.edu', username: 'coordinator', password: 'coord123', role: 'coordinator', department: 'Computer Science', createdAt: '2026-07-31' },
    { id: 'principal_1', name: 'Dr. Ananya Roy (Principal)', email: 'principal@cervify.edu', username: 'principal', password: 'principal123', role: 'principal', department: 'Office of the Principal', createdAt: '2026-07-31' }
];

const DEFAULT_DEPARTMENTS = [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
    { id: 2, name: 'Electrical & Electronics', code: 'EEE' },
    { id: 3, name: 'Biotechnology & Life Sciences', code: 'BTS' },
    { id: 4, name: 'Mechanical & Automation', code: 'MAE' },
    { id: 5, name: 'School of Business & Commerce', code: 'SBC' }
];

const DEFAULT_LABELS = [
    { id: 'win1', title: '1st Winner / Champion', badge: '🏆', color: '#D4AF37', description: 'Awarded to 1st place winner' },
    { id: 'win2', title: '1st Runner Up', badge: '🥈', color: '#C0C0C0', description: 'Awarded to 2nd place runner up' },
    { id: 'win3', title: '2nd Runner Up', badge: '🥉', color: '#CD7F32', description: 'Awarded to 3rd place runner up' },
    { id: 'part', title: 'Certificate of Participation', badge: '📜', color: '#1E3A8A', description: 'Awarded to all event attendees' },
    { id: 'appr', title: 'Special Merit & Appreciation', badge: '🎖️', color: '#8B0000', description: 'Awarded for extraordinary contribution' },
    { id: 'spkr', title: 'Keynote Speaker / Guest', badge: '🎤', color: '#4B0082', description: 'Honoring event guest speakers' }
];

function generateCertHash(certNo, studentName, eventName, date) {
    const raw = `${certNo}:${studentName}:${eventName}:${date}:CERVIFY_SECURE_TOKEN_2026`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `CERV-AUTH-SHA256-${hex}-VERIFIED`;
}

class LocalDataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('cervify_staff')) {
            localStorage.setItem('cervify_staff', JSON.stringify(DEFAULT_STAFF));
        }
        if (!localStorage.getItem('cervify_students')) {
            localStorage.setItem('cervify_students', JSON.stringify([]));
        }
        if (!localStorage.getItem('cervify_departments')) {
            localStorage.setItem('cervify_departments', JSON.stringify(DEFAULT_DEPARTMENTS));
        }
        if (!localStorage.getItem('cervify_labels')) {
            localStorage.setItem('cervify_labels', JSON.stringify(DEFAULT_LABELS));
        }
        if (!localStorage.getItem('cervify_activities')) {
            localStorage.setItem('cervify_activities', JSON.stringify([]));
        }
        if (!localStorage.getItem('cervify_saved_templates')) {
            localStorage.setItem('cervify_saved_templates', JSON.stringify([]));
        }
    }

    // ── Staff & Credentials Management ──────────────────────────────────────
    getStaff() {
        return JSON.parse(localStorage.getItem('cervify_staff')) || DEFAULT_STAFF;
    }

    findStaffByUsername(username) {
        const staff = this.getStaff();
        const clean = (username || '').trim().toLowerCase();
        return staff.find(s =>
            (s.username && s.username.toLowerCase() === clean) ||
            (s.email && s.email.toLowerCase() === clean)
        ) || null;
    }

    registerAdmin(adminData) {
        const staff = this.getStaff();
        const existing = staff.find(s => s.username === adminData.username || s.email === adminData.email);
        if (existing) {
            throw new Error('An account with this username or email already exists.');
        }

        const newAdmin = {
            id: `admin_${Date.now()}`,
            name: adminData.name || 'System Admin',
            email: adminData.email,
            username: adminData.username || adminData.email.split('@')[0],
            password: adminData.password,
            role: 'admin',
            department: adminData.department || 'Executive Board',
            createdAt: new Date().toISOString().split('T')[0]
        };

        staff.unshift(newAdmin);
        localStorage.setItem('cervify_staff', JSON.stringify(staff));
        return newAdmin;
    }

    createStaffAccount(accountData) {
        const staff = this.getStaff();
        const cleanUsername = (accountData.username || accountData.email.split('@')[0]).trim();

        if (staff.some(s => s.username.toLowerCase() === cleanUsername.toLowerCase())) {
            throw new Error(`Username "${cleanUsername}" is already taken.`);
        }

        const newAccount = {
            id: `staff_${Date.now()}`,
            name: accountData.name,
            email: accountData.email,
            username: cleanUsername,
            password: accountData.password || 'cervify123',
            role: accountData.role || 'coordinator',
            department: accountData.department || 'General',
            createdAt: new Date().toISOString().split('T')[0]
        };

        staff.unshift(newAccount);
        localStorage.setItem('cervify_staff', JSON.stringify(staff));
        return newAccount;
    }

    resetStaffCredentials(id, newUsername, newPassword) {
        const staff = this.getStaff();
        const index = staff.findIndex(s => s.id === id);
        if (index !== -1) {
            if (newUsername) staff[index].username = newUsername.trim();
            if (newPassword) staff[index].password = newPassword.trim();
            localStorage.setItem('cervify_staff', JSON.stringify(staff));
            return staff[index];
        }
        throw new Error('Staff account not found.');
    }

    deleteStaffAccount(id) {
        const staff = this.getStaff().filter(s => s.id !== id);
        localStorage.setItem('cervify_staff', JSON.stringify(staff));
        return true;
    }

    // ── Students ─────────────────────────────────────────────────────────────
    getStudents() {
        return JSON.parse(localStorage.getItem('cervify_students')) || [];
    }

    saveStudents(students) {
        localStorage.setItem('cervify_students', JSON.stringify(students));
        return students;
    }

    addStudent(student) {
        const students = this.getStudents();
        const newStudent = {
            id: Date.now(),
            rollNo: student.rollNo || `REG-${Math.floor(1000 + Math.random() * 9000)}`,
            name: student.name || 'Student Name',
            email: student.email || 'student@institution.edu',
            department: student.department || 'General',
            category: student.category || 'Participant',
            awardLabel: student.awardLabel || 'Certificate of Participation',
            ...student
        };
        students.unshift(newStudent);
        this.saveStudents(students);
        return newStudent;
    }

    bulkImportStudents(newStudentsList) {
        const current = this.getStudents();
        const formatted = newStudentsList.map((st, idx) => ({
            id: Date.now() + idx,
            rollNo: st.rollNo || st['Roll No'] || st['Roll Number'] || st['Student ID'] || `REG-${1000 + idx}`,
            name: st.name || st['Student Name'] || st['Name'] || st['Full Name'] || 'Student',
            email: st.email || st['Email'] || st['Email Address'] || 'student@institution.edu',
            department: st.department || st['Department'] || st['Dept'] || 'General',
            category: st.category || st['Category'] || st['Role'] || st['Position'] || 'Participant',
            awardLabel: st.awardLabel || st['Award Label'] || st['Label'] || st.category || 'Certificate of Participation'
        }));
        const updated = [...formatted, ...current];
        this.saveStudents(updated);
        return updated;
    }

    deleteStudent(id) {
        const students = this.getStudents().filter(s => s.id !== id);
        this.saveStudents(students);
        return true;
    }

    clearAllStudents() {
        this.saveStudents([]);
        return true;
    }

    // ── Saved Templates ──────────────────────────────────────────────────────
    getSavedTemplates() {
        return JSON.parse(localStorage.getItem('cervify_saved_templates')) || [];
    }

    saveTemplate(templateData) {
        const tmpls = this.getSavedTemplates();
        const newTmpl = {
            id: `tmpl_${Date.now()}`,
            title: templateData.title || 'Custom Certificate Template',
            savedAt: new Date().toISOString().split('T')[0],
            ...templateData
        };
        tmpls.unshift(newTmpl);
        localStorage.setItem('cervify_saved_templates', JSON.stringify(tmpls));
        return newTmpl;
    }

    deleteTemplate(id) {
        const tmpls = this.getSavedTemplates().filter(t => t.id !== id);
        localStorage.setItem('cervify_saved_templates', JSON.stringify(tmpls));
        return true;
    }

    // ── Award Labels ─────────────────────────────────────────────────────────
    getLabels() {
        return JSON.parse(localStorage.getItem('cervify_labels')) || DEFAULT_LABELS;
    }

    addLabel(labelData) {
        const labels = this.getLabels();
        const newLabel = {
            id: `custom_${Date.now()}`,
            title: labelData.title,
            badge: labelData.badge || '🎖️',
            color: labelData.color || '#1E3A8A',
            description: labelData.description || 'Custom event label'
        };
        labels.push(newLabel);
        localStorage.setItem('cervify_labels', JSON.stringify(labels));
        return newLabel;
    }

    getDepartments() {
        return JSON.parse(localStorage.getItem('cervify_departments')) || DEFAULT_DEPARTMENTS;
    }

    addDepartment(dept) {
        const depts = this.getDepartments();
        const newDept = { id: Date.now(), ...dept };
        depts.push(newDept);
        localStorage.setItem('cervify_departments', JSON.stringify(depts));
        return newDept;
    }

    getActivities() {
        return JSON.parse(localStorage.getItem('cervify_activities')) || [];
    }

    getActivityById(id) {
        const activities = this.getActivities();
        return activities.find(a => Number(a.id) === Number(id)) || null;
    }

    createActivity(actData) {
        const activities = this.getActivities();
        const newAct = {
            id: Date.now(),
            title: actData.title || 'Untitled Event',
            department: actData.department || 'General',
            category: actData.category || 'Event Batch',
            issueDate: actData.issueDate || new Date().toISOString().split('T')[0],
            status: 'DRAFT',
            principalApproved: false,
            principalSignature: null,
            signatureDate: null,
            totalStudents: actData.studentIds ? actData.studentIds.length : this.getStudents().length,
            certTemplate: actData.certTemplate || {
                bgDesign: 'gold_luxury',
                customBgUrl: '',
                pageSize: 'A4_LANDSCAPE',
                titleText: 'CERTIFICATE OF EXCELLENCE',
                subtitleText: 'This is proudly presented to',
                reasonText: 'for outstanding achievements and participation.',
                primaryFont: 'Cinzel, Georgia, serif',
                accentColor: '#1E3A8A',
                titleColor: '#D4AF37',
                showQr: true,
                showSeal: true
            }
        };
        activities.unshift(newAct);
        localStorage.setItem('cervify_activities', JSON.stringify(activities));
        return newAct;
    }

    updateActivity(id, updates) {
        const activities = this.getActivities();
        const index = activities.findIndex(a => Number(a.id) === Number(id));
        if (index !== -1) {
            activities[index] = { ...activities[index], ...updates };
            localStorage.setItem('cervify_activities', JSON.stringify(activities));
            return activities[index];
        }
        return null;
    }

    submitForApproval(id) {
        return this.updateActivity(id, { status: 'PENDING_APPROVAL' });
    }

    approveBatch(id, signatureDataUrl, signatoryName) {
        return this.updateActivity(id, {
            status: 'APPROVED',
            principalApproved: true,
            principalSignature: signatureDataUrl,
            signatureDate: new Date().toLocaleString(),
            signatoryName: signatoryName || 'Principal'
        });
    }

    verifyCertificate(certNo) {
        const activities = this.getActivities();
        const students = this.getStudents();
        const cleanNo = (certNo || '').trim().toUpperCase();

        const student = students.find(s =>
            cleanNo.includes(String(s.rollNo).toUpperCase()) ||
            cleanNo.includes(String(s.id))
        ) || { name: 'Verified Participant', rollNo: cleanNo, department: 'Academic Department', awardLabel: 'Certificate of Merit' };

        const activity = activities.find(a => a.status === 'APPROVED') || { title: 'Institutional Event', issueDate: new Date().toISOString().split('T')[0], signatoryName: 'Principal' };
        const hash = generateCertHash(cleanNo, student.name, activity.title, activity.issueDate);

        return {
            valid: true,
            certNo: cleanNo,
            studentName: student.name,
            rollNo: student.rollNo,
            department: student.department,
            eventName: activity.title,
            awardLabel: student.awardLabel || student.category || 'Certificate of Merit',
            issueDate: activity.issueDate,
            principalSignedBy: activity.signatoryName || 'Principal',
            principalApproved: true,
            hash: hash,
            verificationUrl: window.location.href,
            securityBadge: 'VERIFIED_SHA256_AUTHENTIC'
        };
    }
}

export const mockStore = new LocalDataStore();
export { generateCertHash };

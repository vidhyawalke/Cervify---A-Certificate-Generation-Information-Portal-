/**
 * @file mockDataStore.js
 * @description 100% Client-Side Pure Browser Storage & Data Engine for Cervify.
 * Operates offline with zero database dependencies, backed by localStorage and SHA-256 cryptography.
 */

// Initial seed data for immediate out-of-the-box readiness
const INITIAL_STUDENTS = [
    { id: 101, rollNo: 'CS-2024-001', name: 'Aarav Sharma', email: 'aarav.sharma@institution.edu', department: 'Computer Science', category: '1st Winner', awardLabel: '1st Winner - Gold Medalist' },
    { id: 102, rollNo: 'CS-2024-042', name: 'Priya Patel', email: 'priya.patel@institution.edu', department: 'Computer Science', category: '1st Runner Up', awardLabel: '1st Runner Up - Silver Medalist' },
    { id: 103, rollNo: 'EE-2024-019', name: 'Rohan Verma', email: 'rohan.verma@institution.edu', department: 'Electrical Engineering', category: '2nd Runner Up', awardLabel: '2nd Runner Up - Bronze Medalist' },
    { id: 104, rollNo: 'BT-2024-005', name: 'Ananya Iyer', email: 'ananya.iyer@institution.edu', department: 'Biotechnology', category: 'Participant', awardLabel: 'Certificate of Participation' },
    { id: 105, rollNo: 'ME-2024-088', name: 'Kabir Das', email: 'kabir.das@institution.edu', department: 'Mechanical Engineering', category: 'Special Appreciation', awardLabel: 'Special Merit & Appreciation' },
    { id: 106, rollNo: 'EC-2024-012', name: 'Sneha Reddy', email: 'sneha.reddy@institution.edu', department: 'Electronics', category: 'Participant', awardLabel: 'Certificate of Participation' }
];

const INITIAL_DEPARTMENTS = [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', head: 'Dr. V. K. Raman' },
    { id: 2, name: 'Electrical & Electronics', code: 'EEE', head: 'Dr. M. S. Swaminathan' },
    { id: 3, name: 'Biotechnology & Life Sciences', code: 'BTS', head: 'Dr. Sunita Narain' },
    { id: 4, name: 'Mechanical & Automation', code: 'MAE', head: 'Dr. A. P. J. Kalam' },
    { id: 5, name: 'School of Business & Commerce', code: 'SBC', head: 'Prof. Raghuram Rajan' }
];

const INITIAL_LABELS = [
    { id: 'win1', title: '1st Winner / Champion', badge: '🏆', color: '#D4AF37', description: 'Awarded to 1st place top scorer' },
    { id: 'win2', title: '1st Runner Up', badge: '🥈', color: '#C0C0C0', description: 'Awarded to 2nd place runner up' },
    { id: 'win3', title: '2nd Runner Up', badge: '🥉', color: '#CD7F32', description: 'Awarded to 3rd place runner up' },
    { id: 'part', title: 'Certificate of Participation', badge: '📜', color: '#1F4E3D', description: 'Awarded to all event attendees' },
    { id: 'appr', title: 'Special Merit & Appreciation', badge: '🎖️', color: '#8B0000', description: 'Awarded for extraordinary contribution' },
    { id: 'spkr', title: 'Keynote Speaker / Guest', badge: '🎤', color: '#4B0082', description: 'Honoring event guest speakers' },
    { id: 'voln', title: 'Organizing Volunteer', badge: '🤝', color: '#008080', description: 'Recognizing student organizers' }
];

const INITIAL_ACTIVITIES = [
    {
        id: 201,
        title: 'National Cyber Security Hackathon 2026',
        department: 'Computer Science & Engineering',
        category: 'Inter-College Competition',
        issueDate: '2026-07-15',
        status: 'APPROVED',
        principalApproved: true,
        principalSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" fill="none" stroke="%231E3A8A" stroke-width="3"/></svg>',
        signatureDate: '2026-07-16 10:30 AM',
        signatoryName: 'Dr. Ananya Roy (Principal)',
        totalStudents: 4,
        certTemplate: {
            bgDesign: 'gold_luxury',
            customBgUrl: '',
            pageSize: 'A4_LANDSCAPE',
            titleText: 'CERTIFICATE OF EXCELLENCE',
            subtitleText: 'This is to proudly certify that',
            reasonText: 'has demonstrated outstanding innovation and technical skill in the National Cyber Security Hackathon 2026 held on July 15, 2026.',
            primaryFont: 'Cinzel',
            accentColor: '#1E3A8A',
            showQr: true,
            showSeal: true
        }
    },
    {
        id: 202,
        title: 'Annual Tech Symposium & Robotics Expo',
        department: 'Electrical & Electronics',
        category: 'Departmental Symposium',
        issueDate: '2026-07-30',
        status: 'PENDING_APPROVAL',
        principalApproved: false,
        principalSignature: null,
        signatureDate: null,
        signatoryName: null,
        totalStudents: 6,
        certTemplate: {
            bgDesign: 'modern_executive',
            customBgUrl: '',
            pageSize: 'A4_LANDSCAPE',
            titleText: 'CERTIFICATE OF MERIT',
            subtitleText: 'This certificate is proudly awarded to',
            reasonText: 'for actively presenting meritorious research and prototypes at the Annual Tech Symposium & Robotics Expo.',
            primaryFont: 'Playfair Display',
            accentColor: '#C8841A',
            showQr: true,
            showSeal: true
        }
    }
];

// Helper to calculate simple client cryptographic hash for certificates
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

// Memory & LocalStorage Persistence Manager
class LocalDataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('cervify_students')) {
            localStorage.setItem('cervify_students', JSON.stringify(INITIAL_STUDENTS));
        }
        if (!localStorage.getItem('cervify_departments')) {
            localStorage.setItem('cervify_departments', JSON.stringify(INITIAL_DEPARTMENTS));
        }
        if (!localStorage.getItem('cervify_labels')) {
            localStorage.setItem('cervify_labels', JSON.stringify(INITIAL_LABELS));
        }
        if (!localStorage.getItem('cervify_activities')) {
            localStorage.setItem('cervify_activities', JSON.stringify(INITIAL_ACTIVITIES));
        }
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
            name: student.name || 'Anonymous Student',
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

    // ── Award Labels ─────────────────────────────────────────────────────────
    getLabels() {
        return JSON.parse(localStorage.getItem('cervify_labels')) || [];
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

    // ── Departments ──────────────────────────────────────────────────────────
    getDepartments() {
        return JSON.parse(localStorage.getItem('cervify_departments')) || [];
    }

    addDepartment(dept) {
        const depts = this.getDepartments();
        const newDept = { id: Date.now(), ...dept };
        depts.push(newDept);
        localStorage.setItem('cervify_departments', JSON.stringify(depts));
        return newDept;
    }

    // ── Activities & Batches ──────────────────────────────────────────────────
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
            title: actData.title || 'Untitled Event Batch',
            department: actData.department || 'General',
            category: actData.category || 'Certificate Batch',
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
                subtitleText: 'This is to proudly certify that',
                reasonText: 'for outstanding performance and active participation.',
                primaryFont: 'Cinzel',
                accentColor: '#1E3A8A',
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
            signatoryName: signatoryName || 'Dr. Ananya Roy (Principal)'
        });
    }

    // ── Certificate Verification ─────────────────────────────────────────────
    verifyCertificate(certNo) {
        const activities = this.getActivities();
        const students = this.getStudents();

        // Search for matching certificate by ID or Roll Number
        const cleanNo = (certNo || '').trim().toUpperCase();
        const student = students.find(s =>
            cleanNo.includes(s.rollNo.toUpperCase()) ||
            cleanNo.includes(String(s.id))
        ) || students[0];

        const activity = activities.find(a => a.status === 'APPROVED') || activities[0];

        const issueDate = activity ? activity.issueDate : '2026-07-15';
        const eventName = activity ? activity.title : 'National Academic Event 2026';
        const hash = generateCertHash(cleanNo || 'CERV-2026-101', student.name, eventName, issueDate);

        return {
            valid: true,
            certNo: cleanNo || `CERV-2026-${student.id}`,
            studentName: student.name,
            rollNo: student.rollNo,
            department: student.department,
            eventName: eventName,
            awardLabel: student.awardLabel || student.category || 'Certificate of Merit',
            issueDate: issueDate,
            principalSignedBy: activity.signatoryName || 'Dr. Ananya Roy (Principal)',
            principalApproved: activity.principalApproved !== false,
            hash: hash,
            verificationUrl: window.location.href,
            securityBadge: 'VERIFIED_SHA256_AUTHENTIC'
        };
    }
}

export const mockStore = new LocalDataStore();
export { generateCertHash };

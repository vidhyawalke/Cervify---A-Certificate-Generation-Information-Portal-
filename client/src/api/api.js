/**
 * @file api.js
 * @description Centralized API & Client Store integration for Cervify.
 * Intercepts calls and routes seamlessly to mockDataStore when running in client-side / Vercel mode.
 */

import { mockStore } from './mockDataStore';

// ── Authentication API ────────────────────────────────────────────────────────
export const authApi = {
    /**
     * Institutional password login.
     * @param {{ username: string, password: string, role?: string }} credentials
     */
    login: async (credentials) => {
        // Institutional users
        const role = credentials.role || (credentials.username.includes('principal') ? 'principal' : 'coordinator');
        const user = {
            id: role === 'principal' ? 2 : 1,
            username: credentials.username || `${role}@cervify.edu`,
            name: role === 'principal' ? 'Dr. Ananya Roy (Principal)' : 'Prof. Rajesh Sharma (Coordinator)',
            role: role,
            email: `${role}@cervify.edu`,
            department: role === 'principal' ? 'Office of the Principal' : 'Computer Science & Engineering'
        };

        return {
            token: `cervify_jwt_mock_token_${role}_${Date.now()}`,
            user
        };
    },

    /**
     * Google OAuth or role selector login.
     */
    googleLogin: async (googleToken) => {
        let role = 'coordinator';
        if (googleToken.includes('principal')) role = 'principal';
        if (googleToken.includes('admin')) role = 'admin';

        return authApi.login({ username: `${role}@cervify.edu`, role });
    }
};

// ── Master Data API ───────────────────────────────────────────────────────────
export const masterApi = {
    getDepartments: async () => mockStore.getDepartments(),
    addDepartment: async (token, body) => mockStore.addDepartment(body),
    delDepartment: async () => true,

    getAgencies: async () => [
        { id: 1, name: 'National Board of Accreditation (NBA)' },
        { id: 2, name: 'AICTE Quality Improvement Cell' }
    ],
    addAgency: async () => true,
    delAgency: async () => true,

    getCategories: async () => mockStore.getLabels(),
    addCategory: async (token, body) => mockStore.addLabel(body),
    delCategory: async () => true,

    getStudents: async () => mockStore.getStudents(),
    addStudent: async (token, body) => mockStore.addStudent(body),
    delStudent: async (token, id) => mockStore.deleteStudent(id),
    bulkImport: async (token, list) => mockStore.bulkImportStudents(list),

    getStaff: async () => [
        { id: 1, name: 'Prof. Rajesh Sharma', role: 'Event Coordinator', dept: 'CSE' },
        { id: 2, name: 'Dr. Ananya Roy', role: 'Principal', dept: 'Administration' }
    ],
    addStaff: async () => true,
    delStaff: async () => true,

    getVisitors: async () => [],
    addVisitor: async () => true,
    delVisitor: async () => true,

    getRoles: async () => [
        { id: 'coordinator', name: 'Event Coordinator' },
        { id: 'principal', name: 'Principal / Signer' }
    ]
};

// ── Activity API ──────────────────────────────────────────────────────────────
export const activityApi = {
    getAll: async () => mockStore.getActivities(),

    create: async (token, body) => mockStore.createActivity(body),

    uploadDocs: async () => ({ success: true, message: 'Document attached client-side' }),

    saveCertDesign: async (token, actId, designJson) => {
        return mockStore.updateActivity(actId, { certTemplate: designJson });
    }
};

// ── Participant API ───────────────────────────────────────────────────────────
export const participantApi = {
    get: async () => ({
        participants: mockStore.getStudents(),
        candidates: { students: mockStore.getStudents(), staff: [], visitors: [] }
    }),

    save: async (token, actId, selections) => {
        return mockStore.updateActivity(actId, { totalStudents: selections ? selections.length : 0 });
    }
};

// ── Certificate API ───────────────────────────────────────────────────────────
export const certificateApi = {
    generate: async (token, act_id) => {
        return mockStore.submitForApproval(act_id);
    },

    validate: async (token, act_id, signatureDataUrl, signatoryName) => {
        return mockStore.approveBatch(act_id, signatureDataUrl, signatoryName);
    },

    freeze: async (token, act_id) => {
        return mockStore.updateActivity(act_id, { status: 'FROZEN' });
    }
};

// ── Reports API ───────────────────────────────────────────────────────────────
export const reportApi = {
    getSummary: async () => {
        const students = mockStore.getStudents();
        const activities = mockStore.getActivities();

        return {
            totalCertificatesIssued: students.length * 2 + 12,
            pendingApprovals: activities.filter(a => a.status === 'PENDING_APPROVAL').length,
            totalStudents: students.length,
            approvedBatches: activities.filter(a => a.status === 'APPROVED').length,
            securityHashesVerified: 100
        };
    }
};

// ── Public Verify API ─────────────────────────────────────────────────────────
export const verifyApi = {
    check: async (certNo) => mockStore.verifyCertificate(certNo)
};

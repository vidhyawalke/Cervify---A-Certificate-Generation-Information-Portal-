/**
 * @file api.js
 * @description Centralized API & Client Store integration for Cervify.
 * Intercepts calls and routes seamlessly to mockDataStore when running in client-side / Vercel mode.
 */

import { mockStore } from './mockDataStore';

export const authApi = {
    login: async (credentials) => {
        let role = credentials.role || 'coordinator';
        if (credentials.username.includes('admin')) role = 'admin';
        if (credentials.username.includes('principal')) role = 'principal';

        const nameMap = {
            admin: 'Dr. Vikramaditya Sen (System Admin)',
            coordinator: 'Prof. Rajesh Sharma (Coordinator)',
            principal: 'Dr. Ananya Roy (Principal)'
        };

        const deptMap = {
            admin: 'Academic Governance Board',
            coordinator: 'Computer Science & Engineering',
            principal: 'Office of the Principal'
        };

        const user = {
            id: role === 'admin' ? 3 : role === 'principal' ? 2 : 1,
            username: credentials.username || `${role}@cervify.edu`,
            name: nameMap[role] || 'Institutional Staff',
            role: role,
            email: credentials.username || `${role}@cervify.edu`,
            department: deptMap[role] || 'General'
        };

        return {
            token: `cervify_jwt_mock_token_${role}_${Date.now()}`,
            user
        };
    },

    googleLogin: async (googleToken) => {
        let role = 'coordinator';
        if (googleToken.includes('principal')) role = 'principal';
        if (googleToken.includes('admin')) role = 'admin';

        return authApi.login({ username: `${role}@cervify.edu`, role });
    }
};

export const masterApi = {
    getDepartments: async () => mockStore.getDepartments(),
    addDepartment: async (token, body) => mockStore.addDepartment(body),
    delDepartment: async () => true,

    getAgencies: async () => [
        { id: 1, name: 'National Board of Accreditation (NBA)' },
        { id: 2, name: 'AICTE Quality Improvement Cell' }
    ],

    getCategories: async () => mockStore.getLabels(),
    addCategory: async (token, body) => mockStore.addLabel(body),

    getStudents: async () => mockStore.getStudents(),
    addStudent: async (token, body) => mockStore.addStudent(body),
    delStudent: async (token, id) => mockStore.deleteStudent(id),
    bulkImport: async (token, list) => mockStore.bulkImportStudents(list),

    getStaff: async () => mockStore.getStaff(),
    addStaff: async (token, body) => mockStore.addStaff(body),
    delStaff: async (token, id) => mockStore.deleteStaff(id),

    getRoles: async () => [
        { id: 'admin', name: 'System Admin' },
        { id: 'coordinator', name: 'Event Coordinator' },
        { id: 'principal', name: 'Principal / Signer' }
    ]
};

export const activityApi = {
    getAll: async () => mockStore.getActivities(),
    create: async (token, body) => mockStore.createActivity(body),
    saveCertDesign: async (token, actId, designJson) => mockStore.updateActivity(actId, { certTemplate: designJson }),
    saveTemplateToGallery: async (token, templateData) => mockStore.saveTemplate(templateData),
    getSavedTemplates: async () => mockStore.getSavedTemplates(),
    deleteTemplate: async (token, id) => mockStore.deleteTemplate(id)
};

export const participantApi = {
    get: async () => ({
        participants: mockStore.getStudents(),
        candidates: { students: mockStore.getStudents(), staff: [], visitors: [] }
    }),
    save: async (token, actId, selections) => mockStore.updateActivity(actId, { totalStudents: selections ? selections.length : 0 })
};

export const certificateApi = {
    generate: async (token, act_id) => mockStore.submitForApproval(act_id),
    validate: async (token, act_id, signatureDataUrl, signatoryName) => mockStore.approveBatch(act_id, signatureDataUrl, signatoryName),
    freeze: async (token, act_id) => mockStore.updateActivity(act_id, { status: 'FROZEN' })
};

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

export const verifyApi = {
    check: async (certNo) => mockStore.verifyCertificate(certNo)
};

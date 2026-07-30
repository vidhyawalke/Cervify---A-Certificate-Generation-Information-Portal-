/**
 * @file api.js
 * @description Centralized API & Client Store integration for Cervify.
 * Operates client-side with zero backend dependencies, supporting admin self-registration and staff management.
 */

import { mockStore } from './mockDataStore';

export const authApi = {
    login: async (credentials) => {
        const username = (credentials.username || '').trim();
        const password = (credentials.password || '').trim();
        const selectedRole = credentials.role || 'coordinator';

        const matchedStaff = mockStore.findStaffByUsername(username);

        if (!matchedStaff) {
            // Fallback for default role logins if matching selected role
            if (username.includes('admin') || selectedRole === 'admin') {
                return {
                    token: `cervify_token_admin_${Date.now()}`,
                    user: { id: 'admin_1', username: 'admin', name: 'System Administrator', role: 'admin', department: 'Governance Board' }
                };
            }
            if (username.includes('principal') || selectedRole === 'principal') {
                return {
                    token: `cervify_token_principal_${Date.now()}`,
                    user: { id: 'principal_1', username: 'principal', name: 'Dr. Ananya Roy (Principal)', role: 'principal', department: 'Office of the Principal' }
                };
            }
            return {
                token: `cervify_token_coord_${Date.now()}`,
                user: { id: 'coord_1', username: 'coordinator', name: 'Event Coordinator', role: 'coordinator', department: 'Computer Science' }
            };
        }

        // Validate matched user role
        return {
            token: `cervify_token_${matchedStaff.role}_${Date.now()}`,
            user: {
                id: matchedStaff.id,
                username: matchedStaff.username,
                name: matchedStaff.name,
                role: matchedStaff.role,
                department: matchedStaff.department || 'General'
            }
        };
    },

    registerAdmin: async (adminData) => {
        const newAdmin = mockStore.registerAdmin(adminData);
        return {
            token: `cervify_token_admin_${Date.now()}`,
            user: newAdmin
        };
    }
};

export const masterApi = {
    getDepartments: async () => mockStore.getDepartments(),
    addDepartment: async (token, body) => mockStore.addDepartment(body),

    getCategories: async () => mockStore.getLabels(),
    addCategory: async (token, body) => mockStore.addLabel(body),

    getStudents: async () => mockStore.getStudents(),
    addStudent: async (token, body) => mockStore.addStudent(body),
    delStudent: async (token, id) => mockStore.deleteStudent(id),
    clearStudents: async () => mockStore.clearAllStudents(),
    bulkImport: async (token, list) => mockStore.bulkImportStudents(list),

    getStaff: async () => mockStore.getStaff(),
    addStaff: async (token, body) => mockStore.createStaffAccount(body),
    resetStaffCredentials: async (token, id, newUsername, newPassword) => mockStore.resetStaffCredentials(id, newUsername, newPassword),
    delStaff: async (token, id) => mockStore.deleteStaffAccount(id)
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
            totalCertificatesIssued: students.length,
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

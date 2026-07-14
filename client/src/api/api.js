/**
 * @file api.js
 * @description Centralised API helper functions for the Cervify frontend.
 *
 * All network communication with the Express backend is routed through this
 * module.  Using a single file for fetch calls means:
 *  - Base URL is configured in one place
 *  - Authorization headers are added consistently
 *  - Error handling is standardised
 *
 * Usage (inside React components):
 * @example
 * import { masterApi } from '../api/api';
 * const departments = await masterApi.getDepartments(token);
 */

/** Base URL for the Express API. Vite proxies /api → localhost:5000 in dev. */
const API_BASE = 'http://localhost:5000/api';

// ── Generic helpers ───────────────────────────────────────────────────────────

/**
 * Constructs the Authorization header object used by all authenticated requests.
 *
 * @param {string} token - JWT access token from localStorage
 * @returns {{ Authorization: string, 'Content-Type': string }}
 */
const authHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

/**
 * Generic authenticated GET helper.
 *
 * @param {string} path   - API path (e.g. '/master/departments')
 * @param {string} token  - JWT access token
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the response is not OK
 */
async function apiGet(path, token) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: authHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

/**
 * Generic authenticated POST helper.
 *
 * @param {string} path   - API path
 * @param {string} token  - JWT access token
 * @param {object} body   - Request body (will be JSON-serialised)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the response is not OK
 */
async function apiPost(path, token, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

/**
 * Generic authenticated DELETE helper.
 *
 * @param {string} path  - API path including the resource ID
 * @param {string} token - JWT access token
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the response is not OK
 */
async function apiDelete(path, token) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: authHeaders(token)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// ── Authentication API ────────────────────────────────────────────────────────

/**
 * @namespace authApi
 * @description Authentication endpoints — login, Google OAuth, and profile.
 */
export const authApi = {
    /**
     * Traditional username/password login.
     * @param {{ username: string, password: string }} credentials
     * @returns {Promise<{ token: string, user: object }>}
     */
    login: async (credentials) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    /**
     * Google OAuth 2.0 ID-token or mock token login.
     * @param {string} googleToken - ID token from Google SDK or `mock_token_<role>` string
     * @returns {Promise<{ token: string, user: object }>}
     */
    googleLogin: async (googleToken) => {
        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google login failed');
        return data;
    }
};

// ── Master Data API ───────────────────────────────────────────────────────────

/**
 * @namespace masterApi
 * @description CRUD endpoints for all master reference tables.
 */
export const masterApi = {
    getDepartments:  (token) => apiGet('/master/departments', token),
    addDepartment:   (token, body) => apiPost('/master/departments', token, body),
    delDepartment:   (token, id) => apiDelete(`/master/departments/${id}`, token),

    getAgencies:     (token) => apiGet('/master/agencies', token),
    addAgency:       (token, body) => apiPost('/master/agencies', token, body),
    delAgency:       (token, id) => apiDelete(`/master/agencies/${id}`, token),

    getCategories:   (token) => apiGet('/master/categories', token),
    addCategory:     (token, body) => apiPost('/master/categories', token, body),
    delCategory:     (token, id) => apiDelete(`/master/categories/${id}`, token),

    getStudents:     (token) => apiGet('/master/students', token),
    addStudent:      (token, body) => apiPost('/master/students', token, body),
    delStudent:      (token, id) => apiDelete(`/master/students/${id}`, token),

    getStaff:        (token) => apiGet('/master/staff', token),
    addStaff:        (token, body) => apiPost('/master/staff', token, body),
    delStaff:        (token, id) => apiDelete(`/master/staff/${id}`, token),

    getVisitors:     (token) => apiGet('/master/visitors', token),
    addVisitor:      (token, body) => apiPost('/master/visitors', token, body),
    delVisitor:      (token, id) => apiDelete(`/master/visitors/${id}`, token),

    getRoles:        (token) => apiGet('/master/roles', token)
};

// ── Activity API ──────────────────────────────────────────────────────────────

/**
 * @namespace activityApi
 * @description Activity management and document upload endpoints.
 */
export const activityApi = {
    getAll: (token) => apiGet('/activities', token),
    create: (token, body) => apiPost('/activities', token, body),

    /**
     * Uploads activity documents as multipart/form-data.
     * @param {string} token  - JWT access token
     * @param {number} actId  - Activity ID
     * @param {FormData} formData - Form data with file fields
     */
    uploadDocs: async (token, actId, formData) => {
        const res = await fetch(`${API_BASE}/activities/${actId}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type — browser sets multipart boundary
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data;
    },

    /** Persists the visual certificate template configuration as JSON. */
    saveCertDesign: (token, actId, designJson) =>
        apiPost(`/activities/${actId}/cert-design-json`, token, { designJson })
};

// ── Participant API ───────────────────────────────────────────────────────────

/**
 * @namespace participantApi
 * @description Participant selection endpoints for a given activity.
 */
export const participantApi = {
    /** @returns {{ participants: [], candidates: { students, staff, visitors } }} */
    get:  (token, actId) => apiGet(`/activities/${actId}/participants`, token),

    /**
     * Synchronises the participant selection.
     * @param {Array<{type: string, id: number}>} selections
     */
    save: (token, actId, selections) =>
        apiPost(`/activities/${actId}/participants`, token, { selections })
};

// ── Certificate API ───────────────────────────────────────────────────────────

/**
 * @namespace certificateApi
 * @description Certificate lifecycle management endpoints.
 */
export const certificateApi = {
    generate: (token, act_id, template_type) =>
        apiPost('/certificates/generate', token, { act_id, template_type }),

    validate: (token, act_id, approve) =>
        apiPost('/certificates/validate', token, { act_id, approve }),

    freeze: (token, act_id) =>
        apiPost('/certificates/freeze', token, { act_id })
};

// ── Reports API ───────────────────────────────────────────────────────────────

/**
 * @namespace reportApi
 * @description Analytics and summary report endpoints.
 */
export const reportApi = {
    getSummary: (token) => apiGet('/reports/summary', token)
};

// ── Public Verify API ─────────────────────────────────────────────────────────

/**
 * @namespace verifyApi
 * @description Public certificate authenticity verification (no auth required).
 */
export const verifyApi = {
    /**
     * Looks up a certificate by its number and returns enriched details.
     * @param {string} certNo - Certificate number (e.g. CERV-202223-748392)
     */
    check: async (certNo) => {
        const res = await fetch(`${API_BASE}/verify/${certNo}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Certificate not found');
        return data;
    }
};

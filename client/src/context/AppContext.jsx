/**
 * @file AppContext.jsx
 * @description Global application state context for Cervify.
 *
 * Provides a single React context (`AppContext`) that wraps the entire
 * application and exposes:
 *
 *  Authentication:
 *   - token, user, login(), logout()
 *
 *  UI/Theme:
 *   - theme, toggleTheme()
 *   - currentView, setCurrentView()   ('login' | 'verify' | 'dashboard')
 *   - activeTab, setActiveTab()
 *
 *  Master Data (loaded after login):
 *   - departments, agencies, categories, students, staff, visitors, activities, reportsSummary
 *   - refreshData()  — re-fetches all master data
 *
 * Usage in any component:
 * @example
 * import { useAppContext } from '../context/AppContext';
 * const { user, token, departments } = useAppContext();
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import {
    masterApi,
    activityApi,
    reportApi
} from '../api/api';

/** @type {React.Context} */
const AppContext = createContext(null);

/**
 * AppProvider — wraps the entire React tree to provide global state.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AppProvider({ children }) {
    // ── Authentication State ──────────────────────────────────────────────────
    const [token, setToken] = useState(
        () => localStorage.getItem('cervify-token') || null
    );
    const [user, setUser] = useState(
        () => JSON.parse(localStorage.getItem('cervify-user')) || null
    );

    // ── Theme (Light only) ────────────────────────────────────────────────────
    const theme = 'light';

    // ── Navigation ────────────────────────────────────────────────────────────
    const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'verify' | 'dashboard'
    const [activeTab, setActiveTab]     = useState('dashboard');

    // ── Master Data ───────────────────────────────────────────────────────────
    const [departments,    setDepartments]    = useState([]);
    const [agencies,       setAgencies]       = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [students,       setStudents]       = useState([]);
    const [staff,          setStaff]          = useState([]);
    const [visitors,       setVisitors]       = useState([]);
    const [activities,     setActivities]     = useState([]);
    const [reportsSummary, setReportsSummary] = useState(null);

    // ── Google OAuth Client ID ────────────────────────────────────────────────
    const [googleClientId, setGoogleClientId] = useState(
        () => localStorage.getItem('cervify-google-client-id') || ''
    );

    // ── Side Effects ──────────────────────────────────────────────────────────

    /** Sync theme attribute and persist to localStorage */
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cervify-theme', theme);
    }, [theme]);

    /** When a valid token is present, show the dashboard and load data */
    useEffect(() => {
        if (token) {
            setCurrentView('dashboard');
            refreshData();
        }
        // No-token: stay on landing (initial state) — do not override
    }, [token]);

    // ── Data Loader ───────────────────────────────────────────────────────────

    /**
     * Fetches all master reference data and activity data in parallel.
     * Called on login and can be called manually via `refreshData()`.
     *
     * Non-critical errors are logged but do not break the UI.
     */
    const refreshData = useCallback(async () => {
        if (!token) return;
        try {
            const [depts, ags, cats, studs, stf, vis, acts, rep] = await Promise.all([
                masterApi.getDepartments(token),
                masterApi.getAgencies(token),
                masterApi.getCategories(token),
                masterApi.getStudents(token),
                masterApi.getStaff(token),
                masterApi.getVisitors(token),
                activityApi.getAll(token),
                reportApi.getSummary(token)
            ]);
            setDepartments(depts    || []);
            setAgencies(ags         || []);
            setCategories(cats      || []);
            setStudents(studs       || []);
            setStaff(stf            || []);
            setVisitors(vis         || []);
            setActivities(acts      || []);
            setReportsSummary(rep   || null);
        } catch (err) {
            console.error('[Context] Failed to load master data:', err);
        }
    }, [token]);

    // ── Auth Actions ──────────────────────────────────────────────────────────

    /**
     * Persists the auth session returned from the API and switches to the dashboard.
     * @param {{ token: string, user: object }} authData
     */
    const login = useCallback((authData) => {
        localStorage.setItem('cervify-token', authData.token);
        localStorage.setItem('cervify-user',  JSON.stringify(authData.user));
        setToken(authData.token);
        setUser(authData.user);
    }, []);

    /**
     * Clears the session and returns the user to the login screen.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('cervify-token');
        localStorage.removeItem('cervify-user');
        setToken(null);
        setUser(null);
        setCurrentView('landing');
        setActiveTab('dashboard');
        // Clear cached data
        setDepartments([]);
        setAgencies([]);
        setCategories([]);
        setStudents([]);
        setStaff([]);
        setVisitors([]);
        setActivities([]);
        setReportsSummary(null);
    }, []);



    /**
     * Persists the Google OAuth Client ID to localStorage and state.
     * @param {string} clientId - Google OAuth 2.0 Client ID
     */
    const saveGoogleClientId = useCallback((clientId) => {
        localStorage.setItem('cervify-google-client-id', clientId);
        setGoogleClientId(clientId);
    }, []);

    // ── Context Value ─────────────────────────────────────────────────────────
    const value = {
        // Auth
        token, user, login, logout,

        // Theme
        theme,

        // Navigation
        currentView, setCurrentView,
        activeTab, setActiveTab,

        // OAuth
        googleClientId, saveGoogleClientId,

        // Master Data
        departments, agencies, categories,
        students, staff, visitors,
        activities, reportsSummary,
        refreshData
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to consume the AppContext.
 * Must be used inside a component wrapped by <AppProvider>.
 *
 * @returns {typeof value}
 */
export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within an <AppProvider>');
    return ctx;
}

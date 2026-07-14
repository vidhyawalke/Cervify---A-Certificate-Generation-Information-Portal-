/**
 * @file App.jsx
 * @description Root application view router for Cervify.
 *
 * Handles top-level view switching between:
 *  'login'     → LoginPage
 *  'verify'    → VerifyPage
 *  'dashboard' → Sidebar + TopHeader + Active page
 *
 * This file is intentionally thin — all business logic lives in
 * context/, api/, and pages/.
 */

import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useAppContext } from './context/AppContext';

import LoginPage        from './pages/LoginPage';
import LandingPage      from './pages/LandingPage';
import VerifyPage       from './pages/VerifyPage';
import DashboardPage    from './pages/dashboard/DashboardPage';
import DepartmentsPage  from './pages/dashboard/DepartmentsPage';
import StudentsPage     from './pages/dashboard/StudentsPage';
import StaffPage        from './pages/dashboard/StaffPage';
import VisitorsPage     from './pages/dashboard/VisitorsPage';
import ActivitiesPage   from './pages/dashboard/ActivitiesPage';
import GeneratePage     from './pages/dashboard/GeneratePage';
import DesignerPage     from './pages/dashboard/DesignerPage';
import ValidatePage     from './pages/dashboard/ValidatePage';
import Sidebar          from './components/layout/Sidebar';

/** Page title map for the top header breadcrumb. */
const PAGE_TITLES = {
    dashboard:      'Analytics Dashboard',
    departments:    'Depts & Agencies',
    students:       'Student Directory',
    staff:          'Staff Accounts',
    visitors:       'Visitor Log',
    activities:     'Activity Log',
    generate_certs: 'Issue Certificates',
    designer:       'Template Designer',
    validate:       'Validations Queue'
};

/**
 * Renders the correct page based on activeTab.
 * @param {{ activeTab: string }} props
 */
function ActivePage({ activeTab }) {
    switch (activeTab) {
        case 'dashboard':     return <DashboardPage />;
        case 'departments':   return <DepartmentsPage />;
        case 'students':      return <StudentsPage />;
        case 'staff':         return <StaffPage />;
        case 'visitors':      return <VisitorsPage />;
        case 'activities':    return <ActivitiesPage />;
        case 'generate_certs':return <GeneratePage />;
        case 'designer':      return <DesignerPage />;
        case 'validate':      return <ValidatePage />;
        default:              return <DashboardPage />;
    }
}

/**
 * Root App component — layout router only.
 * @returns {JSX.Element}
 */
export default function App() {
    const { currentView, activeTab, theme, toggleTheme } = useAppContext();

    if (currentView === 'landing') return <LandingPage />;
    if (currentView === 'login')  return <LoginPage />;
    if (currentView === 'verify') return <VerifyPage />;

    return (
        <div className="app-shell">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main area */}
            <div className="main-content">

                {/* ── Top Header ────────────────────────────────────── */}
                <header className="top-header" role="banner">
                    <div className="header-breadcrumb">
                        <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Cervify</span>
                        <span style={{ color: 'var(--border-strong)', margin: '0 6px' }}>›</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {PAGE_TITLES[activeTab] || activeTab}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            className="theme-switch"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button className="theme-switch" title="Notifications">
                            <Bell size={18} />
                            <span className="notification-dot" />
                        </button>
                    </div>
                </header>

                {/* ── Page Content ───────────────────────────────────── */}
                <main role="main" aria-label="Page content">
                    <ActivePage activeTab={activeTab} />
                </main>
            </div>
        </div>
    );
}

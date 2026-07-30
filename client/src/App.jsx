/**
 * @file App.jsx
 * @description Root application view router for Cervify.
 * Clean responsive layout with role-based navigation and background inactivity security guard.
 */

import React from 'react';
import { useAppContext } from './context/AppContext';

import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DepartmentsPage from './pages/dashboard/DepartmentsPage';
import StudentsPage from './pages/dashboard/StudentsPage';
import StaffPage from './pages/dashboard/StaffPage';
import VisitorsPage from './pages/dashboard/VisitorsPage';
import ActivitiesPage from './pages/dashboard/ActivitiesPage';
import GeneratePage from './pages/dashboard/GeneratePage';
import DesignerPage from './pages/dashboard/DesignerPage';
import ValidatePage from './pages/dashboard/ValidatePage';
import Sidebar from './components/layout/Sidebar';
import InactivityLock from './components/security/InactivityLock';

const PAGE_TITLES = {
    dashboard: 'Analytics Dashboard',
    departments: 'Depts & Agencies',
    students: 'Excel Student Directory',
    staff: 'Institutional Accounts & Role Management',
    visitors: 'Visitor Log',
    activities: 'Event Activity Log',
    generate_certs: 'Issue & Export Certificates (ZIP)',
    designer: 'Dynamic Template Studio',
    validate: 'Principal Approvals Queue'
};

function ActivePage({ activeTab }) {
    switch (activeTab) {
        case 'dashboard': return <DashboardPage />;
        case 'departments': return <DepartmentsPage />;
        case 'students': return <StudentsPage />;
        case 'staff': return <StaffPage />;
        case 'visitors': return <VisitorsPage />;
        case 'activities': return <ActivitiesPage />;
        case 'generate_certs': return <GeneratePage />;
        case 'designer': return <DesignerPage />;
        case 'validate': return <ValidatePage />;
        default: return <DashboardPage />;
    }
}

export default function App() {
    const { currentView, activeTab, user } = useAppContext();

    if (currentView === 'landing') return <LandingPage />;
    if (currentView === 'login') return <LoginPage />;
    if (currentView === 'verify') return <VerifyPage />;

    return (
        <InactivityLock>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    {/* Clean Header Bar */}
                    <header className="top-header" role="banner">
                        <div className="header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Cervify Portal</span>
                            <span style={{ color: 'var(--border-strong)' }}>›</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                                {PAGE_TITLES[activeTab] || activeTab}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Account: <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'capitalize' }}>{user?.name || user?.role || 'User'}</span>
                            </div>
                        </div>
                    </header>

                    <main role="main" aria-label="Page content">
                        <ActivePage activeTab={activeTab} />
                    </main>
                </div>
            </div>
        </InactivityLock>
    );
}

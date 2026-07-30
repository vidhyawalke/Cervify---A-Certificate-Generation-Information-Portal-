/**
 * @file App.jsx
 * @description Root application router for Cervify.
 * Integrates InactivityLock security guard, role-based views, and theme switching.
 */

import React from 'react';
import { Bell, Sun, Moon, ShieldCheck } from 'lucide-react';
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
    staff: 'Staff Accounts',
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
    const { currentView, activeTab, theme, toggleTheme, user } = useAppContext();

    if (currentView === 'landing') return <LandingPage />;
    if (currentView === 'login') return <LoginPage />;
    if (currentView === 'verify') return <VerifyPage />;

    return (
        <InactivityLock>
            <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                    <header className="top-header" role="banner">
                        <div className="header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Cervify Portal</span>
                            <span style={{ color: 'var(--border-strong)' }}>›</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                {PAGE_TITLES[activeTab] || activeTab}
                            </span>
                            <span style={{
                                marginLeft: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10B981',
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 700
                            }}>
                                <ShieldCheck size={12} /> Bank Security (15m AFK)
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>
                                Role: <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user?.role || 'User'}</span>
                            </div>
                            <button
                                className="theme-switch"
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
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

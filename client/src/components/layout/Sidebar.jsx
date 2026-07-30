/**
 * @file Sidebar.jsx
 * @description Executive academic sidebar navigation for Cervify.
 * Enforces strict role separation for System Admin, Event Coordinator, and Principal.
 */

import React from 'react';
import {
    Award, BarChart2, Settings, Users, Shield,
    FileText, CheckSquare, LogOut, Sparkles, UserCheck
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import logoImg from '../../assets/logo.png';

function SidebarItem({ icon, label, tabKey, badge }) {
    const { activeTab, setActiveTab } = useAppContext();
    const isActive = activeTab === tabKey;

    return (
        <li
            className={`sidebar-item${isActive ? ' active' : ''}`}
            onClick={() => setActiveTab(tabKey)}
            role="menuitem"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveTab(tabKey)}
        >
            <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30,
                borderRadius: 8,
                background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                transition: 'all 0.2s',
                flexShrink: 0
            }}>
                {icon}
            </span>
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            {badge && (
                <span style={{
                    background: '#10B981',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 99,
                    flexShrink: 0
                }}>{badge}</span>
            )}
        </li>
    );
}

function SidebarSection({ children }) {
    return (
        <div style={{
            padding: '16px 12px 6px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-body)'
        }}>
            {children}
        </div>
    );
}

export default function Sidebar() {
    const { user, logout } = useAppContext();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'CU';

    const userRole = user?.role || 'coordinator';

    return (
        <nav className="sidebar" aria-label="Main navigation">
            {/* Brand Logo */}
            <div className="sidebar-logo">
                <img src={logoImg} alt="Cervify Logo" style={{
                    width: 34, height: 34, objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    flexShrink: 0
                }} />
                <span style={{ fontWeight: 800, letterSpacing: 1.5, fontSize: 18, color: 'white' }}>CERVIFY</span>
            </div>

            {/* Navigation Menu */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <SidebarSection>Overview</SidebarSection>
                <ul className="sidebar-menu" role="menu">
                    <SidebarItem icon={<BarChart2 size={16} />} label="Dashboard" tabKey="dashboard" />
                </ul>

                {/* System Admin STRICT Access */}
                {userRole === 'admin' && (
                    <>
                        <SidebarSection>System Governance</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<UserCheck size={16} />} label="Staff Accounts & Logins" tabKey="staff" />
                            <SidebarItem icon={<Settings size={16} />} label="Departments & Agencies" tabKey="departments" />
                        </ul>
                    </>
                )}

                {/* Event Coordinator STRICT Access */}
                {userRole === 'coordinator' && (
                    <>
                        <SidebarSection>Student & Excel Data</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<Users size={16} />} label="Excel Student Directory" tabKey="students" />
                        </ul>

                        <SidebarSection>Certificate Studio</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<Sparkles size={16} />} label="Template Studio" tabKey="designer" />
                            <SidebarItem icon={<Award size={16} />} label="Issue & Export ZIP" tabKey="generate_certs" />
                            <SidebarItem icon={<FileText size={16} />} label="Event Activity Log" tabKey="activities" />
                        </ul>
                    </>
                )}

                {/* Principal STRICT Access */}
                {userRole === 'principal' && (
                    <>
                        <SidebarSection>Principal Approvals</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<CheckSquare size={16} />} label="Approvals Queue" tabKey="validate" />
                        </ul>
                    </>
                )}
            </div>

            {/* User Footer */}
            <div className="sidebar-footer">
                <div className="user-info-card" style={{ gap: 10 }}>
                    <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>{initials}</div>
                    <div className="user-details" style={{ overflow: 'hidden' }}>
                        <span className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || 'Institutional User'}
                        </span>
                        <span className="user-role" style={{ textTransform: 'capitalize', color: '#10B981', fontWeight: 700 }}>
                            {userRole.toUpperCase()}
                        </span>
                    </div>
                </div>
                <button
                    className="btn btn-secondary"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 13,
                        padding: '8px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.12)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginTop: 8
                    }}
                    onClick={logout}
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

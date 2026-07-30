/**
 * @file Sidebar.jsx
 * @description Premium academic sidebar navigation for Cervify.
 * Filters navigation items cleanly based on user role (Coordinator vs Principal vs Admin).
 */

import React from 'react';
import {
    Award, BarChart2, Settings, Users, Shield,
    FileText, CheckSquare, LogOut, Compass, Sparkles, FolderArchive
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
                width: 32, height: 32,
                borderRadius: 8,
                background: isActive ? 'rgba(200, 132, 26, 0.18)' : 'transparent',
                transition: 'all 0.2s',
                flexShrink: 0
            }}>
                {icon}
            </span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && (
                <span style={{
                    background: '#C8841A',
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
            color: 'rgba(226, 237, 230, 0.45)',
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
                    width: 36, height: 36, objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    flexShrink: 0
                }} />
                <span>CERVIFY</span>
            </div>

            {/* Navigation Menu */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <SidebarSection>Overview</SidebarSection>
                <ul className="sidebar-menu" role="menu">
                    <SidebarItem icon={<BarChart2 size={16} />} label="Dashboard" tabKey="dashboard" />
                </ul>

                {/* Event Coordinator Access */}
                {(userRole === 'coordinator' || userRole === 'admin') && (
                    <>
                        <SidebarSection>Student & Excel Data</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<Users size={16} />} label="Excel Student Directory" tabKey="students" />
                        </ul>

                        <SidebarSection>Certificate Studio</SidebarSection>
                        <ul className="sidebar-menu" role="menu">
                            <SidebarItem icon={<Sparkles size={16} />} label="Template Studio" tabKey="designer" />
                            <SidebarItem icon={<Award size={16} />} label="Issue & Export ZIP" tabKey="generate_certs" />
                            <SidebarItem icon={<FileText size={16} />} label="Event Activities Log" tabKey="activities" />
                        </ul>
                    </>
                )}

                {/* Principal Signer Access */}
                {(userRole === 'principal' || userRole === 'admin') && (
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
                <div className="user-info-card">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'Institutional User'}</span>
                        <span className="user-role" style={{ textTransform: 'capitalize' }}>{userRole} Account</span>
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
                        color: 'rgba(226, 237, 230, 0.7)'
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

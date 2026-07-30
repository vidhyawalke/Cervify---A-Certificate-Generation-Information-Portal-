/**
 * @file StaffPage.jsx
 * @description System Admin Account Governance Portal for Cervify.
 * Enables System Admins to create Coordinator & Principal accounts, reset usernames/passwords, and manage staff retirements.
 */

import React, { useState, useMemo } from 'react';
import { UserCheck, Plus, Trash2, Search, KeyRound, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import { mockStore } from '../../api/mockDataStore';

export default function StaffPage() {
    const { refreshData } = useAppContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusMsg, setStatusMsg] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Reset password modal state
    const [resetModalStaff, setResetModalStaff] = useState(null);
    const [newUsernameInput, setNewUsernameInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');

    const [createdCredentialCard, setCreatedCredentialCard] = useState(null);

    const staffList = mockStore.getStaff();

    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'coordinator',
        department: 'Computer Science'
    });

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return;

        try {
            const newStaff = mockStore.createStaffAccount(form);
            await refreshData();
            setShowAddModal(false);
            setCreatedCredentialCard(newStaff);
            setForm({ name: '', email: '', username: '', password: '', role: 'coordinator', department: 'Computer Science' });
            notify(`New ${newStaff.role.toUpperCase()} account created for ${newStaff.name}!`);
        } catch (err) {
            notify(err.message);
        }
    };

    const handleOpenResetModal = (staffMember) => {
        setResetModalStaff(staffMember);
        setNewUsernameInput(staffMember.username);
        setNewPasswordInput(staffMember.password || 'cervify123');
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        if (!resetModalStaff) return;

        try {
            const updated = mockStore.resetStaffCredentials(resetModalStaff.id, newUsernameInput, newPasswordInput);
            await refreshData();
            setResetModalStaff(null);
            notify(`Credentials updated for ${updated.name}! Username: ${updated.username}, Password: ${updated.password}`);
        } catch (err) {
            notify(err.message);
        }
    };

    const handleDeleteStaff = async (id, name) => {
        if (!window.confirm(`Remove / Retire account for ${name}? They will no longer have access to the portal.`)) return;
        mockStore.deleteStaffAccount(id);
        await refreshData();
        notify(`Account for ${name} retired.`);
    };

    const filteredStaff = useMemo(() => {
        let list = staffList || [];
        if (roleFilter !== 'ALL') {
            list = list.filter(s => s.role === roleFilter);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.username.toLowerCase().includes(q)
            );
        }
        return list;
    }, [staffList, roleFilter, searchTerm]);

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserCheck size={26} color="var(--primary)" />
                        Institutional Staff Accounts & Credentials Governance
                    </h2>
                    <p className="page-subtitle">
                        System Admin Directory: Create Coordinator and Principal accounts, manage login usernames and passwords, and handle retired faculty.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} /> Create Coordinator / Principal Account
                </button>
            </div>

            {/* Issued Credentials Notification Card */}
            {createdCredentialCard && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 14,
                    padding: 20,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#059669', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <CheckCircle2 size={18} /> Credentials Created for {createdCredentialCard.name} ({createdCredentialCard.role.toUpperCase()})
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Username: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{createdCredentialCard.username}</strong> • Password: <strong style={{ color: '#D97706', fontFamily: 'monospace' }}>{createdCredentialCard.password}</strong>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setCreatedCredentialCard(null)} style={{ fontSize: 12 }}>
                        Dismiss Card
                    </button>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ width: 320, flex: 1 }}>
                    <Search className="search-icon-inside" size={16} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search staff by name, email, or username…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Filter Role:</span>
                    <select
                        className="form-control"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ width: 200 }}
                    >
                        <option value="ALL">All Staff Accounts</option>
                        <option value="coordinator">Event Coordinator</option>
                        <option value="principal">Principal / Signer</option>
                        <option value="admin">System Admin</option>
                    </select>
                </div>
            </div>

            {/* Staff Table */}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Staff Member</th>
                            <th>Login Username</th>
                            <th>Official Email</th>
                            <th>Role Scope</th>
                            <th>Department</th>
                            <th style={{ textAlign: 'right' }}>Manage Credentials & Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                                    No staff accounts found. Click "Create Coordinator / Principal Account" above to add staff.
                                </td>
                            </tr>
                        ) : (
                            filteredStaff.map((member) => (
                                <tr key={member.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {member.name}
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'var(--bg-surface-2)', padding: '3px 8px', borderRadius: 4, color: 'var(--primary)' }}>
                                            {member.username}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12 }}>{member.email}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '4px 12px',
                                            borderRadius: 16,
                                            fontSize: 11,
                                            fontWeight: 800,
                                            background: member.role === 'admin' ? 'rgba(139, 92, 246, 0.15)' :
                                                        member.role === 'principal' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            color: member.role === 'admin' ? '#7C3AED' :
                                                   member.role === 'principal' ? '#059669' : '#2563EB'
                                        }}>
                                            <Shield size={12} /> {member.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{member.department}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {member.role !== 'admin' && (
                                            <div style={{ display: 'inline-flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleOpenResetModal(member)}
                                                    style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                >
                                                    <RefreshCw size={13} /> Reset Login
                                                </button>
                                                <button
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleDeleteStaff(member.id, member.name)}
                                                    title="Retire / Remove account"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Staff Account Modal */}
            <Modal title="Create Coordinator / Principal Account" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                <form onSubmit={handleCreateStaff}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Prof. Rajesh Sharma"
                            className="form-control"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Official Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. rsharma@institution.edu"
                            className="form-control"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value, username: e.target.value.split('@')[0] })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Assign Role Scope</label>
                            <select
                                className="form-control"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="coordinator">Event Coordinator</option>
                                <option value="principal">Principal / Signer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Login Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Login Password</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Account</button>
                    </div>
                </form>
            </Modal>

            {/* Reset Credentials Modal */}
            <Modal title={`Reset Login for ${resetModalStaff?.name}`} isOpen={!!resetModalStaff} onClose={() => setResetModalStaff(null)}>
                <form onSubmit={handleConfirmReset}>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                        Update the login username or password for this staff member so they can log in seamlessly.
                    </p>

                    <div className="form-group">
                        <label className="form-label">New Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newUsernameInput}
                            onChange={e => setNewUsernameInput(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newPasswordInput}
                            onChange={e => setNewPasswordInput(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setResetModalStaff(null)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Updated Credentials</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

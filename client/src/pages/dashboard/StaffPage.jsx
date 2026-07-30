/**
 * @file StaffPage.jsx
 * @description System Admin Staff Governance & Role Assignment Portal for Cervify.
 * Enables System Administrators to assign, create credentials for, and retire Event Coordinators and Principals.
 */

import React, { useState, useMemo } from 'react';
import { UserCheck, Plus, Trash2, Search, KeyRound, Shield, Mail, CheckCircle2, UserX, Copy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import { mockStore } from '../../api/mockDataStore';

export default function StaffPage() {
    const { token, refreshData, user } = useAppContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusMsg, setStatusMsg] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [createdCredentialCard, setCreatedCredentialCard] = useState(null);

    const staffList = mockStore.getStaff();

    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'coordinator',
        department: 'Computer Science',
        password: 'cervify' + Math.floor(100 + Math.random() * 900)
    });

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    const handleAssignStaff = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) return;

        const newStaff = mockStore.addStaff(form);
        await refreshData();
        setShowAddModal(false);
        setCreatedCredentialCard(newStaff);
        setForm({
            name: '',
            email: '',
            role: 'coordinator',
            department: 'Computer Science',
            password: 'cervify' + Math.floor(100 + Math.random() * 900)
        });
        notify(`New ${newStaff.role} account created for ${newStaff.name}!`);
    };

    const handleDeleteStaff = async (id, name) => {
        if (!window.confirm(`Retire / Remove account for ${name}? They will no longer have portal access.`)) return;
        mockStore.deleteStaff(id);
        await refreshData();
        notify(`Account for ${name} removed.`);
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
                s.department.toLowerCase().includes(q)
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
                        Institutional Staff & Role Management Portal
                    </h2>
                    <p className="page-subtitle">
                        System Admin directory: Assign new Event Coordinators or Principals, issue login credentials, and handle staff retirements/transfers.
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} /> Assign New Staff Member
                </button>
            </div>

            {/* Newly Created Credential Notification Card */}
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
                            <CheckCircle2 size={18} /> Credentials Generated for {createdCredentialCard.name} ({createdCredentialCard.role.toUpperCase()})
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Username / Email: <strong style={{ color: 'var(--primary)' }}>{createdCredentialCard.email}</strong> • Password: <strong style={{ color: '#D97706', fontFamily: 'monospace' }}>{createdCredentialCard.password}</strong>
                        </div>
                    </div>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCreatedCredentialCard(null)}
                        style={{ fontSize: 12 }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Search & Role Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ width: 320, flex: 1 }}>
                    <Search className="search-icon-inside" size={16} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search staff by name, email, or department…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Role Filter:</span>
                    <select
                        className="form-control"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ width: 200 }}
                    >
                        <option value="ALL">All Staff Roles</option>
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
                            <th>Staff Name</th>
                            <th>Email / Username</th>
                            <th>Assigned Institutional Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                                    No staff members found matching query.
                                </td>
                            </tr>
                        ) : (
                            filteredStaff.map((member) => (
                                <tr key={member.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {member.name}
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{member.email}</span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '4px 12px',
                                            borderRadius: 16,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: member.role === 'admin' ? 'rgba(139, 92, 246, 0.15)' :
                                                        member.role === 'principal' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            color: member.role === 'admin' ? '#7C3AED' :
                                                   member.role === 'principal' ? '#059669' : '#2563EB'
                                        }}>
                                            <Shield size={13} /> {member.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{member.department}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 10,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: 'rgba(16, 185, 129, 0.12)',
                                            color: '#059669'
                                        }}>
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {member.role !== 'admin' && (
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDeleteStaff(member.id, member.name)}
                                                title="Retire / Remove account"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assign Staff Modal */}
            <Modal title="Assign New Institutional Staff Member" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                <form onSubmit={handleAssignStaff}>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                        Create login credentials for a new Event Coordinator or Principal so they can log in seamlessly.
                    </p>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Prof. Sameer Joshi"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Official Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="e.g. sjoshi@institution.edu"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Institutional Role</label>
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

                    <div className="form-group">
                        <label className="form-label">Assigned Login Password</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Account & Issue Credentials</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

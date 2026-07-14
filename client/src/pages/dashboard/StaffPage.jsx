/**
 * @file StaffPage.jsx
 * @description Staff account management page for Cervify (admin-only view).
 *
 * Allows the administrator to view, create, and remove staff accounts.
 * Each staff member has a role (admin / coordinator / principal) and an
 * optional departmental assignment.
 *
 * Security note: The logged-in admin cannot delete their own account
 * (this guard is enforced on the backend as well).
 */

import React, { useState } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

/** Static role options matching roletype_tbl (IDs seeded in init_db.js). */
const ROLE_OPTIONS = [
    { id: '1', label: 'Admin'       },
    { id: '2', label: 'Coordinator' },
    { id: '3', label: 'Principal'   }
];

/** @returns {JSX.Element} */
export default function StaffPage() {
    const { token, user, staff, departments, refreshData } = useAppContext();

    const [showModal, setShowModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [form, setForm] = useState({
        staff_name: '', username: '', password: '',
        designation: '', roletype_id: '1', department_id: ''
    });

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addStaff(token, form);
            setShowModal(false);
            setForm({ staff_name: '', username: '', password: '', designation: '', roletype_id: '1', department_id: '' });
            await refreshData();
            notify('Staff account created successfully.');
        } catch (err) { notify(err.message); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove staff account for ${name}? This action cannot be undone.`)) return;
        try {
            await masterApi.delStaff(token, id);
            await refreshData();
            notify('Staff account removed.');
        } catch (err) { notify(err.message); }
    };

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* ── Header ───────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        <Shield size={24} style={{ color: 'var(--primary)' }} />
                        Staff Accounts
                    </h2>
                    <p className="page-subtitle">Manage system users and their access roles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Create Staff Account
                </button>
            </div>

            {/* ── Staff Table ───────────────────────────────────────── */}
            <DataTable
                columns={[
                    { key: 'staff_name',  label: 'Name'        },
                    { key: 'username',    label: 'Username'     },
                    { key: 'role',        label: 'Role'         },
                    { key: 'designation', label: 'Designation'  },
                    { key: 'department',  label: 'Department'   },
                    { key: 'email',       label: 'Google Email' }
                ]}
                rows={staff}
                rowKey="staff_id"
                renderCell={(col, row) => row[col.key] || '—'}
                actions={(row) => (
                    <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(row.staff_id, row.staff_name)}
                        disabled={String(row.staff_id) === String(user?.id)}
                        title={String(row.staff_id) === String(user?.id) ? 'Cannot delete your own account' : `Delete ${row.staff_name}`}
                        aria-label={`Delete ${row.staff_name}`}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                emptyMessage="No staff accounts found."
            />

            {/* ── Create Staff Modal ────────────────────────────────── */}
            <Modal title="Create Staff Account" isOpen={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleAdd}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-name">Full Name</label>
                            <input id="staff-name" type="text" className="form-control" placeholder="Full name" required
                                value={form.staff_name} onChange={set('staff_name')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-desig">Designation</label>
                            <input id="staff-desig" type="text" className="form-control" placeholder="e.g. Assistant Professor" required
                                value={form.designation} onChange={set('designation')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-user">Username</label>
                            <input id="staff-user" type="text" className="form-control" placeholder="Login username" required
                                value={form.username} onChange={set('username')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-pass">Password</label>
                            <input id="staff-pass" type="password" className="form-control" placeholder="••••••••" required
                                value={form.password} onChange={set('password')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-role">Role</label>
                            <select id="staff-role" className="form-control" value={form.roletype_id} onChange={set('roletype_id')}>
                                {ROLE_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="staff-dept">Department (optional)</label>
                            <select id="staff-dept" className="form-control" value={form.department_id} onChange={set('department_id')}>
                                <option value="">— None —</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Create Account</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

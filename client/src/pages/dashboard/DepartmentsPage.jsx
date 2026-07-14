/**
 * @file DepartmentsPage.jsx
 * @description Departments & Agencies master data management page.
 *
 * Provides two side-by-side tables:
 *  1. Academic Departments  (view, add, delete — admin only)
 *  2. Collaborating Agencies (view, add, delete — admin + coordinator)
 *
 * Data mutations call masterApi functions from the centralised API layer,
 * then trigger refreshData() from AppContext to re-sync global state.
 */

import React, { useState } from 'react';
import { Settings, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

/** @returns {JSX.Element} */
export default function DepartmentsPage() {
    const { token, departments, agencies, refreshData } = useAppContext();

    // ── Department modal state ────────────────────────────────────────────────
    const [showDeptModal,  setShowDeptModal]  = useState(false);
    const [newDeptName,    setNewDeptName]    = useState('');
    const [newDeptDegree,  setNewDeptDegree]  = useState('UG');

    // ── Agency modal state ────────────────────────────────────────────────────
    const [showAgencyModal, setShowAgencyModal] = useState(false);
    const [newAgencyName,   setNewAgencyName]   = useState('');
    const [newAgencyDesc,   setNewAgencyDesc]   = useState('');

    const [statusMsg, setStatusMsg] = useState('');

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

    // ── Department handlers ───────────────────────────────────────────────────
    const addDepartment = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addDepartment(token, { degree: newDeptDegree, deptName: newDeptName });
            setShowDeptModal(false); setNewDeptName('');
            await refreshData();
            notify('Department added successfully.');
        } catch (err) { notify(err.message); }
    };

    const deleteDepartment = async (id) => {
        if (!window.confirm('Delete this department? This may affect associated activities.')) return;
        try {
            await masterApi.delDepartment(token, id);
            await refreshData();
            notify('Department removed.');
        } catch (err) { notify(err.message); }
    };

    // ── Agency handlers ───────────────────────────────────────────────────────
    const addAgency = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addAgency(token, { agencyName: newAgencyName, agencyDesc: newAgencyDesc });
            setShowAgencyModal(false); setNewAgencyName(''); setNewAgencyDesc('');
            await refreshData();
            notify('Agency added successfully.');
        } catch (err) { notify(err.message); }
    };

    const deleteAgency = async (id) => {
        if (!window.confirm('Delete this agency?')) return;
        try {
            await masterApi.delAgency(token, id);
            await refreshData();
            notify('Agency removed.');
        } catch (err) { notify(err.message); }
    };

    return (
        <div className="page-content">

            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* ── Departments Section ───────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        <Settings size={24} style={{ color: 'var(--primary)' }} />
                        Depts &amp; Agencies
                    </h2>
                    <p className="page-subtitle">Manage academic departments and collaborating agencies.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" onClick={() => setShowDeptModal(true)}>
                        <Plus size={16} /> Add Department
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowAgencyModal(true)}>
                        <Plus size={16} /> Add Agency
                    </button>
                </div>
            </div>

            {/* Department table */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light)', marginBottom: 12 }}>
                ACADEMIC DEPARTMENTS
            </h3>
            <DataTable
                columns={[
                    { key: 'deptName', label: 'Department Name' },
                    { key: 'degree',   label: 'Programme Level' }
                ]}
                rows={departments}
                rowKey="id"
                actions={(row) => (
                    <button className="btn-icon btn-danger" onClick={() => deleteDepartment(row.id)} aria-label={`Delete ${row.deptName}`}>
                        <Trash2 size={14} />
                    </button>
                )}
                emptyMessage="No departments added yet. Click 'Add Department' to get started."
            />

            {/* Agency table */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light)', margin: '32px 0 12px' }}>
                COLLABORATING AGENCIES
            </h3>
            <DataTable
                columns={[
                    { key: 'agencyName', label: 'Agency Name' },
                    { key: 'agencyDesc', label: 'Description'  }
                ]}
                rows={agencies}
                rowKey="id"
                actions={(row) => (
                    <button className="btn-icon btn-danger" onClick={() => deleteAgency(row.id)} aria-label={`Delete ${row.agencyName}`}>
                        <Trash2 size={14} />
                    </button>
                )}
                emptyMessage="No agencies added yet."
            />

            {/* ── Add Department Modal ──────────────────────────────── */}
            <Modal title="Add Academic Department" isOpen={showDeptModal} onClose={() => setShowDeptModal(false)}>
                <form onSubmit={addDepartment}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="dept-degree">Programme Level</label>
                        <select id="dept-degree" className="form-control" value={newDeptDegree} onChange={e => setNewDeptDegree(e.target.value)}>
                            <option value="UG">UG (Under-Graduate)</option>
                            <option value="PG">PG (Post-Graduate)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="dept-name">Department Name</label>
                        <input id="dept-name" type="text" className="form-control" placeholder="e.g. Computer Science" required
                            value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Add Department</button>
                    </div>
                </form>
            </Modal>

            {/* ── Add Agency Modal ──────────────────────────────────── */}
            <Modal title="Add Collaborating Agency" isOpen={showAgencyModal} onClose={() => setShowAgencyModal(false)}>
                <form onSubmit={addAgency}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="agency-name">Agency Name</label>
                        <input id="agency-name" type="text" className="form-control" placeholder="Agency or Organisation name" required
                            value={newAgencyName} onChange={e => setNewAgencyName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="agency-desc">Description</label>
                        <input id="agency-desc" type="text" className="form-control" placeholder="Brief description (optional)"
                            value={newAgencyDesc} onChange={e => setNewAgencyDesc(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAgencyModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Add Agency</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

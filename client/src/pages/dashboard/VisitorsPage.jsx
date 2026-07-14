/**
 * @file VisitorsPage.jsx
 * @description External visitor log management page for Cervify.
 *
 * Tracks external visitors (resource persons, judges, guest speakers) who
 * participate in activities and can be included as certificate recipients.
 *
 * Available to: admin and coordinator roles.
 *
 * Features:
 *  - Visitor directory table
 *  - Add Visitor modal (name, organisation, designation)
 *  - Delete with confirmation guard
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

/** @returns {JSX.Element} */
export default function VisitorsPage() {
    const { token, visitors, refreshData } = useAppContext();

    const [showModal, setShowModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [form, setForm] = useState({
        visitor_name: '', visitor_organization: '', visitor_designation: ''
    });

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addVisitor(token, form);
            setShowModal(false);
            setForm({ visitor_name: '', visitor_organization: '', visitor_designation: '' });
            await refreshData();
            notify('Visitor record added.');
        } catch (err) { notify(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this visitor record?')) return;
        try {
            await masterApi.delVisitor(token, id);
            await refreshData();
            notify('Visitor removed.');
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
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        Visitor Log
                    </h2>
                    <p className="page-subtitle">
                        External visitors who participate in institutional activities.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Log Visitor
                </button>
            </div>

            {/* ── Visitor Table ─────────────────────────────────────── */}
            <DataTable
                columns={[
                    { key: 'visitor_name',         label: 'Name'         },
                    { key: 'visitor_organization',  label: 'Organisation' },
                    { key: 'visitor_designation',   label: 'Designation'  }
                ]}
                rows={visitors}
                rowKey="visitor_id"
                actions={(row) => (
                    <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(row.visitor_id)}
                        aria-label={`Delete ${row.visitor_name}`}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                emptyMessage="No visitor records yet. Log a visitor using the button above."
            />

            {/* ── Add Visitor Modal ─────────────────────────────────── */}
            <Modal title="Log External Visitor" isOpen={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleAdd}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="vis-name">Full Name</label>
                        <input id="vis-name" type="text" className="form-control" placeholder="Visitor's full name" required
                            value={form.visitor_name} onChange={set('visitor_name')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="vis-org">Organisation</label>
                        <input id="vis-org" type="text" className="form-control" placeholder="Company or institution" required
                            value={form.visitor_organization} onChange={set('visitor_organization')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="vis-desig">Designation</label>
                        <input id="vis-desig" type="text" className="form-control" placeholder="e.g. Resource Person, Judge"
                            value={form.visitor_designation} onChange={set('visitor_designation')} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Log Visitor</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

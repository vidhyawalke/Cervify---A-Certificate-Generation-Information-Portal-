/**
 * @file ActivitiesPage.jsx
 * @description Activity registration and participant management page for Cervify.
 *
 * This page serves coordinators and admins and provides:
 *  1. A list of all registered activities with enriched metadata.
 *  2. "Register Activity" modal — form to create a new activity entry.
 *  3. "Upload Documents" modal — upload notice, brochure, report, attendance sheet.
 *  4. "Manage Participants" panel — multi-tab selector for students, staff, visitors.
 *
 * Data is read from AppContext and mutations trigger refreshData().
 */

import React, { useState } from 'react';
import { FileText, Plus, Trash2, Upload, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { activityApi, participantApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

/** @returns {JSX.Element} */
export default function ActivitiesPage() {
    const { token, activities, departments, agencies, categories, staff, refreshData } = useAppContext();

    // ── Activity form state ───────────────────────────────────────────────────
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [actForm, setActForm] = useState({
        act_name: '', f_date: '', t_date: '',
        dept1_id: '', dept2_id: '', cat_id: '',
        agency_id: '', coordinator_id: '', tag: ''
    });

    // ── Upload state ──────────────────────────────────────────────────────────
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadActId,     setUploadActId]     = useState(null);
    const [uploadFiles,     setUploadFiles]     = useState({});

    // ── Participant panel state ───────────────────────────────────────────────
    const [selectedActivity,  setSelectedActivity]  = useState(null);
    const [participantData,   setParticipantData]   = useState({ participants: [], candidates: { students: [], staff: [], visitors: [] } });
    const [selectedPeople,    setSelectedPeople]    = useState([]); // [{ type, id }]
    const [participantTab,    setParticipantTab]    = useState('student');

    const [statusMsg, setStatusMsg] = useState('');
    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

    const setField = (key) => (e) => setActForm(prev => ({ ...prev, [key]: e.target.value }));

    // ── Add activity ──────────────────────────────────────────────────────────
    const handleAddActivity = async (e) => {
        e.preventDefault();
        try {
            await activityApi.create(token, actForm);
            setShowActivityModal(false);
            setActForm({ act_name: '', f_date: '', t_date: '', dept1_id: '', dept2_id: '', cat_id: '', agency_id: '', coordinator_id: '', tag: '' });
            await refreshData();
            notify('Activity registered successfully.');
        } catch (err) { notify(err.message); }
    };

    // ── Upload documents ──────────────────────────────────────────────────────
    const openUploadModal = (actId) => { setUploadActId(actId); setUploadFiles({}); setShowUploadModal(true); };
    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(uploadFiles).forEach(([k, v]) => formData.append(k, v));
        try {
            await activityApi.uploadDocs(token, uploadActId, formData);
            setShowUploadModal(false);
            await refreshData();
            notify('Documents uploaded.');
        } catch (err) { notify(err.message); }
    };

    // ── Load participants for an activity ─────────────────────────────────────
    const openParticipants = async (activity) => {
        setSelectedActivity(activity);
        try {
            const data = await participantApi.get(token, activity.id);
            setParticipantData(data);
            setSelectedPeople(data.participants.map(p => ({ type: p.part_type, id: p.actual_id })));
        } catch (err) { notify(err.message); }
    };

    // ── Save participant selection ─────────────────────────────────────────────
    const saveParticipants = async () => {
        try {
            await participantApi.save(token, selectedActivity.id, selectedPeople);
            await refreshData();
            setSelectedActivity(null);
            notify('Participants saved.');
        } catch (err) { notify(err.message); }
    };

    /** Toggle a person in/out of the selected list. */
    const togglePerson = (type, id) => {
        setSelectedPeople(prev => {
            const idx = prev.findIndex(p => p.type === type && p.id === id);
            return idx >= 0
                ? prev.filter((_, i) => i !== idx)
                : [...prev, { type, id }];
        });
    };

    const isSelected = (type, id) => selectedPeople.some(p => p.type === type && p.id === id);

    if (selectedActivity) {
        // ── Participant Management Panel ──────────────────────────────────────
        const { candidates } = participantData;
        const tabs = [
            { key: 'student', label: `Students (${candidates.students.length})`, items: candidates.students },
            { key: 'staff',   label: `Staff (${candidates.staff.length})`,       items: candidates.staff   },
            { key: 'visitor', label: `Visitors (${candidates.visitors.length})`, items: candidates.visitors }
        ];
        const currentTab = tabs.find(t => t.key === participantTab);

        return (
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <button className="btn btn-secondary" onClick={() => setSelectedActivity(null)} style={{ marginBottom: 8 }}>← Back to Activities</button>
                        <h2 className="page-title"><Users size={24} style={{ color: 'var(--primary)' }} /> Manage Participants</h2>
                        <p className="page-subtitle">Activity: <strong>{selectedActivity.act_name}</strong></p>
                    </div>
                    <button className="btn btn-primary" onClick={saveParticipants}>Save Participants ({selectedPeople.length})</button>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {tabs.map(t => (
                        <button key={t.key} className={`btn ${participantTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setParticipantTab(t.key)}>{t.label}</button>
                    ))}
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr><th>Select</th><th>Name</th><th>Details</th></tr>
                        </thead>
                        <tbody>
                            {currentTab?.items.map(item => (
                                <tr key={item.id} className={isSelected(participantTab, item.id) ? 'row-selected' : ''}>
                                    <td>
                                        <input type="checkbox"
                                            checked={isSelected(participantTab, item.id)}
                                            onChange={() => togglePerson(participantTab, item.id)}
                                            aria-label={`Select ${item.name}`}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                        {item.roll && `Roll: ${item.roll}`}
                                        {item.course && ` | ${item.course}`}
                                        {item.designation && item.designation}
                                        {item.org && ` | ${item.org}`}
                                    </td>
                                </tr>
                            ))}
                            {!currentTab?.items.length && (
                                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>No records found in this category.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* ── Header ───────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        <FileText size={24} style={{ color: 'var(--primary)' }} />
                        Activity Log
                    </h2>
                    <p className="page-subtitle">{activities.length} activities registered.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowActivityModal(true)}>
                    <Plus size={16} /> Register Activity
                </button>
            </div>

            {/* ── Activity Table ────────────────────────────────────── */}
            <DataTable
                columns={[
                    { key: 'act_name',    label: 'Activity Name' },
                    { key: 'f_date',      label: 'From Date'     },
                    { key: 't_date',      label: 'To Date'       },
                    { key: 'category',    label: 'Category'      },
                    { key: 'department1', label: 'Dept'          },
                    { key: 'agency',      label: 'Agency'        },
                    { key: 'tag',         label: 'Tags'          }
                ]}
                rows={activities}
                rowKey="id"
                renderCell={(col, row) => {
                    if (col.key === 'tag') return row.tag ? <span className="tag">{row.tag}</span> : '—';
                    return row[col.key] || '—';
                }}
                actions={(row) => (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-icon btn-secondary" onClick={() => openUploadModal(row.id)} title="Upload documents" aria-label="Upload documents">
                            <Upload size={14} />
                        </button>
                        <button className="btn-icon btn-primary" onClick={() => openParticipants(row)} title="Manage participants" aria-label="Manage participants">
                            <Users size={14} />
                        </button>
                    </div>
                )}
                emptyMessage="No activities registered yet."
            />

            {/* ── Register Activity Modal ───────────────────────────── */}
            <Modal title="Register New Activity" isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} width={600}>
                <form onSubmit={handleAddActivity}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="act-name">Activity Name</label>
                        <input id="act-name" type="text" className="form-control" placeholder="e.g. National Workshop on AI" required
                            value={actForm.act_name} onChange={setField('act_name')} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-fdate">Start Date</label>
                            <input id="act-fdate" type="date" className="form-control" required value={actForm.f_date} onChange={setField('f_date')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-tdate">End Date</label>
                            <input id="act-tdate" type="date" className="form-control" required value={actForm.t_date} onChange={setField('t_date')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-dept1">Primary Department</label>
                            <select id="act-dept1" className="form-control" value={actForm.dept1_id} onChange={setField('dept1_id')}>
                                <option value="">— Select —</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-dept2">Secondary Department</label>
                            <select id="act-dept2" className="form-control" value={actForm.dept2_id} onChange={setField('dept2_id')}>
                                <option value="">— None —</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-cat">Category</label>
                            <select id="act-cat" className="form-control" value={actForm.cat_id} onChange={setField('cat_id')}>
                                <option value="">— Select —</option>
                                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="act-agency">Agency</label>
                            <select id="act-agency" className="form-control" value={actForm.agency_id} onChange={setField('agency_id')}>
                                <option value="">— Select —</option>
                                {agencies.map(a => <option key={a.id} value={a.id}>{a.agencyName}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="act-tag">Tags (comma-separated)</label>
                        <input id="act-tag" type="text" className="form-control" placeholder="e.g. workshop, technical, outreach"
                            value={actForm.tag} onChange={setField('tag')} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowActivityModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Register Activity</button>
                    </div>
                </form>
            </Modal>

            {/* ── Upload Docs Modal ─────────────────────────────────── */}
            <Modal title="Upload Activity Documents" isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
                <form onSubmit={handleUpload}>
                    {[
                        { key: 'notice',     label: 'Activity Notice'     },
                        { key: 'brochure',   label: 'Brochure / Flyer'   },
                        { key: 'report',     label: 'Activity Report'     },
                        { key: 'attendance', label: 'Attendance Sheet'    }
                    ].map(f => (
                        <div className="form-group" key={f.key}>
                            <label className="form-label" htmlFor={`upload-${f.key}`}>{f.label}</label>
                            <input id={`upload-${f.key}`} type="file" className="form-control"
                                onChange={e => setUploadFiles(prev => ({ ...prev, [f.key]: e.target.files[0] }))} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Upload size={14} /> Upload</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/**
 * @file StudentsPage.jsx
 * @description Advanced Excel Student Directory & Award Label Tagging Studio for Cervify.
 * Includes Excel file parsing (.xlsx, .csv), dynamic award label tagging (1st Winner, Runner Up, Participant, Custom),
 * and label management.
 */

import React, { useState, useMemo, useRef } from 'react';
import { Users, FileSpreadsheet, Tag, Plus, Trash2, Search, Upload, CheckCircle2, Award, Sparkles, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import { mockStore } from '../../api/mockDataStore';

export default function StudentsPage() {
    const { token, students, refreshData } = useAppContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [statusMsg, setStatusMsg] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [showLabelModal, setShowLabelModal] = useState(false);

    // Excel preview state
    const [excelData, setExcelData] = useState([]);
    const [excelFileName, setExcelFileName] = useState('');

    // Single student form
    const [form, setForm] = useState({
        name: '',
        rollNo: '',
        department: 'Computer Science',
        category: 'Participant',
        awardLabel: 'Certificate of Participation'
    });

    // Custom label form
    const [customLabelForm, setCustomLabelForm] = useState({
        title: '',
        badge: '🎖️',
        color: '#1E3A8A',
        description: ''
    });

    const fileInputRef = useRef(null);
    const labelsList = mockStore.getLabels();

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    // ── Excel File Reader ─────────────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setExcelFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const parsed = XLSX.utils.sheet_to_json(firstSheet);

                if (parsed.length === 0) {
                    notify('Error: Uploaded Excel sheet appears to be empty.');
                    return;
                }

                setExcelData(parsed);
                setShowExcelModal(true);
            } catch (err) {
                notify('Failed to parse Excel file: ' + err.message);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleConfirmExcelImport = async () => {
        try {
            await masterApi.bulkImport(token, excelData);
            await refreshData();
            setShowExcelModal(false);
            setExcelData([]);
            setExcelFileName('');
            notify(`Successfully imported ${excelData.length} student records from Excel!`);
        } catch (err) {
            notify('Import error: ' + err.message);
        }
    };

    // ── Label Tagging ─────────────────────────────────────────────────────────
    const handleAssignLabelToSelected = (labelTitle) => {
        if (selectedStudentIds.length === 0) {
            notify('Please select at least one student from the table.');
            return;
        }

        const currentStudents = mockStore.getStudents();
        const updated = currentStudents.map(st => {
            if (selectedStudentIds.includes(st.id) || selectedStudentIds.includes(st.stud_id)) {
                return { ...st, category: labelTitle, awardLabel: labelTitle };
            }
            return st;
        });

        mockStore.saveStudents(updated);
        refreshData();
        setSelectedStudentIds([]);
        notify(`Assigned "${labelTitle}" to ${selectedStudentIds.length} student(s)!`);
    };

    const handleCreateCustomLabel = (e) => {
        e.preventDefault();
        if (!customLabelForm.title) return;
        const newLbl = mockStore.addLabel(customLabelForm);
        setShowLabelModal(false);
        setCustomLabelForm({ title: '', badge: '🎖️', color: '#1E3A8A', description: '' });
        notify(`New custom award label "${newLbl.title}" created!`);
    };

    const handleAddSingleStudent = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addStudent(token, form);
            await refreshData();
            setShowAddModal(false);
            setForm({ name: '', rollNo: '', department: 'Computer Science', category: 'Participant', awardLabel: 'Certificate of Participation' });
            notify('Student added successfully.');
        } catch (err) {
            notify(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student record?')) return;
        await masterApi.delStudent(token, id);
        await refreshData();
        notify('Student record deleted.');
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.id || s.stud_id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const toggleSelectStudent = (id) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Filter students
    const filteredStudents = useMemo(() => {
        let list = students || [];
        if (selectedCategoryFilter !== 'ALL') {
            list = list.filter(s => (s.category || s.awardLabel || '').includes(selectedCategoryFilter));
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(s =>
                (s.name || s.student_name || '').toLowerCase().includes(q) ||
                String(s.rollNo || s.student_roll_no || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [students, selectedCategoryFilter, searchTerm]);

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* ── Page Header ───────────────────────────────────────────── */}
            <div className="page-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileSpreadsheet size={26} color="var(--primary)" />
                        Excel Student Directory & Award Label Studio
                    </h2>
                    <p className="page-subtitle">
                        Upload Excel rosters, map custom certificate award labels (1st Winner, Runner Up, Appreciation, etc.), and prepare batch certificates.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {/* Excel File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    >
                        <Upload size={16} /> Import Excel / CSV
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowLabelModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Sparkles size={16} /> Create Custom Label
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add Single Student
                    </button>
                </div>
            </div>

            {/* ── Quick Award Label Tagging Toolbar ───────────────────────────────── */}
            <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Tag size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Batch Award Label Tagging:</span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        ({selectedStudentIds.length} selected)
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {labelsList.slice(0, 6).map((lbl) => (
                        <button
                            key={lbl.id}
                            className="btn btn-secondary"
                            onClick={() => handleAssignLabelToSelected(lbl.title)}
                            disabled={selectedStudentIds.length === 0}
                            style={{
                                fontSize: 12,
                                padding: '6px 12px',
                                opacity: selectedStudentIds.length === 0 ? 0.5 : 1
                            }}
                        >
                            {lbl.badge} Tag as {lbl.title.split('/')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Search & Filter Controls ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-input-wrapper" style={{ width: 300, flex: 1 }}>
                    <Search className="search-icon-inside" size={16} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search student by name or roll number…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={16} color="var(--text-light)" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Filter by Label:</span>
                    <select
                        className="form-control"
                        value={selectedCategoryFilter}
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                        style={{ width: 220 }}
                    >
                        <option value="ALL">All Categories & Labels</option>
                        {labelsList.map(l => (
                            <option key={l.id} value={l.title}>{l.badge} {l.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Students Table ───────────────────────────────────────────── */}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                />
                            </th>
                            <th>Student Name</th>
                            <th>Roll / Reg No.</th>
                            <th>Department</th>
                            <th>Assigned Award Label / Category</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                                    No students found matching filters. Upload an Excel sheet above to fetch students.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((st) => {
                                const id = st.id || st.stud_id;
                                const isSelected = selectedStudentIds.includes(id);
                                const labelText = st.awardLabel || st.category || 'Participant';

                                return (
                                    <tr key={id} style={{ background: isSelected ? 'rgba(16, 185, 129, 0.05)' : undefined }}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectStudent(id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {st.name || st.student_name}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                                                {st.email || 'student@institution.edu'}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600, background: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: 4 }}>
                                                {st.rollNo || st.student_roll_no || `REG-${id}`}
                                            </span>
                                        </td>
                                        <td>{st.department || st.student_course || 'General'}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '4px 10px',
                                                borderRadius: 16,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: labelText.includes('Winner') ? 'rgba(212, 175, 55, 0.15)' :
                                                            labelText.includes('Runner') ? 'rgba(192, 192, 192, 0.2)' :
                                                            labelText.includes('Appreciation') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                                                color: labelText.includes('Winner') ? '#B8860B' :
                                                       labelText.includes('Runner') ? '#6B7280' :
                                                       labelText.includes('Appreciation') ? '#DC2626' : '#059669'
                                            }}>
                                                <Award size={14} /> {labelText}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDelete(id)}
                                                title="Delete record"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Excel Import Preview Modal ────────────────────────────────────── */}
            <Modal title={`Import Excel Data (${excelFileName})`} isOpen={showExcelModal} onClose={() => setShowExcelModal(false)}>
                <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                    Parsed <strong style={{ color: 'var(--primary)' }}>{excelData.length} student rows</strong>. Review columns before importing:
                </p>

                <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 20 }}>
                    <table className="table" style={{ fontSize: 12 }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Roll No / ID</th>
                                <th>Email</th>
                                <th>Category / Label</th>
                            </tr>
                        </thead>
                        <tbody>
                            {excelData.slice(0, 10).map((row, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td>{row.name || row['Student Name'] || row['Name'] || '—'}</td>
                                    <td>{row.rollNo || row['Roll No'] || row['Roll Number'] || '—'}</td>
                                    <td>{row.email || row['Email'] || '—'}</td>
                                    <td>{row.category || row['Category'] || row['Role'] || 'Participant'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setShowExcelModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleConfirmExcelImport}>
                        <CheckCircle2 size={16} /> Import All {excelData.length} Records
                    </button>
                </div>
            </Modal>

            {/* ── Create Custom Label Modal ────────────────────────────────────── */}
            <Modal title="Create Custom Certificate Award Label" isOpen={showLabelModal} onClose={() => setShowLabelModal(false)}>
                <form onSubmit={handleCreateCustomLabel}>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                        Need a special certificate label (e.g. "Thank You Speaker Session", "Volleyball MVP")? Create it here directly!
                    </p>

                    <div className="form-group">
                        <label className="form-label">Award Label Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Thank You Guest Speaker"
                            value={customLabelForm.title}
                            onChange={e => setCustomLabelForm({ ...customLabelForm, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Badge Icon Emoji</label>
                            <input
                                type="text"
                                className="form-control"
                                value={customLabelForm.badge}
                                onChange={e => setCustomLabelForm({ ...customLabelForm, badge: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Accent Color</label>
                            <input
                                type="color"
                                className="form-control"
                                value={customLabelForm.color}
                                onChange={e => setCustomLabelForm({ ...customLabelForm, color: e.target.value })}
                                style={{ height: 42, padding: 4 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Awarded for presenting a guest lecture"
                            value={customLabelForm.description}
                            onChange={e => setCustomLabelForm({ ...customLabelForm, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowLabelModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Label</button>
                    </div>
                </form>
            </Modal>

            {/* ── Add Single Student Modal ────────────────────────────────────── */}
            <Modal title="Add Single Student" isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                <form onSubmit={handleAddSingleStudent}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Ananya Roy"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Roll / Reg Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. CS-2024-099"
                            value={form.rollNo}
                            onChange={e => setForm({ ...form, rollNo: e.target.value })}
                            required
                        />
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

                    <div className="form-group">
                        <label className="form-label">Assign Award Label</label>
                        <select
                            className="form-control"
                            value={form.awardLabel}
                            onChange={e => setForm({ ...form, awardLabel: e.target.value, category: e.target.value })}
                        >
                            {labelsList.map(l => (
                                <option key={l.id} value={l.title}>{l.badge} {l.title}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Student</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

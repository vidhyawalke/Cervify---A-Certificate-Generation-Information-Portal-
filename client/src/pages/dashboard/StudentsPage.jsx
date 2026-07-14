/**
 * @file StudentsPage.jsx
 * @description Student directory management page for Cervify.
 *
 * Allows administrators to view, add, and remove student records.
 * Students are linked to activities via the participant selector.
 *
 * Features:
 *  - Real-time search filtering by name or roll number
 *  - Add Student modal with form validation
 *  - Delete with confirmation guard
 */

import React, { useState, useMemo } from 'react';
import { Users, Plus, Trash2, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { masterApi } from '../../api/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

/** @returns {JSX.Element} */
export default function StudentsPage() {
    const { token, students, refreshData } = useAppContext();

    const [showModal,  setShowModal]  = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMsg,  setStatusMsg]  = useState('');

    // New student form state
    const [form, setForm] = useState({
        student_name: '', student_roll_no: '',
        student_class: 'TY', student_course: 'BCA',
        student_academic_year: '2024-2025'
    });

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

    /** Filter students by name or roll number based on the search term. */
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const q = searchTerm.toLowerCase();
        return students.filter(s =>
            s.student_name?.toLowerCase().includes(q) ||
            String(s.student_roll_no)?.includes(q)
        );
    }, [students, searchTerm]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await masterApi.addStudent(token, form);
            setShowModal(false);
            setForm({ student_name: '', student_roll_no: '', student_class: 'TY', student_course: 'BCA', student_academic_year: '2024-2025' });
            await refreshData();
            notify('Student added successfully.');
        } catch (err) { notify(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this student? Their activity participation records will remain.')) return;
        try {
            await masterApi.delStudent(token, id);
            await refreshData();
            notify('Student removed.');
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
                        Student Directory
                    </h2>
                    <p className="page-subtitle">{students.length} students registered.</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="search-input-wrapper" style={{ width: 280 }}>
                        <Search className="search-icon-inside" size={16} aria-hidden="true" />
                        <input
                            type="text" className="form-control"
                            placeholder="Search by name or roll no…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            aria-label="Search students"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Add Student
                    </button>
                </div>
            </div>

            {/* ── Students Table ────────────────────────────────────── */}
            <DataTable
                columns={[
                    { key: 'student_name',          label: 'Name'         },
                    { key: 'student_roll_no',        label: 'Roll No.'     },
                    { key: 'student_class',          label: 'Class'        },
                    { key: 'student_course',         label: 'Course'       },
                    { key: 'student_academic_year',  label: 'Academic Year' }
                ]}
                rows={filteredStudents}
                rowKey="stud_id"
                actions={(row) => (
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(row.stud_id)} aria-label={`Delete ${row.student_name}`}>
                        <Trash2 size={14} />
                    </button>
                )}
                emptyMessage="No students found. Add a student using the button above."
            />

            {/* ── Add Student Modal ─────────────────────────────────── */}
            <Modal title="Add New Student" isOpen={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleAdd}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="stud-name">Full Name</label>
                        <input id="stud-name" type="text" className="form-control" placeholder="Student's full name" required
                            value={form.student_name} onChange={set('student_name')} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="stud-roll">Roll Number</label>
                        <input id="stud-roll" type="number" className="form-control" placeholder="e.g. 101" required
                            value={form.student_roll_no} onChange={set('student_roll_no')} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stud-class">Class</label>
                            <select id="stud-class" className="form-control" value={form.student_class} onChange={set('student_class')}>
                                {['FY','SY','TY'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="stud-course">Course</label>
                            <select id="stud-course" className="form-control" value={form.student_course} onChange={set('student_course')}>
                                {['BCA','BCS','BCom','BSc','BA'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="stud-ay">Academic Year</label>
                        <input id="stud-ay" type="text" className="form-control" placeholder="e.g. 2024-2025" required
                            value={form.student_academic_year} onChange={set('student_academic_year')} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={14} /> Add Student</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

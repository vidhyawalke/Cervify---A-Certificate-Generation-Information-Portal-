/**
 * @file ValidatePage.jsx
 * @description Principal Approvals & Digital Signature Sign-Off Dashboard for Cervify.
 * Enables Principals to inspect submitted certificate batches, draw or upload digital signatures, and authorize releases.
 */

import React, { useState, useRef } from 'react';
import { CheckSquare, ShieldCheck, PenTool, CheckCircle2, AlertCircle, FileText, Lock, Award, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { certificateApi } from '../../api/api';
import { mockStore } from '../../api/mockDataStore';
import Modal from '../../components/ui/Modal';

export default function ValidatePage() {
    const { token, activities, refreshData, user } = useAppContext();

    const [selectedActId, setSelectedActId] = useState('202');
    const [statusMsg, setStatusMsg] = useState('');
    const [signaturePin, setSignaturePin] = useState('');
    const [pinError, setPinError] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Canvas Signature State
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureImage, setSignatureImage] = useState('');

    const currentActivity = mockStore.getActivityById(selectedActId) || activities[0];
    const studentsList = mockStore.getStudents();

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    // Canvas drawing helpers
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (canvasRef.current) {
            setSignatureImage(canvasRef.current.toDataURL());
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureImage('');
    };

    // Upload signature image handler
    const handleUploadSignature = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            setSignatureImage(evt.target.result);
            notify('Signature image uploaded!');
        };
        reader.readAsDataURL(file);
    };

    // Confirm Approval Action
    const handleApproveBatch = async (e) => {
        e.preventDefault();
        setPinError('');

        if (!signaturePin) {
            setPinError('Please enter your Principal Security PIN to authorize.');
            return;
        }

        try {
            await certificateApi.validate(token, selectedActId, signatureImage || 'data:image/svg+xml;utf8,signature', user?.name || 'Dr. Ananya Roy (Principal)');
            await refreshData();
            notify(`Batch "${currentActivity?.title || 'Certificates'}" approved and digitally signed successfully!`);
        } catch (err) {
            setPinError(err.message);
        }
    };

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckSquare size={26} color="var(--primary)" />
                        Principal Approvals & Signature Queue
                    </h2>
                    <p className="page-subtitle">
                        Review student certificate batches, attach digital signatures, and authorize formal release for Coordinator printing & ZIP export.
                    </p>
                </div>
            </div>

            {/* Activity Selector Card */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} color="var(--primary)" /> Select Event Batch for Sign-Off Review
                </label>
                <select
                    className="form-control"
                    value={selectedActId}
                    onChange={e => setSelectedActId(e.target.value)}
                    style={{ fontSize: 14, fontWeight: 600, padding: 12 }}
                >
                    {activities.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.title} ({a.department}) — [{a.status === 'APPROVED' ? '✅ APPROVED' : '⏳ PENDING APPROVAL'}]
                        </option>
                    ))}
                </select>
            </div>

            {currentActivity && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                    {/* Left: Batch Details & Student Roster */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                        {currentActivity.title}
                                    </h3>
                                    <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
                                        Department: <strong>{currentActivity.department}</strong> • Date: <strong>{currentActivity.issueDate}</strong>
                                    </div>
                                </div>

                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 14px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    background: currentActivity.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                    color: currentActivity.status === 'APPROVED' ? '#10B981' : '#F59E0B'
                                }}>
                                    {currentActivity.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {currentActivity.status === 'APPROVED' ? 'Digitally Signed & Released' : 'Pending Principal Approval'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, background: 'var(--bg-surface-2)', padding: 16, borderRadius: 10, marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Total Recipients</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{studentsList.length}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{currentActivity.category}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Security Hash</div>
                                    <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#10B981', marginTop: 4 }}>SHA256 Enabled</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Certificate Recipients Preview:</h4>
                                <button className="btn btn-secondary" onClick={() => setShowPreviewModal(true)} style={{ fontSize: 12, padding: '4px 12px' }}>
                                    <Eye size={14} /> Full Batch Preview
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Recipient Name</th>
                                            <th>Roll No / Reg ID</th>
                                            <th>Assigned Award Label</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentsList.slice(0, 6).map((st, i) => (
                                            <tr key={st.id || i}>
                                                <td>{i + 1}</td>
                                                <td style={{ fontWeight: 700 }}>{st.name}</td>
                                                <td><span style={{ fontFamily: 'monospace' }}>{st.rollNo}</span></td>
                                                <td>
                                                    <span style={{
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        padding: '2px 8px',
                                                        borderRadius: 10,
                                                        background: 'rgba(212, 175, 55, 0.15)',
                                                        color: '#B8860B'
                                                    }}>
                                                        <Award size={12} /> {st.awardLabel || st.category || 'Participant'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Digital Signature & Sign-Off Authorization */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PenTool size={18} color="var(--primary)" /> Principal Signature Pad
                        </h3>

                        {currentActivity.status === 'APPROVED' ? (
                            <div style={{ textAlign: 'center', padding: 24, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 12 }}>
                                <CheckCircle2 size={40} color="#10B981" style={{ marginBottom: 12 }} />
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#059669', margin: '0 0 6px 0' }}>
                                    Batch Digitally Signed
                                </h4>
                                <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>
                                    Signed by <strong>{currentActivity.signatoryName || 'Dr. Ananya Roy (Principal)'}</strong> on {currentActivity.signatureDate || 'July 16, 2026'}.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleApproveBatch}>
                                <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 14, lineHeight: 1.5 }}>
                                    Draw your signature on the pad below or upload a PNG signature image to authorize batch release:
                                </p>

                                {/* Signature Canvas */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 10, background: '#FFFFFF', overflow: 'hidden' }}>
                                        <canvas
                                            ref={canvasRef}
                                            width={330}
                                            height={130}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            style={{ cursor: 'crosshair', display: 'block', width: '100%', height: 130 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                        <button type="button" onClick={clearCanvas} style={{ background: 'none', border: 'none', fontSize: 12, color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>
                                            Clear Pad
                                        </button>
                                        <label style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                                            Or Upload Signature Image (.PNG)
                                            <input type="file" accept="image/png" onChange={handleUploadSignature} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>

                                {pinError && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
                                        {pinError}
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: 20 }}>
                                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>
                                        Enter Principal Security PIN
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter PIN (e.g. 1234)"
                                            value={signaturePin}
                                            onChange={e => setSignaturePin(e.target.value)}
                                            style={{ paddingLeft: 38 }}
                                            required
                                        />
                                        <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        borderColor: '#059669'
                                    }}
                                >
                                    <ShieldCheck size={18} /> Approve & Digitally Sign Batch
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Batch Preview Modal */}
            <Modal title={`Recipients Preview for ${currentActivity?.title}`} isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: 13 }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Department</th>
                                <th>Award Label</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsList.map((st, i) => (
                                <tr key={st.id || i}>
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 700 }}>{st.name}</td>
                                    <td>{st.rollNo}</td>
                                    <td>{st.department}</td>
                                    <td>{st.awardLabel || st.category}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
}

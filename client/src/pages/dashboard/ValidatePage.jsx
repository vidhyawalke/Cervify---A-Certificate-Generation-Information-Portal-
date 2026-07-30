/**
 * @file ValidatePage.jsx
 * @description Principal Approvals & Digital Signature Sign-Off Dashboard for Cervify.
 * Includes strict validation of Principal digital signature drawing/image upload and security PIN.
 */

import React, { useState, useRef } from 'react';
import { CheckSquare, ShieldCheck, PenTool, CheckCircle2, AlertCircle, FileText, Lock, Award, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { certificateApi } from '../../api/api';
import { mockStore } from '../../api/mockDataStore';
import { validatePin, validateSignature } from '../../utils/validators';
import Modal from '../../components/ui/Modal';

export default function ValidatePage() {
    const { token, activities, refreshData, user } = useAppContext();

    const [selectedActId, setSelectedActId] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [signaturePin, setSignaturePin] = useState('');
    const [validationError, setValidationError] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Canvas Signature State
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureImage, setSignatureImage] = useState('');

    const currentActivity = mockStore.getActivityById(selectedActId);
    const studentsList = mockStore.getStudents();

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

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
        ctx.strokeStyle = '#0F172A';
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

    const handleUploadSignature = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            setSignatureImage(evt.target.result);
            notify('Signature image attached!');
        };
        reader.readAsDataURL(file);
    };

    const handleApproveBatch = async (e) => {
        e.preventDefault();
        setValidationError('');

        // Strict Validations
        const sigVal = validateSignature(signatureImage);
        if (!sigVal.valid) {
            setValidationError(sigVal.message);
            return;
        }

        const pinVal = validatePin(signaturePin);
        if (!pinVal.valid) {
            setValidationError(pinVal.message);
            return;
        }

        try {
            await certificateApi.validate(token, selectedActId, signatureImage, user?.name || 'Principal');
            await refreshData();
            notify(`Batch "${currentActivity?.title || 'Certificates'}" approved and digitally signed!`);
        } catch (err) {
            setValidationError(err.message);
        }
    };

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckSquare size={24} color="var(--primary)" />
                        Principal Approvals & Digital Signature Sign-Off
                    </h2>
                    <p className="page-subtitle">
                        Review submitted student certificate batches, attach your digital signature, and authorize batch release.
                    </p>
                </div>
            </div>

            {/* Select Event Activity Batch */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="var(--primary)" /> Select Submitted Event Batch:
                </label>
                <select
                    className="form-control"
                    value={selectedActId}
                    onChange={e => setSelectedActId(e.target.value)}
                    style={{ fontSize: 13.5, fontWeight: 600 }}
                >
                    <option value="">— Select an Event Batch to Review —</option>
                    {activities.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.title} ({a.department}) — [{a.status === 'APPROVED' ? 'APPROVED' : 'PENDING APPROVAL'}]
                        </option>
                    ))}
                </select>
            </div>

            {!currentActivity ? (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
                    No event batch selected or no pending batches available for review.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                    {/* Left: Batch Summary */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                                    {currentActivity.title}
                                </h3>
                                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                                    Department: <strong>{currentActivity.department}</strong> • Issue Date: <strong>{currentActivity.issueDate}</strong>
                                </div>
                            </div>

                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 12px',
                                borderRadius: 16,
                                fontSize: 11,
                                fontWeight: 700,
                                background: currentActivity.status === 'APPROVED' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                                color: currentActivity.status === 'APPROVED' ? '#059669' : '#D97706'
                            }}>
                                {currentActivity.status === 'APPROVED' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {currentActivity.status === 'APPROVED' ? 'Digitally Signed' : 'Pending Sign-Off'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Certificate Recipients ({studentsList.length}):</h4>
                            <button className="btn btn-secondary" onClick={() => setShowPreviewModal(true)} style={{ fontSize: 12, padding: '4px 10px' }}>
                                <Eye size={13} /> View Roster Details
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table" style={{ fontSize: 12.5 }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Recipient Name</th>
                                        <th>Roll / Reg No</th>
                                        <th>Award Label</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsList.map((st, i) => (
                                        <tr key={st.id || i}>
                                            <td>{i + 1}</td>
                                            <td style={{ fontWeight: 700 }}>{st.name}</td>
                                            <td><span style={{ fontFamily: 'monospace' }}>{st.rollNo}</span></td>
                                            <td>
                                                <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(212, 175, 55, 0.15)', color: '#B8860B', padding: '2px 8px', borderRadius: 8 }}>
                                                    <Award size={11} /> {st.awardLabel || st.category || 'Participant'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Signature & PIN Form */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PenTool size={16} color="var(--primary)" /> Principal Digital Signature
                        </h3>

                        {currentActivity.status === 'APPROVED' ? (
                            <div style={{ textAlign: 'center', padding: 20, background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)', borderRadius: 10 }}>
                                <CheckCircle2 size={32} color="#059669" style={{ marginBottom: 8 }} />
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#059669', margin: '0 0 4px 0' }}>
                                    Batch Approved & Signed
                                </h4>
                                <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>
                                    Signed by <strong>{currentActivity.signatoryName || 'Principal'}</strong> on {currentActivity.signatureDate}.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleApproveBatch}>
                                <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
                                    Draw signature on white backing or upload signature image file:
                                </p>

                                {/* White backing pad */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ border: '1px solid var(--border-strong)', borderRadius: 8, background: '#FFFFFF', overflow: 'hidden' }}>
                                        <canvas
                                            ref={canvasRef}
                                            width={330}
                                            height={120}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            style={{ cursor: 'crosshair', display: 'block', width: '100%', height: 120 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                        <button type="button" onClick={clearCanvas} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>
                                            Clear Signature
                                        </button>
                                        <label style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
                                            Upload Signature Image (.PNG)
                                            <input type="file" accept="image/png, image/jpeg" onChange={handleUploadSignature} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>

                                {validationError && (
                                    <div className="alert-banner alert-danger" style={{ padding: '8px 12px', fontSize: 12 }}>
                                        {validationError}
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label className="form-label" style={{ fontSize: 11 }}>
                                        Principal Security PIN
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter PIN (min 3 chars)"
                                            value={signaturePin}
                                            onChange={e => setSignaturePin(e.target.value)}
                                            style={{ paddingLeft: 36 }}
                                            required
                                        />
                                        <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: 11, fontSize: 13.5 }}
                                >
                                    <ShieldCheck size={16} /> Authorize & Sign Batch
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Roster Details Modal */}
            <Modal title={`Recipient Roster for ${currentActivity?.title}`} isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    <table className="table" style={{ fontSize: 12 }}>
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

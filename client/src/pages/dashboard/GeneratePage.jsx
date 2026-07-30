/**
 * @file GeneratePage.jsx
 * @description Batch Certificate Issue & One-Click ZIP Exporter for Cervify.
 * Enables Event Coordinators to submit batches for Principal approval and download all student certificates in a single ZIP file.
 */

import React, { useState, useRef } from 'react';
import { Award, Download, FolderArchive, CheckCircle2, Clock, ShieldCheck, Sparkles, Send, FileText } from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../../context/AppContext';
import { certificateApi } from '../../api/api';
import { mockStore } from '../../api/mockDataStore';

export default function GeneratePage() {
    const { token, activities, refreshData } = useAppContext();

    const [selectedActId, setSelectedActId] = useState('201');
    const [statusMsg, setStatusMsg] = useState('');
    const [isExportingZip, setIsExportingZip] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const hiddenCertRef = useRef(null);
    const [renderStudent, setRenderStudent] = useState(null);

    const currentActivity = mockStore.getActivityById(selectedActId) || activities[0];
    const studentsList = mockStore.getStudents();

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    const handleSubmitForApproval = async () => {
        await certificateApi.generate(token, selectedActId);
        await refreshData();
        notify('Batch submitted to Principal for review and digital signature!');
    };

    // ── Batch ZIP Export Logic ────────────────────────────────────────────────
    const handleDownloadBatchZip = async () => {
        if (!currentActivity) return;
        setIsExportingZip(true);
        setExportProgress(0);

        try {
            const zip = new JSZip();
            const total = studentsList.length;

            for (let i = 0; i < total; i++) {
                const student = studentsList[i];
                setRenderStudent(student);

                // Wait for DOM render
                await new Promise(r => setTimeout(r, 150));

                if (hiddenCertRef.current) {
                    const canvas = await html2canvas(hiddenCertRef.current, { scale: 2, useCORS: true });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

                    const pdfBlob = pdf.output('blob');
                    const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
                    const safeLabel = (student.awardLabel || 'Cert').replace(/[^a-zA-Z0-9]/g, '_');

                    zip.file(`${i + 1}_${safeName}_${safeLabel}.pdf`, pdfBlob);
                }

                setExportProgress(Math.round(((i + 1) / total) * 100));
            }

            // Generate ZIP file blob
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Cervify_Certificates_${currentActivity.title.replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            notify(`Successfully exported all ${total} certificates in ZIP archive!`);
        } catch (err) {
            notify('ZIP export error: ' + err.message);
        } finally {
            setIsExportingZip(false);
            setRenderStudent(null);
            setExportProgress(0);
        }
    };

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FolderArchive size={26} color="var(--primary)" />
                        Batch Certificate Issue & One-Click ZIP Downloader
                    </h2>
                    <p className="page-subtitle">
                        Submit certificate batches for Principal approval, track approval status, and export all student certificates into a single print-ready ZIP archive.
                    </p>
                </div>
            </div>

            {/* Select Event Activity Batch */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                    Select Event Activity Batch:
                </label>
                <select
                    className="form-control"
                    value={selectedActId}
                    onChange={e => setSelectedActId(e.target.value)}
                    style={{ fontSize: 14, fontWeight: 600, padding: 12 }}
                >
                    {activities.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.title} ({a.department}) — Status: [{a.status}]
                        </option>
                    ))}
                </select>
            </div>

            {currentActivity && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
                    {/* Main Workflow & Action Card */}
                    <div className="card" style={{ padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                                    {currentActivity.title}
                                </h3>
                                <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                                    Organized by: <strong>{currentActivity.department}</strong> • Date: <strong>{currentActivity.issueDate}</strong>
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
                                background: currentActivity.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' :
                                            currentActivity.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: currentActivity.status === 'APPROVED' ? '#10B981' :
                                       currentActivity.status === 'PENDING_APPROVAL' ? '#F59E0B' : '#3B82F6'
                            }}>
                                {currentActivity.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                {currentActivity.status === 'APPROVED' ? 'Approved & Signed by Principal' :
                                 currentActivity.status === 'PENDING_APPROVAL' ? 'Awaiting Principal Signature' : 'Draft Batch'}
                            </span>
                        </div>

                        {/* Summary Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, background: 'var(--bg-surface-2)', padding: 18, borderRadius: 12, marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Total Certificates</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{studentsList.length}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Export Format</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>High-Res PDF in ZIP</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Signatory</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginTop: 4 }}>{currentActivity.signatoryName || 'Dr. Ananya Roy'}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {currentActivity.status === 'DRAFT' && (
                            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: 20, borderRadius: 12 }}>
                                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0', color: '#2563EB' }}>
                                    Step 1: Submit Batch for Principal Approval
                                </h4>
                                <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                                    Student award labels & certificate layouts are mapped. Click below to submit this batch to the Principal's validation queue.
                                </p>
                                <button className="btn btn-primary" onClick={handleSubmitForApproval} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Send size={16} /> Submit Batch to Principal
                                </button>
                            </div>
                        )}

                        {currentActivity.status === 'PENDING_APPROVAL' && (
                            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 20, borderRadius: 12 }}>
                                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px 0', color: '#D97706' }}>
                                    Step 2: Waiting for Principal Sign-Off
                                </h4>
                                <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                                    This batch is currently in the <strong>Principal Approvals Queue</strong>. Switch to the Principal account to review and attach digital signature.
                                </p>
                            </div>
                        )}

                        {currentActivity.status === 'APPROVED' && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: 24, borderRadius: 14 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px 0', color: '#059669', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ShieldCheck size={20} /> Principal Approval Granted! Ready for Distribution
                                </h4>
                                <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                                    The Principal has approved and digitally signed all {studentsList.length} certificates. Click below to download all certificates compressed into a single ZIP archive for instant printing and event distribution.
                                </p>

                                {isExportingZip ? (
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                                            Generating PDFs & Packing ZIP ({exportProgress}%)…
                                        </div>
                                        <div style={{ width: '100%', height: 10, background: 'var(--bg-surface-2)', borderRadius: 5, overflow: 'hidden' }}>
                                            <div style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', transition: 'width 0.2s' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleDownloadBatchZip}
                                        style={{
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px 24px',
                                            borderRadius: 10,
                                            fontSize: 15,
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        <FolderArchive size={20} /> Download All {studentsList.length} Certificates (.ZIP)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Roster Summary */}
                    <div className="card" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0' }}>Included Recipients ({studentsList.length}):</h4>
                        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                            {studentsList.map((st, i) => (
                                <div key={st.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{st.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{st.rollNo}</div>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(212, 175, 55, 0.15)', color: '#B8860B', padding: '2px 8px', borderRadius: 10 }}>
                                        {st.awardLabel || st.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Off-screen Certificate DOM node for html2canvas rendering during ZIP generation */}
            {renderStudent && (
                <div style={{ position: 'fixed', left: -9999, top: -9999 }}>
                    <div
                        ref={hiddenCertRef}
                        style={{
                            width: 1050,
                            height: 740,
                            background: '#FFFBF0',
                            border: '12px double #D4AF37',
                            padding: 48,
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            fontFamily: 'Cinzel, Georgia, serif',
                            color: '#1E293B'
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
                                Institutional Certificate Authority
                            </div>
                            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#D4AF37', margin: '10px 0', letterSpacing: 2 }}>
                                {currentActivity?.certTemplate?.titleText || 'CERTIFICATE OF EXCELLENCE'}
                            </h1>
                            <div style={{ width: 120, height: 3, background: '#D4AF37', margin: '10px auto 16px' }} />
                            <p style={{ fontSize: 16, fontStyle: 'italic', opacity: 0.85, margin: 0 }}>
                                This is proudly presented to
                            </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 34, fontWeight: 800, color: '#1E3A8A', borderBottom: '2px solid #D4AF37', display: 'inline-block', paddingBottom: 6, marginBottom: 12, paddingLeft: 24, paddingRight: 24 }}>
                                {renderStudent.name}
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <span style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid #D4AF37', color: '#B8860B', padding: '4px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                                    {renderStudent.awardLabel || renderStudent.category || 'Certificate of Merit'}
                                </span>
                            </div>
                            <p style={{ fontSize: 14, maxWidth: 650, margin: '0 auto', lineHeight: 1.6, opacity: 0.9 }}>
                                for their outstanding performance, dedication, and achievements in the {currentActivity?.title || 'Institutional Event'}.
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ background: 'white', padding: 4, borderRadius: 4 }}>
                                    <QRCodeSVG value={`https://cervify.edu/verify/CERV-2026-${renderStudent.id || 101}`} size={50} />
                                </div>
                                <div style={{ fontSize: 10, opacity: 0.7 }}>
                                    <div><strong>Certificate ID:</strong> CERV-2026-{renderStudent.id || 101}</div>
                                    <div><strong>SHA-256 Hash:</strong> Verified Authentic</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ height: 28, borderBottom: '1px solid #1E3A8A', width: 130, margin: '0 auto 4px', fontFamily: "'Great Vibes', cursive", fontSize: 20, color: '#1E3A8A' }}>
                                    Dr. Ananya Roy
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700 }}>Dr. Ananya Roy (Principal)</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

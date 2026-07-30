/**
 * @file DesignerPage.jsx
 * @description In-Browser Visual Certificate Studio & Saved Templates Gallery for Cervify.
 * Enables coordinators to design custom templates, save them to an institutional gallery, and load/apply them to events.
 */

import React, { useState, useRef } from 'react';
import { Sparkles, Download, Save, Image as ImageIcon, Layout, Type, QrCode, ShieldCheck, FolderHeart, Trash2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAppContext } from '../../context/AppContext';
import { activityApi } from '../../api/api';
import { mockStore } from '../../api/mockDataStore';
import Modal from '../../components/ui/Modal';

const PAGE_SIZES = [
    { key: 'A4_LANDSCAPE', label: 'A4 Landscape (297 x 210 mm)', widthRatio: '1.414/1' },
    { key: 'A4_PORTRAIT', label: 'A4 Portrait (210 x 297 mm)', widthRatio: '1/1.414' },
    { key: 'LETTER_LANDSCAPE', label: 'US Letter Landscape (11 x 8.5 in)', widthRatio: '1.294/1' },
    { key: 'HD_DIGITAL', label: 'HD Digital Banner (1920 x 1080 px)', widthRatio: '1.777/1' }
];

const PRESET_BACKGROUNDS = [
    { key: 'gold_luxury', label: '🏆 Gold Luxury Frame', border: '6px double #D4AF37', bg: '#FFFBF0' },
    { key: 'silver_academic', label: '🥈 Silver Classic', border: '5px double #9CA3AF', bg: '#F8FAFC' },
    { key: 'royal_crest', label: '🏛️ Royal Crest Navy', border: '6px solid #1E3A8A', bg: '#F0F3FF' },
    { key: 'emerald_distinction', label: '🌿 Emerald Honor', border: '6px solid #065F46', bg: '#F0FDF4' },
    { key: 'minimal_dark', label: '🖤 Executive Dark', border: '4px solid #F59E0B', bg: '#0F172A', textDark: true }
];

export default function DesignerPage() {
    const { token, activities, refreshData } = useAppContext();
    const certRef = useRef(null);

    const [selectedActivityId, setSelectedActivityId] = useState('201');
    const [statusMsg, setStatusMsg] = useState('');
    const [customBgUrl, setCustomBgUrl] = useState('');
    const [showGalleryModal, setShowGalleryModal] = useState(false);

    const sampleStudents = mockStore.getStudents();
    const [previewIndex, setPreviewIndex] = useState(0);
    const activeStudent = sampleStudents[previewIndex] || sampleStudents[0];

    const [config, setConfig] = useState({
        pageSize: 'A4_LANDSCAPE',
        bgPreset: 'gold_luxury',
        titleText: 'CERTIFICATE OF EXCELLENCE',
        subtitleText: 'This is proudly presented to',
        reasonText: 'for outstanding achievements, exceptional effort, and active participation in the institutional event.',
        primaryFont: 'Cinzel, Georgia, serif',
        accentColor: '#1E3A8A',
        titleColor: '#D4AF37',
        nameColor: '#0F172A',
        nameFontSize: 32,
        showQr: true,
        showSeal: true,
        showSignature: true,
        sig1Title: 'Event Coordinator',
        sig2Title: 'Dr. Ananya Roy (Principal)'
    });

    const savedTemplates = mockStore.getSavedTemplates();

    const notify = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

    const handleBgImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            setCustomBgUrl(evt.target.result);
            notify('Custom background image uploaded!');
        };
        reader.readAsDataURL(file);
    };

    // Save Template to Institutional Gallery
    const handleSaveToGallery = async () => {
        const titleName = prompt('Enter a name for this custom template to save in your gallery:', config.titleText);
        if (!titleName) return;

        await activityApi.saveTemplateToGallery(token, {
            ...config,
            title: titleName,
            customBgUrl
        });

        await activityApi.saveCertDesign(token, selectedActivityId, { ...config, customBgUrl });
        await refreshData();
        notify(`Template "${titleName}" saved to gallery and linked to event!`);
    };

    // Load template from gallery into studio
    const handleLoadTemplate = (tmpl) => {
        setConfig({
            pageSize: tmpl.pageSize || 'A4_LANDSCAPE',
            bgPreset: tmpl.bgPreset || 'gold_luxury',
            titleText: tmpl.titleText || 'CERTIFICATE OF EXCELLENCE',
            subtitleText: tmpl.subtitleText || 'This is proudly presented to',
            reasonText: tmpl.reasonText || 'for outstanding performance.',
            primaryFont: tmpl.primaryFont || 'Cinzel, Georgia, serif',
            accentColor: tmpl.accentColor || '#1E3A8A',
            titleColor: tmpl.titleColor || '#D4AF37',
            nameColor: tmpl.nameColor || '#0F172A',
            nameFontSize: tmpl.nameFontSize || 32,
            showQr: tmpl.showQr !== false,
            showSeal: tmpl.showSeal !== false,
            showSignature: tmpl.showSignature !== false,
            sig1Title: tmpl.sig1Title || 'Event Coordinator',
            sig2Title: tmpl.sig2Title || 'Dr. Ananya Roy (Principal)'
        });
        if (tmpl.customBgUrl) setCustomBgUrl(tmpl.customBgUrl);
        setShowGalleryModal(false);
        notify(`Loaded saved template "${tmpl.title}" into Visual Studio!`);
    };

    const handleDeleteSavedTemplate = (id) => {
        mockStore.deleteTemplate(id);
        refreshData();
        notify('Template removed from gallery.');
    };

    const handleDownloadSinglePdf = async () => {
        if (!certRef.current) return;
        try {
            const canvas = await html2canvas(certRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: config.pageSize.includes('PORTRAIT') ? 'portrait' : 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${activeStudent.name.replace(/\s+/g, '_')}_Certificate.pdf`);
            notify('Sample PDF downloaded!');
        } catch (err) {
            notify('PDF export error: ' + err.message);
        }
    };

    const selectedBgStyle = PRESET_BACKGROUNDS.find(b => b.key === config.bgPreset) || PRESET_BACKGROUNDS[0];

    return (
        <div className="page-content">
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={26} color="var(--primary)" />
                        Certificate Studio & Saved Templates Gallery
                    </h2>
                    <p className="page-subtitle">
                        Design custom certificates without Photoshop, manage your library of saved templates, and link them to event activities.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setShowGalleryModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FolderHeart size={16} /> Saved Templates ({savedTemplates.length})
                    </button>
                    <button className="btn btn-secondary" onClick={handleDownloadSinglePdf} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Download size={16} /> Download Sample PDF
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveToGallery} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Save size={16} /> Save Template to Library
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
                {/* ── Design Controls Sidebar ────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Activity Selector */}
                    <div className="card" style={{ padding: 20 }}>
                        <label className="form-label" style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Layout size={16} color="var(--primary)" /> Link Design to Event Activity
                        </label>
                        <select
                            className="form-control"
                            value={selectedActivityId}
                            onChange={e => setSelectedActivityId(e.target.value)}
                        >
                            {activities.map(a => (
                                <option key={a.id} value={a.id}>{a.title || a.act_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Canvas Dimensions & Background */}
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ImageIcon size={16} color="var(--primary)" /> Canvas Dimensions & Background
                        </h3>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Document Size (Word/Canva Style)</label>
                            <select
                                className="form-control"
                                value={config.pageSize}
                                onChange={e => setConfig({ ...config, pageSize: e.target.value })}
                            >
                                {PAGE_SIZES.map(p => (
                                    <option key={p.key} value={p.key}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Upload Custom Background Image (.PNG / .JPG)</label>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleBgImageUpload}
                                className="form-control"
                                style={{ fontSize: 12, padding: 6 }}
                            />
                            {customBgUrl && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCustomBgUrl('')}
                                    style={{ marginTop: 8, fontSize: 11, padding: '4px 8px' }}
                                >
                                    Remove Background Image
                                </button>
                            )}
                        </div>

                        {!customBgUrl && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Preset Border Frame Style</label>
                                <select
                                    className="form-control"
                                    value={config.bgPreset}
                                    onChange={e => setConfig({ ...config, bgPreset: e.target.value })}
                                >
                                    {PRESET_BACKGROUNDS.map(b => (
                                        <option key={b.key} value={b.key}>{b.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Typography & Text */}
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Type size={16} color="var(--primary)" /> Typography & Content
                        </h3>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Primary Font Family</label>
                            <select
                                className="form-control"
                                value={config.primaryFont}
                                onChange={e => setConfig({ ...config, primaryFont: e.target.value })}
                            >
                                <option value="Cinzel, Georgia, serif">Cinzel (Classic Royal Serif)</option>
                                <option value="'Playfair Display', Georgia, serif">Playfair Display (Elegant Serif)</option>
                                <option value="'Great Vibes', cursive">Great Vibes (Calligraphy Cursive)</option>
                                <option value="Montserrat, sans-serif">Montserrat (Modern Clean)</option>
                                <option value="Inter, sans-serif">Inter (Corporate Sans)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Main Header Title</label>
                            <input
                                type="text"
                                className="form-control"
                                value={config.titleText}
                                onChange={e => setConfig({ ...config, titleText: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Subtitle Line</label>
                            <input
                                type="text"
                                className="form-control"
                                value={config.subtitleText}
                                onChange={e => setConfig({ ...config, subtitleText: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Recipient Name Size ({config.nameFontSize}px)</label>
                            <input
                                type="range"
                                min={20}
                                max={48}
                                value={config.nameFontSize}
                                onChange={e => setConfig({ ...config, nameFontSize: Number(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Live Studio Canvas ────────────────────────────────────────── */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-surface)',
                        padding: '12px 20px',
                        borderRadius: 12,
                        marginBottom: 16,
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                            Live Student Preview ({previewIndex + 1} of {sampleStudents.length}):
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                                className="btn btn-secondary"
                                disabled={previewIndex === 0}
                                onClick={() => setPreviewIndex(p => Math.max(0, p - 1))}
                                style={{ fontSize: 12, padding: '4px 10px' }}
                            >
                                ◀ Previous
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                                {activeStudent.name} ({activeStudent.category || activeStudent.awardLabel})
                            </span>
                            <button
                                className="btn btn-secondary"
                                disabled={previewIndex === sampleStudents.length - 1}
                                onClick={() => setPreviewIndex(p => Math.min(sampleStudents.length - 1, p + 1))}
                                style={{ fontSize: 12, padding: '4px 10px' }}
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>

                    {/* Rendered Canvas Box */}
                    <div
                        ref={certRef}
                        style={{
                            width: '100%',
                            aspectRatio: config.pageSize.includes('PORTRAIT') ? '1/1.414' : '1.414/1',
                            background: customBgUrl ? `url(${customBgUrl}) center/cover no-repeat` : selectedBgStyle.bg,
                            border: customBgUrl ? '1px solid #CBD5E1' : selectedBgStyle.border,
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                            borderRadius: 8,
                            padding: '48px 56px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            fontFamily: config.primaryFont,
                            color: selectedBgStyle.textDark ? '#FFFFFF' : '#1E293B',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, opacity: 0.8, marginBottom: 6 }}>
                                National Institute of Academic Excellence
                            </div>
                            <h1 style={{ fontSize: 30, fontWeight: 800, margin: '8px 0', color: config.titleColor, letterSpacing: 2, fontFamily: config.primaryFont }}>
                                {config.titleText}
                            </h1>
                            <div style={{ width: 120, height: 3, background: config.titleColor, margin: '10px auto 16px' }} />
                            <p style={{ fontSize: 15, fontStyle: 'italic', opacity: 0.85, margin: 0 }}>
                                {config.subtitleText}
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', margin: '24px 0' }}>
                            <div style={{
                                fontSize: config.nameFontSize,
                                fontWeight: 800,
                                color: selectedBgStyle.textDark ? '#F59E0B' : config.accentColor,
                                borderBottom: `2px solid ${config.titleColor}`,
                                display: 'inline-block',
                                paddingBottom: 6,
                                marginBottom: 12,
                                paddingLeft: 24,
                                paddingRight: 24
                            }}>
                                {activeStudent.name}
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <span style={{
                                    background: 'rgba(212, 175, 55, 0.15)',
                                    border: '1px solid #D4AF37',
                                    color: selectedBgStyle.textDark ? '#FBBF24' : '#B8860B',
                                    padding: '4px 16px',
                                    borderRadius: 20,
                                    fontSize: 13,
                                    fontWeight: 700
                                }}>
                                    {activeStudent.awardLabel || activeStudent.category || 'Certificate of Merit'}
                                </span>
                            </div>

                            <p style={{ fontSize: 13, maxWidth: 560, margin: '0 auto', lineHeight: 1.6, opacity: 0.9 }}>
                                {config.reasonText}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ background: 'white', padding: 6, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                    <QRCodeSVG value={`https://cervify.edu/verify/CERV-2026-${activeStudent.id || 101}`} size={54} />
                                </div>
                                <div style={{ fontSize: 10, opacity: 0.7 }}>
                                    <div><strong>Certificate ID:</strong> CERV-2026-{activeStudent.id || 101}</div>
                                    <div><strong>SHA-256 Auth:</strong> Verified Offline</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 32 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ height: 28, borderBottom: '1px solid currentColor', width: 110, margin: '0 auto 4px' }} />
                                    <div style={{ fontSize: 11, fontWeight: 700 }}>{config.sig1Title}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        height: 28,
                                        borderBottom: '1px solid currentColor',
                                        width: 110,
                                        margin: '0 auto 4px',
                                        fontFamily: "'Great Vibes', cursive",
                                        fontSize: 18,
                                        color: '#1E3A8A'
                                    }}>
                                        Dr. Ananya Roy
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700 }}>{config.sig2Title}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Saved Templates Gallery Modal ────────────────────────────────────── */}
            <Modal title="Institutional Saved Templates Library" isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)}>
                <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
                    Here are all saved certificate designs created by Event Coordinators. Click <strong>"Load & Apply Template"</strong> to load any template into the studio canvas.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxHeight: 400, overflowY: 'auto' }}>
                    {savedTemplates.map(tmpl => (
                        <div key={tmpl.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--bg-surface)' }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {tmpl.title}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 12 }}>
                                Saved: {tmpl.savedAt} • Size: {tmpl.pageSize}
                            </div>

                            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleLoadTemplate(tmpl)}
                                    style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                    <CheckCircle2 size={14} /> Load & Apply
                                </button>
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDeleteSavedTemplate(tmpl.id)}
                                    title="Delete template"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

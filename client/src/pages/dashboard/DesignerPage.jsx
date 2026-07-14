/**
 * @file DesignerPage.jsx
 * @description Visual certificate template designer for Cervify.
 *
 * Allows coordinators and admins to configure the visual design of certificates
 * for a specific activity and preview them in real time.
 *
 * Design options:
 *  - Title text and subtext
 *  - Border style: double | gold | classic | modern
 *  - Background colour picker
 *  - Font family: serif | sans-serif | cursive
 *  - Signature line 1 and Signature line 2 labels
 *
 * On "Save Template", the configuration is posted to the backend as JSON via
 * POST /api/activities/:id/cert-design-json.
 *
 * On "Download Preview PDF", a sample certificate PDF is generated locally using
 * jsPDF (no server round-trip needed for the preview).
 */

import React, { useState } from 'react';
import { Settings, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppContext } from '../../context/AppContext';
import { activityApi } from '../../api/api';

/** Border style options with descriptive labels. */
const BORDER_STYLES = [
    { key: 'double',  label: 'Double Line'   },
    { key: 'gold',    label: 'Gold Frame'     },
    { key: 'classic', label: 'Classic Border' },
    { key: 'modern',  label: 'Minimal Modern' }
];

/** @returns {JSX.Element} */
export default function DesignerPage() {
    const { token, activities, refreshData } = useAppContext();

    const [designActivityId, setDesignActivityId] = useState('');
    const [config, setConfig] = useState({
        title:   'Certificate of Achievement',
        subtext: 'This is proudly presented to',
        border:  'double',
        bg:      '#fffbf4',
        font:    'serif',
        sig1:    'Project Guide',
        sig2:    'Principal'
    });
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg,  setErrorMsg]  = useState('');

    const notify = (msg, isError = false) => {
        if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); }
        else         { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); }
    };

    const set = (key) => (e) => setConfig(prev => ({ ...prev, [key]: e.target.value }));

    // ── Save template configuration ───────────────────────────────────────────
    const handleSave = async () => {
        if (!designActivityId) return notify('Please select an activity first.', true);
        try {
            await activityApi.saveCertDesign(token, designActivityId, config);
            await refreshData();
            notify('Certificate template configuration saved successfully.');
        } catch (err) { notify(err.message, true); }
    };

    // ── Generate PDF preview using jsPDF ──────────────────────────────────────
    const downloadPreview = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        // Background
        doc.setFillColor(config.bg);
        doc.rect(0, 0, W, H, 'F');

        // Border
        const m = 10;
        doc.setDrawColor(config.border === 'gold' ? '#c8a84b' : '#1a1a2e');
        doc.setLineWidth(config.border === 'modern' ? 0.5 : 1.5);
        doc.rect(m, m, W - m * 2, H - m * 2);
        if (config.border === 'double') {
            doc.setLineWidth(0.5);
            doc.rect(m + 4, m + 4, W - (m + 4) * 2, H - (m + 4) * 2);
        }

        // Title
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(config.border === 'gold' ? '#b8860b' : '#1a1a2e');
        doc.text(config.title, W / 2, 50, { align: 'center' });

        // Subtext
        doc.setFontSize(14);
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'italic');
        doc.text(config.subtext, W / 2, 68, { align: 'center' });

        // Recipient placeholder
        doc.setFontSize(22);
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'bold');
        doc.text('[Recipient Name]', W / 2, 92, { align: 'center' });

        // Description
        doc.setFontSize(11);
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'normal');
        doc.text('for their outstanding participation and contribution in the activity:', W / 2, 108, { align: 'center' });
        doc.setFontSize(13);
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'bold');
        doc.text('[Activity Name]', W / 2, 120, { align: 'center' });

        // Signature lines
        const lineY = H - 38;
        const col1X = W * 0.25, col2X = W * 0.75;
        doc.setLineWidth(0.5);
        doc.setDrawColor('#333');
        doc.line(col1X - 35, lineY, col1X + 35, lineY);
        doc.line(col2X - 35, lineY, col2X + 35, lineY);
        doc.setFontSize(11);
        doc.setFont(config.font === 'sans-serif' ? 'helvetica' : 'times', 'normal');
        doc.text(config.sig1, col1X, lineY + 8, { align: 'center' });
        doc.text(config.sig2, col2X, lineY + 8, { align: 'center' });

        doc.save('cervify_certificate_preview.pdf');
    };

    return (
        <div className="page-content">

            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}
            {errorMsg  && <div className="alert-banner alert-danger">{errorMsg}</div>}

            {/* ── Page Header ───────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        <Settings size={24} style={{ color: 'var(--primary)' }} />
                        Template Designer
                    </h2>
                    <p className="page-subtitle">Customise the visual certificate template for a specific activity.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={downloadPreview}>
                        <Download size={16} aria-hidden="true" /> Download Preview PDF
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!designActivityId}>
                        Save Template
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

                {/* ── Configuration Panel ─────────────────────────── */}
                <div className="card">
                    <h3 style={{ fontSize: 14, marginBottom: 20 }}>Design Settings</h3>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-activity">Link to Activity</label>
                        <select id="design-activity" className="form-control" value={designActivityId} onChange={e => setDesignActivityId(e.target.value)}>
                            <option value="">— Choose an activity —</option>
                            {activities.map(a => <option key={a.id} value={a.id}>{a.act_name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-title">Certificate Title</label>
                        <input id="design-title" type="text" className="form-control" value={config.title} onChange={set('title')} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-subtext">Subtext / Tagline</label>
                        <input id="design-subtext" type="text" className="form-control" value={config.subtext} onChange={set('subtext')} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-border">Border Style</label>
                        <select id="design-border" className="form-control" value={config.border} onChange={set('border')}>
                            {BORDER_STYLES.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-bg">Background Colour</label>
                        <input id="design-bg" type="color" className="form-control" value={config.bg} onChange={set('bg')} style={{ height: 40, padding: 4 }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="design-font">Font Family</label>
                        <select id="design-font" className="form-control" value={config.font} onChange={set('font')}>
                            <option value="serif">Serif (Traditional)</option>
                            <option value="sans-serif">Sans-serif (Modern)</option>
                            <option value="cursive">Cursive (Elegant)</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" htmlFor="design-sig1">Signature 1</label>
                            <input id="design-sig1" type="text" className="form-control" value={config.sig1} onChange={set('sig1')} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" htmlFor="design-sig2">Signature 2</label>
                            <input id="design-sig2" type="text" className="form-control" value={config.sig2} onChange={set('sig2')} />
                        </div>
                    </div>
                </div>

                {/* ── Live Preview Card ──────────────────────────────── */}
                <div
                    className="card"
                    style={{
                        minHeight: 360, padding: 32, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                        fontFamily: config.font,
                        backgroundColor: config.bg,
                        border: config.border === 'gold'
                            ? '4px solid #c8a84b'
                            : config.border === 'modern'
                                ? '1px solid var(--border)'
                                : '3px solid var(--primary)',
                        boxShadow: config.border === 'double' ? `inset 0 0 0 6px ${config.bg}, inset 0 0 0 9px var(--primary)` : undefined
                    }}
                    role="img"
                    aria-label="Certificate preview"
                >
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 12, letterSpacing: 4, textTransform: 'uppercase' }}>
                        Dnyanprassarak Mandal's College
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: config.border === 'gold' ? '#b8860b' : 'var(--text)', marginBottom: 8 }}>
                        {config.title}
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
                        {config.subtext}
                    </p>
                    <div style={{ fontSize: 22, fontWeight: 700, borderBottom: '2px solid var(--primary)', paddingBottom: 8, marginBottom: 16, minWidth: 260 }}>
                        [Recipient Name]
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
                        for their outstanding participation and contribution in the activity conducted by the Department.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 12 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: '1px solid #333', paddingTop: 4, marginTop: 24 }}>{config.sig1}</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: '1px solid #333', paddingTop: 4, marginTop: 24 }}>{config.sig2}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

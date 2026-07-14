/**
 * @file GeneratePage.jsx
 * @description Certificate generation and record-freezing page for Cervify (admin-only).
 *
 * Workflow:
 *  1. Admin selects an activity from the dropdown.
 *  2. Admin selects the certificate template type (Participation, Winner, etc.)
 *  3. Admin clicks "Generate Certificates" — calls POST /api/certificates/generate
 *     which assigns unique CERV-XXXXXX-XXXXXX numbers to all pending participants.
 *  4. Admin can optionally "Freeze Records" — calls POST /api/certificates/freeze
 *     which locks the activity so no further changes can be made (irreversible).
 *
 * After generating, the admin hands off to the Principal for validation.
 */

import React, { useState } from 'react';
import { Award, Lock, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { certificateApi } from '../../api/api';

/**
 * @returns {JSX.Element}
 */
export default function GeneratePage() {
    const { token, activities, refreshData } = useAppContext();

    const [actId,        setActId]        = useState('');
    const [templateType, setTemplateType] = useState('Participation');
    const [statusMsg,    setStatusMsg]    = useState('');
    const [errorMsg,     setErrorMsg]     = useState('');
    const [isLoading,    setIsLoading]    = useState(false);

    const notify = (msg, isError = false) => {
        if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); }
        else         { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 5000); }
    };

    // ── Generate certificates ─────────────────────────────────────────────────
    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!actId) return notify('Please select an activity.', true);
        setIsLoading(true);
        try {
            const result = await certificateApi.generate(token, Number(actId), templateType);
            await refreshData();
            notify(result.message);
        } catch (err) { notify(err.message, true); }
        finally { setIsLoading(false); }
    };

    // ── Freeze activity records ───────────────────────────────────────────────
    const handleFreeze = async () => {
        if (!actId) return notify('Please select an activity.', true);
        if (!window.confirm('⚠️ Freezing activity records is PERMANENT. No further changes will be possible. Proceed?')) return;
        try {
            const result = await certificateApi.freeze(token, Number(actId));
            await refreshData();
            notify(result.message);
        } catch (err) { notify(err.message, true); }
    };

    const selectedActivity = activities.find(a => String(a.id) === String(actId));

    return (
        <div className="page-content">

            {/* ── Banners ───────────────────────────────────────────── */}
            {statusMsg && <div className="alert-banner alert-success">{statusMsg}</div>}
            {errorMsg  && <div className="alert-banner alert-danger">{errorMsg}</div>}

            {/* ── Page Header ───────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        <Award size={24} style={{ color: 'var(--primary)' }} />
                        Issue Certificates
                    </h2>
                    <p className="page-subtitle">
                        Select an activity and certificate template type, then bulk-generate
                        unique certificate numbers for all pending participants.
                    </p>
                </div>
            </div>

            {/* ── Generator Form ─────────────────────────────────────── */}
            <div className="card" style={{ maxWidth: 540 }}>
                <h3 style={{ fontSize: 15, marginBottom: 24 }}>Certificate Generation Wizard</h3>
                <form onSubmit={handleGenerate}>

                    {/* Activity selector */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="gen-activity">Activity / Event</label>
                        <select id="gen-activity" className="form-control" value={actId} onChange={e => setActId(e.target.value)}>
                            <option value="">— Select an activity —</option>
                            {activities.filter(a => a.status !== 2).map(a => (
                                <option key={a.id} value={a.id}>{a.act_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Template type selector */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="gen-template">Certificate Template Type</label>
                        <select id="gen-template" className="form-control" value={templateType} onChange={e => setTemplateType(e.target.value)}>
                            {['Participation', 'Winner', 'Runner Up', 'Coordinator', 'Organiser', 'Resource Person'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selected activity info */}
                    {selectedActivity && (
                        <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13 }}>
                            <strong>{selectedActivity.act_name}</strong>
                            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                                {selectedActivity.f_date} → {selectedActivity.t_date}
                                {selectedActivity.category && ` · ${selectedActivity.category}`}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={isLoading || !actId} style={{ flex: 1 }}>
                            <Award size={16} aria-hidden="true" />
                            {isLoading ? 'Generating…' : 'Generate Certificates'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={!actId}
                            onClick={handleFreeze}
                            title="Permanently freeze all records for this activity"
                        >
                            <Lock size={16} aria-hidden="true" /> Freeze Records
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Info Panel ────────────────────────────────────────── */}
            <div className="card" style={{ maxWidth: 540, marginTop: 24, borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--primary)', fontSize: 14 }}>How it works</h4>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 2, color: 'var(--text-secondary)' }}>
                    <li>Use the <strong>Activity Log</strong> to register the event and add participants.</li>
                    <li>Come back here, select the activity, and click <strong>Generate Certificates</strong>.</li>
                    <li>The system assigns a unique <code>CERV-XXXXXX-XXXXXX</code> number to each participant.</li>
                    <li>The Principal can then <strong>validate and approve</strong> the certificates from their dashboard.</li>
                    <li>Finally, use the <strong>Freeze Records</strong> button to lock the activity permanently.</li>
                </ol>
            </div>
        </div>
    );
}

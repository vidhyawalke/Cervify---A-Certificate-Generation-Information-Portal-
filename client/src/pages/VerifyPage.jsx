/**
 * @file VerifyPage.jsx
 * @description Public certificate authenticity verification page for Cervify.
 *
 * Anyone — without logging in — can access this page and search for a certificate
 * by entering its unique certificate number (e.g. CERV-202223-748392).
 *
 * On a successful lookup the page displays:
 *  - Validation status badge (VERIFIED GENUINE vs. PENDING VALIDATION)
 *  - Recipient name and identifying details
 *  - Activity name, date range, category, and collaborating agency
 *
 * Uses `verifyApi.check()` from the centralised API layer.
 * Does not require authentication (public endpoint on the backend).
 */

import React, { useState } from 'react';
import { Award, Search, Check, X, Lock, Compass } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { verifyApi } from '../api/api';

/**
 * @returns {JSX.Element}
 */
export default function VerifyPage() {
    const { setCurrentView } = useAppContext();

    const [query,   setQuery]   = useState('');
    const [result,  setResult]  = useState(null);
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    // ── Search handler ────────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setResult(null);
        setError('');
        setLoading(true);

        try {
            const data = await verifyApi.check(query.trim());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Certificate not found.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-container">

            {/* ── Back to login ─────────────────────────────────────── */}
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => { setCurrentView('login'); setResult(null); setQuery(''); }}
                >
                    Back to Portal Login
                </button>
            </div>

            {/* ── Verifier Card ─────────────────────────────────────── */}
            <div className="card card-glass verify-box">

                {/* Brand */}
                <div className="sidebar-logo" style={{ justifyContent: 'center', marginBottom: 16 }}>
                    <Award size={36} style={{ color: 'var(--primary)' }} aria-hidden="true" />
                    <span>CERVIFY</span>
                </div>

                <h1 style={{ fontSize: 24, marginBottom: 8 }}>Public Certificate Authenticator</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                    Verify the validity and authenticity of any certificate issued by our organisation.
                    Enter the certificate number printed on the document.
                </p>

                {/* ── Search Form ──────────────────────────────────── */}
                <form onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <Search className="search-icon-inside" size={20} aria-hidden="true" />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. CERV-202223-748392"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            aria-label="Certificate number input"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: 12 }}
                        disabled={loading}
                    >
                        {loading ? 'Searching…' : 'Check Certificate Validity'}
                    </button>
                </form>

                {/* ── Error Banner ──────────────────────────────────── */}
                {error && (
                    <div className="alert-banner alert-danger" style={{ marginTop: 24 }} role="alert">
                        <X size={18} aria-hidden="true" /> {error}
                    </div>
                )}

                {/* ── Result Card ───────────────────────────────────── */}
                {result && (
                    <div
                        className="verification-result card"
                        style={{
                            borderColor: result.status === 2 ? 'var(--success)' : 'var(--warning)',
                            backgroundColor: 'var(--bg-app)',
                            marginTop: 32,
                            padding: 20,
                            textAlign: 'left'
                        }}
                        role="region"
                        aria-label="Certificate verification result"
                    >
                        {/* Status badge */}
                        <div style={{ marginBottom: 16 }}>
                            {result.status === 2 ? (
                                <span className="badge badge-success">
                                    <Check size={14} style={{ marginRight: 4 }} aria-hidden="true" />
                                    VERIFIED GENUINE — Approved by Principal
                                </span>
                            ) : (
                                <span className="badge badge-warning">
                                    <Lock size={14} style={{ marginRight: 4 }} aria-hidden="true" />
                                    PENDING PRINCIPAL VALIDATION
                                </span>
                            )}
                        </div>

                        {/* Detail grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 13 }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>RECIPIENT NAME</div>
                                <div style={{ fontSize: 16, fontWeight: 700 }}>{result.recipient_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{result.recipient_info}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>CERTIFICATE NUMBER</div>
                                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>{result.certificate_no}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{result.certificate_type}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>ACTIVITY / EVENT</div>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>{result.activity_name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    Category: {result.category} &nbsp;|&nbsp; Dates: {result.activity_date}
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 }}>COLLABORATING AGENCY</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{result.agency}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

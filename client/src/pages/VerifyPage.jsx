/**
 * @file VerifyPage.jsx
 * @description Public Offline SHA-256 Certificate Authenticator for Cervify.
 * Enables students, employers, and external parties to instantly verify certificate authenticity.
 */

import React, { useState } from 'react';
import { Award, Search, CheckCircle2, ShieldCheck, ArrowLeft, Lock, Calendar, User, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { verifyApi } from '../api/api';
import logoImg from '../assets/logo.png';

export default function VerifyPage() {
    const { setCurrentView } = useAppContext();

    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            setError(err.message || 'Certificate record not found.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative'
        }}>
            {/* Top Navigation */}
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => { setCurrentView('login'); setResult(null); setQuery(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                    <ArrowLeft size={16} /> Back to Institutional Portal
                </button>
            </div>

            <div style={{ width: '100%', maxWidth: 540, background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(20px)', padding: 36, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <img src={logoImg} alt="Cervify" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }} />
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: 'white' }}>
                        Public Certificate Authenticator
                    </h1>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                        Verify the authenticity of any institutional certificate offline via cryptographic SHA-256 hash.
                    </p>
                </div>

                <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                    <div style={{ position: 'relative', marginBottom: 14 }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Certificate ID or Student Roll No (e.g. CERV-2026-101)..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                background: '#0F172A',
                                border: '1px solid #334155',
                                padding: '14px 16px 14px 44px',
                                borderRadius: 12,
                                color: 'white',
                                fontSize: 14,
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                        <Search size={18} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            padding: 13,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Validating Cryptographic Hash…' : (
                            <>
                                <ShieldCheck size={18} /> Check Certificate Authenticity
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: 14, borderRadius: 10, fontSize: 13 }}>
                        {error}
                    </div>
                )}

                {result && (
                    <div style={{ background: '#0F172A', border: '1px solid #334155', padding: 24, borderRadius: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 18 }}>
                            <CheckCircle2 size={16} /> VERIFIED GENUINE • SHA-256 Cryptographic Hash Valid
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Recipient Name</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 2 }}>{result.studentName}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{result.rollNo}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Certificate ID</div>
                                <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#F59E0B', marginTop: 2 }}>{result.certNo}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{result.awardLabel}</div>
                            </div>

                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid #1E293B', paddingTop: 14 }}>
                                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Event Activity</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginTop: 2 }}>{result.eventName}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>Issued: {result.issueDate} • Dept: {result.department}</div>
                            </div>

                            <div style={{ gridColumn: 'span 2', background: '#1E293B', padding: 12, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', color: '#34D399', wordBreak: 'break-all' }}>
                                Hash: {result.hash}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

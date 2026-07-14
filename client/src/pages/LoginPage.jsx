/**
 * @file LoginPage.jsx
 * @description Academic login portal for Cervify — Figma design template.
 *
 * Design features:
 *  - Two-panel layout: forest green brand panel (left) + clean form (right)
 *  - Nunito typography + DM Serif Display headings
 *  - Forest green / amber color system
 *  - Role selector cards with green active state
 *  - Glassmorphism form card with top accent bar
 *  - Google OAuth 2.0 + mock bypass
 *  - OAuth Client ID configuration modal
 */

import React, { useState, useEffect } from 'react';
import {
    Award, Shield, Users, CheckSquare,
    Settings, Compass, Lock, Sparkles, Eye, EyeOff,
    Check, ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api/api';
import Modal from '../components/ui/Modal';
import logoImg from '../assets/logo.png';

/** @returns {JSX.Element} */
export default function LoginPage() {
    const {
        login, setCurrentView,
        googleClientId, saveGoogleClientId
    } = useAppContext();

    const [selectedRole, setSelectedRole] = useState('admin');
    const [username,     setUsername]     = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg,     setErrorMsg]     = useState('');
    const [isLoading,    setIsLoading]    = useState(false);

    const [showOauthModal, setShowOauthModal] = useState(false);
    const [clientIdInput,  setClientIdInput]  = useState(googleClientId);

    // ── Google SDK ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!googleClientId || !window.google) return;
        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback:  handleRealGoogleResponse
        });
        window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn-container'),
            { theme: 'filled_black', size: 'large', width: 380 }
        );
    }, [googleClientId]);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const data = await authApi.login({ username, password });
            login(data);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRealGoogleResponse = async (response) => {
        setErrorMsg('');
        try {
            const data = await authApi.googleLogin(response.credential);
            login(data);
        } catch (err) { setErrorMsg(err.message); }
    };

    const handleMockLogin = async (role) => {
        setErrorMsg('');
        setIsLoading(true);
        try {
            const data = await authApi.googleLogin(`mock_token_${role}`);
            login(data);
        } catch (err) { setErrorMsg(err.message); }
        finally { setIsLoading(false); }
    };

    const handleSaveClientId = () => {
        saveGoogleClientId(clientIdInput);
        setShowOauthModal(false);
    };

    const roles = [
        { key: 'admin',       label: 'Admin',       Icon: Shield      },
        { key: 'coordinator', label: 'Coordinator', Icon: Users       },
        { key: 'principal',   label: 'Principal',   Icon: CheckSquare }
    ];

    const features = [
        'Coordinator, Principal & Admin roles',
        'Instant PDF certificate generation',
        'Full audit trail and traceability',
    ];

    return (
        <div className="portal-container">

            {/* ── Left Brand Panel ───────────────────────────────────── */}
            <div className="portal-left-panel">
                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <button
                        onClick={() => setCurrentView('verify')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'none', border: 'none', cursor: 'pointer'
                        }}
                    >
                        <img src={logoImg} alt="Cervify Logo" style={{
                            width: 38, height: 38, objectFit: 'contain',
                            filter: 'brightness(0) invert(1)', opacity: 0.90
                        }} />
                        <span style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 18, fontWeight: 800,
                            letterSpacing: 2, color: 'white'
                        }}>CERVIFY</span>
                    </button>
                </div>

                {/* Hero copy */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 38,
                        color: 'white',
                        lineHeight: 1.25,
                        marginBottom: 16
                    }}>
                        Empowering<br /><em>Academic</em><br />Excellence
                    </h2>
                    <p style={{
                        color: 'rgba(226, 237, 230, 0.72)',
                        fontSize: 15,
                        lineHeight: 1.7,
                        marginBottom: 28
                    }}>
                        Issue, approve, and manage student certificates with a system built for the rigor of academic institutions.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {features.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                fontSize: 14, color: 'rgba(226, 237, 230, 0.85)'
                            }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: '#C8841A',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Check size={11} color="white" strokeWidth={3} />
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    position: 'relative', zIndex: 1,
                    color: 'rgba(226, 237, 230, 0.35)', fontSize: 12
                }}>
                    © 2024 Cervify — Academic Certification Portal
                </div>
            </div>

            {/* ── Right Form Panel ───────────────────────────────────── */}
            <div className="portal-right-panel">
                {/* Utility Buttons */}
                <div style={{
                    position: 'absolute', top: 20, right: 20,
                    display: 'flex', gap: 8, zIndex: 20
                }}>
                    <button
                        className="btn btn-secondary"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                        onClick={() => setCurrentView('verify')}
                    >
                        <Compass size={13} /> Public Verifier
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                        onClick={() => setShowOauthModal(true)}
                    >
                        <Settings size={13} /> OAuth Config
                    </button>
                </div>

                {/* ── Login Card ────────────────────────────────────────── */}
                <div className="portal-card">

                    {/* Brand header (mobile only — desktop has left panel) */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <img src={logoImg} alt="Cervify" style={{
                            width: 56, height: 56, objectFit: 'contain',
                            marginBottom: 14
                        }} />
                        <h1 className="portal-title">Welcome back</h1>
                        <p className="portal-subtitle">Sign in to your institutional portal</p>
                    </div>

                    {/* Error */}
                    {errorMsg && (
                        <div className="alert-banner alert-danger" role="alert" style={{ marginBottom: 16 }}>
                            <Lock size={14} /> {errorMsg}
                        </div>
                    )}

                    {/* ── Role Selector ─────────────────────────────────── */}
                    <div className="role-selectors">
                        {roles.map(({ key, label, Icon }) => (
                            <div
                                key={key}
                                className={`role-card${selectedRole === key ? ' active' : ''}`}
                                onClick={() => setSelectedRole(key)}
                                role="button"
                                aria-pressed={selectedRole === key}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setSelectedRole(key)}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Password Login Form ───────────────────────────── */}
                    <form onSubmit={handlePasswordLogin} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-username">Username</label>
                            <input
                                id="login-username"
                                type="text"
                                className="form-control"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    style={{ paddingRight: 44 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: 'var(--text-light)',
                                        display: 'flex', alignItems: 'center'
                                    }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: 14 }}
                            disabled={isLoading}
                            id="login-submit-btn"
                        >
                            {isLoading ? (
                                <>
                                    <span style={{
                                        width: 14, height: 14,
                                        border: '2px solid rgba(255,255,255,0.35)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'spin 0.7s linear infinite'
                                    }} />
                                    Signing In…
                                </>
                            ) : (
                                <>
                                    Sign In to Portal <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* ── OAuth Section ──────────────────────────────────── */}
                    <div className="oauth-divider">or continue with Google</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        {googleClientId ? (
                            <div id="google-signin-btn-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                        ) : (
                            <p style={{ fontSize: 11.5, color: 'var(--text-light)', margin: 0, textAlign: 'center' }}>
                                No Google Client ID configured. Use mock sign-in below or click "OAuth Config".
                            </p>
                        )}

                        {/* Dev mock login */}
                        <button
                            className="btn btn-oauth"
                            onClick={() => handleMockLogin(selectedRole)}
                            style={{ width: '100%', fontSize: 13 }}
                            title={`Dev bypass — signs in as ${selectedRole}@cervify.org`}
                        >
                            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                            Quick Sign In as <strong style={{ color: 'var(--primary)', marginLeft: 4 }}>{selectedRole.toUpperCase()}</strong>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: 9, fontWeight: 700,
                                background: 'rgba(42, 90, 143, 0.12)',
                                color: 'var(--primary)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                letterSpacing: 0.5
                            }}>DEV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── OAuth Configure Modal ─────────────────────────────── */}
            <Modal title="Configure Google OAuth 2.0" isOpen={showOauthModal} onClose={() => setShowOauthModal(false)}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
                    Get your Client ID from the{' '}
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Google Cloud Console</span>.
                    Add <code style={{ background: 'var(--bg-surface-2)', padding: '1px 6px', borderRadius: 4 }}>http://localhost:5173</code>{' '}
                    as an authorised JavaScript origin.
                </p>
                <div className="form-group">
                    <label className="form-label" htmlFor="oauth-client-id">Google Client ID</label>
                    <input
                        id="oauth-client-id"
                        type="text"
                        className="form-control"
                        placeholder="xxxxxx.apps.googleusercontent.com"
                        value={clientIdInput}
                        onChange={e => setClientIdInput(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setShowOauthModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSaveClientId}>Save &amp; Apply</button>
                </div>
            </Modal>

            {/* Spin animation for loading state */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

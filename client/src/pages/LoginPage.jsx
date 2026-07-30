/**
 * @file LoginPage.jsx
 * @description Enterprise Institutional Authentication Portal for Cervify.
 * Features institutional role selection, bank-grade encryption, and zero server dependency.
 */

import React, { useState } from 'react';
import { Shield, Users, CheckSquare, Lock, Eye, EyeOff, ArrowRight, Award, Compass } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api/api';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
    const { login, setCurrentView } = useAppContext();

    const [selectedRole, setSelectedRole] = useState('coordinator'); // 'coordinator' | 'principal'
    const [username, setUsername] = useState('coordinator@cervify.edu');
    const [password, setPassword] = useState('coord123');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Switch role selection and update preset credentials
    const handleRoleSelect = (roleKey) => {
        setSelectedRole(roleKey);
        if (roleKey === 'coordinator') {
            setUsername('coordinator@cervify.edu');
            setPassword('coord123');
        } else if (roleKey === 'principal') {
            setUsername('principal@cervify.edu');
            setPassword('principal123');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const data = await authApi.login({ username, password, role: selectedRole });
            login(data);
        } catch (err) {
            setErrorMsg(err.message || 'Invalid institutional credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { key: 'coordinator', label: 'Event Coordinator', desc: 'Upload student lists, map labels & design templates', Icon: Users },
        { key: 'principal', label: 'Principal / Signer', desc: 'Review, approve & digitally sign certificate batches', Icon: CheckSquare }
    ];

    return (
        <div className="portal-container" style={{ background: '#0F172A', minHeight: '100vh' }}>
            {/* ── Left Brand Panel ───────────────────────────────────── */}
            <div className="portal-left-panel" style={{
                background: 'linear-gradient(145deg, #0F2D25 0%, #1E4D40 100%)',
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <button
                        onClick={() => setCurrentView('landing')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <img src={logoImg} alt="Cervify" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: 2 }}>CERVIFY</span>
                    </button>

                    <div style={{ marginTop: 60 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#A7F3D0',
                            padding: '6px 14px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 20
                        }}>
                            <Shield size={14} /> Institutional Portal V2.4
                        </div>

                        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
                            Empowering <br /><span style={{ color: '#F59E0B' }}>Academic Certification</span> with Rigor & Speed.
                        </h1>

                        <p style={{ color: '#D1D5DB', fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}>
                            Secure end-to-end certificate generation, Excel student import, visual template studio, and Principal digital signature sign-offs.
                        </p>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: 20, color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                    © 2026 Cervify Academic Certification Engine • Bank-Grade Security Enabled
                </div>
            </div>

            {/* ── Right Form Panel ───────────────────────────────────── */}
            <div className="portal-right-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentView('verify')}
                        style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Compass size={14} /> Public Certificate Verifier
                    </button>
                </div>

                <div className="portal-card" style={{ width: '100%', maxWidth: 460, background: 'var(--bg-surface)', padding: 36, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 28 }}>
                        <h2 className="portal-title" style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
                            Sign In to Portal
                        </h2>
                        <p className="portal-subtitle" style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                            Select your institutional role to access authorized functions
                        </p>
                    </div>

                    {errorMsg && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            padding: '12px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            marginBottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <Lock size={15} /> {errorMsg}
                        </div>
                    )}

                    {/* Role Selector Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                        {roles.map(({ key, label, Icon }) => {
                            const isSelected = selectedRole === key;
                            return (
                                <div
                                    key={key}
                                    onClick={() => handleRoleSelect(key)}
                                    style={{
                                        border: `2px solid ${isSelected ? '#10B981' : 'var(--border)'}`,
                                        background: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                                        borderRadius: 12,
                                        padding: '14px 12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Icon size={22} color={isSelected ? '#10B981' : 'var(--text-light)'} style={{ marginBottom: 6 }} />
                                    <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#10B981' : 'var(--text-primary)' }}>
                                        {label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label" htmlFor="login-username" style={{ fontSize: 12, fontWeight: 600 }}>
                                Institutional Email / ID
                            </label>
                            <input
                                id="login-username"
                                type="email"
                                className="form-control"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label" htmlFor="login-password" style={{ fontSize: 12, fontWeight: 600 }}>
                                Account Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ paddingRight: 40 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-light)'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '13px',
                                fontSize: 14,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating…' : (
                                <>
                                    Access Portal Workspace <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

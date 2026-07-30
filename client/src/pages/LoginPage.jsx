/**
 * @file LoginPage.jsx
 * @description Executive Institutional Authentication & Admin Registration Portal for Cervify.
 * Provides role selection (Coordinator, Principal, System Admin) and Admin self-registration.
 */

import React, { useState } from 'react';
import { Shield, Users, CheckSquare, Lock, Eye, EyeOff, ArrowRight, Compass, UserCheck, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api/api';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
    const { login, setCurrentView } = useAppContext();

    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register_admin'
    const [selectedRole, setSelectedRole] = useState('coordinator'); // 'coordinator' | 'principal' | 'admin'

    // Form inputs
    const [username, setUsername] = useState('coordinator');
    const [password, setPassword] = useState('coord123');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Admin register form
    const [regForm, setRegForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        department: 'Executive Governance Board'
    });

    const handleRoleSelect = (roleKey) => {
        setSelectedRole(roleKey);
        if (roleKey === 'admin') {
            setUsername('admin');
            setPassword('admin123');
        } else if (roleKey === 'coordinator') {
            setUsername('coordinator');
            setPassword('coord123');
        } else if (roleKey === 'principal') {
            setUsername('principal');
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
            setErrorMsg(err.message || 'Invalid institutional username or password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterAdminSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const data = await authApi.registerAdmin(regForm);
            login(data);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to register admin account.');
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { key: 'coordinator', label: 'Coordinator', Icon: Users },
        { key: 'principal', label: 'Principal', Icon: CheckSquare },
        { key: 'admin', label: 'System Admin', Icon: UserCheck }
    ];

    const highlights = [
        'Excel Student Roster Import & Dynamic Label Mapper',
        'In-Browser Visual Certificate Studio (No Photoshop Needed)',
        'Principal Digital Signature Sign-Off & Batch Release',
        'One-Click High-Res PDF Batch ZIP Exporter',
        'Offline SHA-256 Public Certificate Authenticator'
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0F172A' }}>
            {/* ── Left Brand Panel ───────────────────────────────────── */}
            <div style={{
                flex: '1 1 45%',
                background: 'linear-gradient(145deg, #064E3B 0%, #0F172A 100%)',
                padding: '60px 48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
                        <img src={logoImg} alt="Cervify" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                        <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: 'white' }}>CERVIFY</span>
                    </div>

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34D399',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 24
                    }}>
                        <Shield size={14} /> Academic Certificate Portal
                    </div>

                    <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.25, color: 'white', marginBottom: 20 }}>
                        Institutional <br />
                        <span style={{ color: '#10B981' }}>Certificate Engine</span>
                    </h1>

                    <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
                        End-to-end institutional workflow: Excel student roster parsing, visual template designer, principal digital signature authorization, and one-click ZIP downloads.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {highlights.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5, color: '#E2E8F0' }}>
                                <div style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: '#10B981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Check size={12} color="white" strokeWidth={3} />
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ color: '#64748B', fontSize: 12, borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 20 }}>
                    © 2026 Cervify Academic Certification Engine • Zero-Server Pure Client Architecture
                </div>
            </div>

            {/* ── Right Auth Panel ───────────────────────────────────── */}
            <div style={{
                flex: '1 1 55%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: 24, right: 24 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentView('verify')}
                        style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                        <Compass size={15} /> Public Certificate Verifier
                    </button>
                </div>

                <div style={{
                    width: '100%',
                    maxWidth: 460,
                    background: '#1E293B',
                    padding: 36,
                    borderRadius: 20,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                    color: 'white'
                }}>
                    {/* Mode Selector Tabs (Sign In vs Register Admin) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#0F172A', padding: 4, borderRadius: 10, marginBottom: 24 }}>
                        <button
                            onClick={() => setAuthMode('login')}
                            style={{
                                background: authMode === 'login' ? '#10B981' : 'transparent',
                                color: authMode === 'login' ? 'white' : '#94A3B8',
                                border: 'none',
                                padding: '9px 12px',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sign In to Portal
                        </button>
                        <button
                            onClick={() => setAuthMode('register_admin')}
                            style={{
                                background: authMode === 'register_admin' ? '#10B981' : 'transparent',
                                color: authMode === 'register_admin' ? 'white' : '#94A3B8',
                                border: 'none',
                                padding: '9px 12px',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Register System Admin
                        </button>
                    </div>

                    {errorMsg && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#F87171',
                            padding: '12px 14px',
                            borderRadius: 10,
                            fontSize: 13,
                            marginBottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <Lock size={15} /> {errorMsg}
                        </div>
                    )}

                    {authMode === 'login' ? (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', color: 'white' }}>
                                    Sign In
                                </h2>
                                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                                    Select your assigned role to access authorized functions
                                </p>
                            </div>

                            {/* Role selector pills */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                                {roles.map(({ key, label, Icon }) => {
                                    const isSelected = selectedRole === key;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleRoleSelect(key)}
                                            style={{
                                                border: `1.5px solid ${isSelected ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
                                                background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                                                borderRadius: 10,
                                                padding: '10px 8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Icon size={18} color={isSelected ? '#10B981' : '#94A3B8'} style={{ marginBottom: 4 }} />
                                            <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#34D399' : '#CBD5E1' }}>
                                                {label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={handleLoginSubmit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                        Username or Email
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 40px 11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            style={{
                                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: '#64748B'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '13px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Authenticating…' : (
                                        <>
                                            Enter Workspace <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px 0', color: 'white' }}>
                                    Register System Admin
                                </h2>
                                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                                    Create your master System Administrator account to manage Coordinators & Principals
                                </p>
                            </div>

                            <form onSubmit={handleRegisterAdminSubmit}>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                        Admin Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Vikramaditya Sen"
                                        className="form-control"
                                        value={regForm.name}
                                        onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                        style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                        Institutional Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="admin@institution.edu"
                                        className="form-control"
                                        value={regForm.email}
                                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                        style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                            Desired Username
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="admin_sys"
                                            className="form-control"
                                            value={regForm.username}
                                            onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                                            style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#CBD5E1', marginBottom: 6, textTransform: 'uppercase' }}>
                                            Admin Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="form-control"
                                            value={regForm.password}
                                            onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                                            style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '13px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Registering Admin…' : (
                                        <>
                                            Create Admin Workspace <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

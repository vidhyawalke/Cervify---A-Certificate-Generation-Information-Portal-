/**
 * @file LoginPage.jsx
 * @description Minimal Business-Style Authentication & Admin Registration Portal for Cervify.
 * Includes strict input validation and Thank You Email dispatch simulation.
 */

import React, { useState } from 'react';
import { Shield, Users, CheckSquare, Lock, Eye, EyeOff, ArrowRight, Compass, UserCheck, Mail, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api/api';
import { validateEmail, validateUsername, validatePassword, validateFullName } from '../utils/validators';
import logoImg from '../assets/logo.png';
import Modal from '../components/ui/Modal';

export default function LoginPage() {
    const { login, setCurrentView } = useAppContext();

    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register_admin'
    const [selectedRole, setSelectedRole] = useState('coordinator'); // 'coordinator' | 'principal' | 'admin'

    // Form states
    const [username, setUsername] = useState('coordinator');
    const [password, setPassword] = useState('coord123');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Email dispatch state
    const [emailDispatchData, setEmailDispatchData] = useState(null);

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
        setErrorMsg('');
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

        // Strict Validations
        const uVal = validateUsername(username);
        if (!uVal.valid) {
            setErrorMsg(uVal.message);
            return;
        }

        const pVal = validatePassword(password);
        if (!pVal.valid) {
            setErrorMsg(pVal.message);
            return;
        }

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

        // Strict Validations
        const nVal = validateFullName(regForm.name);
        if (!nVal.valid) return setErrorMsg(nVal.message);

        const eVal = validateEmail(regForm.email);
        if (!eVal.valid) return setErrorMsg(eVal.message);

        const uVal = validateUsername(regForm.username);
        if (!uVal.valid) return setErrorMsg(uVal.message);

        const pVal = validatePassword(regForm.password);
        if (!pVal.valid) return setErrorMsg(pVal.message);

        setIsLoading(true);
        try {
            const data = await authApi.registerAdmin(regForm);
            setEmailDispatchData({
                email: regForm.email,
                name: regForm.name,
                authData: data
            });
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

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentView('verify')}
                    style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Compass size={14} /> Public Certificate Verifier
                </button>
            </div>

            <div style={{ width: '100%', maxWidth: 440 }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <img src={logoImg} alt="Cervify" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: 1.5 }}>CERVIFY</span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0', color: '#0F172A' }}>
                        Institutional Certificate Portal
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                        Minimal business sign-in & account administration
                    </p>
                </div>

                {/* Auth Mode Toggle Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: '#E2E8F0', padding: 4, borderRadius: 8, marginBottom: 20 }}>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                        style={{
                            background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                            color: authMode === 'login' ? '#0F172A' : '#64748B',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                            boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('register_admin'); setErrorMsg(''); }}
                        style={{
                            background: authMode === 'register_admin' ? '#FFFFFF' : 'transparent',
                            color: authMode === 'register_admin' ? '#0F172A' : '#64748B',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                            boxShadow: authMode === 'register_admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                        }}
                    >
                        Register Admin
                    </button>
                </div>

                {/* Minimal Business Card */}
                <div className="card" style={{ padding: 28, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    {errorMsg && (
                        <div className="alert-banner alert-danger">
                            <Lock size={15} /> {errorMsg}
                        </div>
                    )}

                    {authMode === 'login' ? (
                        <>
                            {/* Role selector pills */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                                {roles.map(({ key, label, Icon }) => {
                                    const isSelected = selectedRole === key;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleRoleSelect(key)}
                                            style={{
                                                border: `1.5px solid ${isSelected ? '#0F172A' : '#E2E8F0'}`,
                                                background: isSelected ? '#F1F5F9' : '#FFFFFF',
                                                borderRadius: 8,
                                                padding: '10px 8px',
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Icon size={18} color={isSelected ? '#0F172A' : '#64748B'} style={{ marginBottom: 4 }} />
                                            <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#0F172A' : '#64748B' }}>
                                                {label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={handleLoginSubmit} noValidate>
                                <div className="form-group">
                                    <label className="form-label">Username or Email</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="e.g. coordinator"
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 24 }}>
                                    <label className="form-label">Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            style={{ paddingRight: 40 }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            style={{
                                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: '#64748B'
                                            }}
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
                                >
                                    {isLoading ? 'Verifying Credentials…' : (
                                        <>
                                            Sign In to Workspace <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleRegisterAdminSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">Admin Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. Vikramaditya Sen"
                                    className="form-control"
                                    value={regForm.name}
                                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Institutional Email (For Confirmation)</label>
                                <input
                                    type="email"
                                    placeholder="admin@institution.edu"
                                    className="form-control"
                                    value={regForm.email}
                                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        placeholder="admin_sys"
                                        className="form-control"
                                        value={regForm.username}
                                        onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="form-control"
                                        value={regForm.password}
                                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 8 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account…' : (
                                    <>
                                        Register System Admin Account <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Thank You Email Dispatch Confirmation Modal */}
            <Modal title="Thank You Registration Confirmation Email" isOpen={!!emailDispatchData} onClose={() => {
                if (emailDispatchData) login(emailDispatchData.authData);
                setEmailDispatchData(null);
            }}>
                {emailDispatchData && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', padding: 16, borderRadius: 10, marginBottom: 20 }}>
                            <CheckCircle2 size={24} color="#059669" />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: '#065F46' }}>
                                    Thank You Email Dispatched!
                                </div>
                                <div style={{ fontSize: 12, color: '#047857' }}>
                                    Confirmation email sent to <strong>{emailDispatchData.email}</strong>.
                                </div>
                            </div>
                        </div>

                        {/* Email Card Preview */}
                        <div style={{ border: '1px solid #CBD5E1', borderRadius: 10, padding: 20, background: '#F8FAFC', marginBottom: 24 }}>
                            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 10, marginBottom: 12, fontSize: 12, color: '#64748B' }}>
                                <div><strong>From:</strong> Cervify Institutional Portal &lt;noreply@cervify.edu&gt;</div>
                                <div><strong>To:</strong> {emailDispatchData.name} &lt;{emailDispatchData.email}&gt;</div>
                                <div><strong>Subject:</strong> Thank You for Registering Your Cervify Admin Account</div>
                            </div>

                            <p style={{ fontSize: 13.5, color: '#0F172A', lineHeight: 1.6, margin: 0 }}>
                                Dear {emailDispatchData.name},<br /><br />
                                Thank you for registering your <strong>System Administrator Account</strong> on Cervify Certificate Portal. You now have full institutional access to create and manage Event Coordinators, Principal signers, and departments.<br /><br />
                                Best regards,<br />
                                <strong>Cervify Academic Certification Governance Board</strong>
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    login(emailDispatchData.authData);
                                    setEmailDispatchData(null);
                                }}
                            >
                                Enter Admin Workspace
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

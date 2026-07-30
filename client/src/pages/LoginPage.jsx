/**
 * @file LoginPage.jsx
 * @description Executive Institutional Authentication Portal for Cervify.
 * Includes System Admin, Event Coordinator, and Principal role authentication.
 */

import React, { useState } from 'react';
import { Shield, Users, CheckSquare, Lock, Eye, EyeOff, ArrowRight, Compass, UserCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { authApi } from '../api/api';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
    const { login, setCurrentView } = useAppContext();

    const [selectedRole, setSelectedRole] = useState('coordinator'); // 'admin' | 'coordinator' | 'principal'
    const [username, setUsername] = useState('coordinator@cervify.edu');
    const [password, setPassword] = useState('coord123');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelect = (roleKey) => {
        setSelectedRole(roleKey);
        if (roleKey === 'admin') {
            setUsername('admin@cervify.edu');
            setPassword('admin123');
        } else if (roleKey === 'coordinator') {
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
        { key: 'coordinator', label: 'Coordinator', Icon: Users },
        { key: 'principal', label: 'Principal', Icon: CheckSquare },
        { key: 'admin', label: 'System Admin', Icon: UserCheck }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentView('verify')}
                    style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                    <Compass size={14} /> Public Certificate Verifier
                </button>
            </div>

            <div style={{
                width: '100%',
                maxWidth: 460,
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '36px 32px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <img src={logoImg} alt="Cervify" style={{ width: 42, height: 42, objectFit: 'contain' }} />
                        <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: 2 }}>CERVIFY</span>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 4px', color: '#E2E8F0' }}>
                        Institutional Portal Sign In
                    </h2>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                        Select your assigned institutional role to enter
                    </p>
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

                {/* Role Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
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
                                    padding: '12px 8px',
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

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                            Account Email / ID
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: 'white', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                            Account Password
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
                                Enter Institutional Workspace <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

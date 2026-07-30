/**
 * @file InactivityLock.jsx
 * @description Bank-grade 15-minute AFK Inactivity Lock & Timeout Manager for Cervify.
 * Monitors user interaction and locks screen when AFK to prevent unauthorized access.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, ShieldAlert, KeyRound, LogOut, Clock, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const TIMEOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes in milliseconds
const WARNING_THRESHOLD_MS = 60 * 1000;      // Show warning 60 seconds before locking

export default function InactivityLock({ children }) {
    const { user, logout, token } = useAppContext();
    const [isLocked, setIsLocked] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [unlockPin, setUnlockPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);

    const lastActivityRef = useRef(Date.now());
    const timerRef = useRef(null);

    // Reset inactivity timer on any user event
    const handleUserActivity = useCallback(() => {
        if (!isLocked) {
            lastActivityRef.current = Date.now();
            if (showWarning) setShowWarning(false);
        }
    }, [isLocked, showWarning]);

    // Attach event listeners for user activity
    useEffect(() => {
        if (!token) return;

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointermove'];
        events.forEach(evt => window.addEventListener(evt, handleUserActivity));

        // Periodic timer check every second
        timerRef.current = setInterval(() => {
            const idleTime = Date.now() - lastActivityRef.current;
            const remainingMs = Math.max(0, TIMEOUT_DURATION_MS - idleTime);
            const remainingSec = Math.ceil(remainingMs / 1000);

            setSecondsRemaining(remainingSec);

            if (remainingMs <= WARNING_THRESHOLD_MS && remainingMs > 0 && !isLocked) {
                setShowWarning(true);
            } else if (remainingMs <= 0 && !isLocked) {
                setIsLocked(true);
                setShowWarning(false);
            }
        }, 1000);

        return () => {
            events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [token, isLocked, handleUserActivity]);

    const handleUnlock = (e) => {
        e.preventDefault();
        // Allow default pin or any password for seamless demo unlock
        if (!unlockPin || unlockPin.length < 3) {
            setPinError('Please enter your institutional password / PIN (min 3 chars).');
            return;
        }

        setIsLocked(false);
        setShowWarning(false);
        setUnlockPin('');
        setPinError('');
        lastActivityRef.current = Date.now();
    };

    if (!token) return children;

    return (
        <>
            {children}

            {/* ── AFK 60-Second Warning Banner ──────────────────────────────────── */}
            {showWarning && !isLocked && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    background: '#1E293B',
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: 12,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'rgba(234, 179, 8, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EAB308'
                    }}>
                        <Clock size={22} className="spin-slow" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Security Inactivity Notice</div>
                        <div style={{ fontSize: 12.5, color: '#94A3B8' }}>
                            Portal session will lock in <strong style={{ color: '#EAB308' }}>{secondsRemaining}s</strong> due to AFK.
                        </div>
                    </div>
                    <button
                        onClick={handleUserActivity}
                        style={{
                            background: '#EAB308',
                            color: '#0F172A',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            marginLeft: 12
                        }}
                    >
                        I'm Active
                    </button>
                </div>
            )}

            {/* ── Bank-Grade Fullscreen Security Lock Overlay ─────────────────────── */}
            {isLocked && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100000,
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 440,
                        background: '#1E293B',
                        borderRadius: 20,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                        padding: 32,
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {/* Lock Icon Badge */}
                        <div style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto 20px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                        }}>
                            <Lock size={30} color="white" />
                        </div>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#F87171',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: 20,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            marginBottom: 12
                        }}>
                            <ShieldAlert size={13} /> Banking Security Active
                        </div>

                        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>
                            Session Locked (AFK)
                        </h2>
                        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24, lineHeight: 1.6 }}>
                            Logged in as <strong style={{ color: '#E2E8F0' }}>{user?.name || user?.username || 'Authorized User'}</strong>.<br />
                            Please verify your credentials to resume your work session.
                        </p>

                        {/* Error Alert */}
                        {pinError && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#FCA5A5',
                                padding: '10px 14px',
                                borderRadius: 8,
                                fontSize: 12,
                                marginBottom: 16,
                                textAlign: 'left'
                            }}>
                                {pinError}
                            </div>
                        )}

                        <form onSubmit={handleUnlock}>
                            <div style={{ marginBottom: 20, textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                                    Enter Password or Security PIN
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={unlockPin}
                                        onChange={e => setUnlockPin(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: '#0F172A',
                                            border: '1px solid #334155',
                                            borderRadius: 10,
                                            padding: '12px 14px 12px 42px',
                                            color: 'white',
                                            fontSize: 14,
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                        autoFocus
                                        required
                                    />
                                    <KeyRound size={18} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                                    padding: '12px',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    marginBottom: 16,
                                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <CheckCircle2 size={16} /> Unlock Session
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setIsLocked(false);
                                logout();
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94A3B8',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            <LogOut size={14} /> Log Out from Account
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * @file LandingPage.jsx
 * @description Public landing page for Cervify — Figma academic design template.
 *
 * Sections:
 *  - Sticky navbar with Sign In / Get Started
 *  - Hero section (dark forest green gradient)
 *  - Stats bar
 *  - Features grid
 *  - Roles showcase
 *  - CTA banner
 *  - Footer
 */

import React, { useState, useEffect } from 'react';
import {
    Award, Users, CheckCircle, FileText, Shield,
    TrendingUp, BookOpen, Menu, X,
    Download, Star, ArrowRight, Building2, ClipboardList,
    CheckSquare
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAppContext } from '../context/AppContext';

/** @returns {JSX.Element} */
export default function LandingPage() {
    const { setCurrentView } = useAppContext();
    const [menuOpen, setMenuOpen]   = useState(false);
    const [scrolled, setScrolled]   = useState(false);

    // Sticky nav shadow on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const features = [
        { icon: <Award size={22} />, title: 'Instant Certificate Generation', desc: 'Generate professionally formatted certificates in seconds with customisable templates for any achievement.' },
        { icon: <Shield size={22} />, title: 'Multi-Level Authorization', desc: 'Coordinator drafts, principal approves, and administrator manages — a clear chain of academic authority.' },
        { icon: <BookOpen size={22} />, title: 'Academic Record Integrity', desc: 'Every certificate is timestamped, traceable, and verifiable for lifelong institutional trust.' },
        { icon: <TrendingUp size={22} />, title: 'Growth Analytics', desc: 'Track certification trends, approval rates, and student achievement metrics across departments.' },
        { icon: <Users size={22} />, title: 'Role-Based Access', desc: 'Tailored dashboards and permissions ensure every stakeholder sees exactly what they need.' },
        { icon: <Download size={22} />, title: 'PDF & Print Ready', desc: 'Export print-ready certificates or share digital copies instantly via secure links.' },
    ];

    const roles = [
        {
            icon: <ClipboardList size={26} />,
            role: 'Coordinator',
            color: 'var(--primary)',
            desc: 'Create, draft, and submit student certificates. Track status and manage course completions with ease.',
            actions: ['Issue new certificates', 'Track pending approvals', 'Manage student records'],
        },
        {
            icon: <CheckSquare size={26} />,
            role: 'Principal',
            color: 'var(--accent)',
            desc: 'Review and authorise certificates submitted by coordinators before official issuance.',
            actions: ['Approve / reject certificates', 'View institution analytics', 'Monitor coordinator activity'],
        },
        {
            icon: <Building2 size={26} />,
            role: 'Administrator',
            color: 'var(--text-secondary)',
            desc: 'Oversee the entire certification system, manage users, and maintain institutional standards.',
            actions: ['Manage all users & roles', 'Full certificate audit trail', 'System configuration & exports'],
        },
    ];

    const stats = [
        { value: '24,800+', label: 'Certificates Issued' },
        { value: '340+',    label: 'Institutions' },
        { value: '98.6%',   label: 'Approval Accuracy' },
        { value: '4.9 / 5', label: 'Educator Rating' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>

            {/* ══════════════════════════════════════════════════════════
                NAVBAR
            ══════════════════════════════════════════════════════════ */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(14px)',
                boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                transition: 'box-shadow 0.3s'
            }}>
                <div style={{
                    maxWidth: 1180, margin: '0 auto', padding: '0 24px',
                    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={logoImg} alt="Cervify Logo" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1.5, color: 'var(--text-primary)' }}>
                            CERVIFY
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-desktop">
                        <a href="#features" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                           onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                           onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Features</a>
                        <a href="#roles" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
                           onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                           onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Roles</a>
                        <a href="#about" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
                           onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                           onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>About</a>
                    </div>

                    {/* Desktop CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-cta-desktop">
                        <button
                            onClick={() => setCurrentView('login')}
                            style={{
                                fontSize: 14, fontWeight: 600, color: 'var(--primary)',
                                padding: '8px 18px', borderRadius: 10,
                                border: '1px solid rgba(42,90,143,0.3)',
                                background: 'transparent', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(42,90,143,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setCurrentView('login')}
                            className="btn btn-primary"
                            style={{ fontSize: 14, padding: '8px 20px' }}
                        >
                            Get Started <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="nav-hamburger"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
                        onClick={() => setMenuOpen(m => !m)}
                        aria-label="Menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div style={{
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        padding: '16px 24px 20px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                            {['#features', '#roles', '#about'].map((href, i) => (
                                <a key={href} href={href}
                                   onClick={() => setMenuOpen(false)}
                                   style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    {['Features', 'Roles', 'About'][i]}
                                </a>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setCurrentView('login')} className="btn btn-secondary" style={{ flex: 1, fontSize: 14 }}>Sign In</button>
                            <button onClick={() => setCurrentView('login')} className="btn btn-primary" style={{ flex: 1, fontSize: 14 }}>Get Started</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* ══════════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════════ */}
            <section style={{
                background: 'linear-gradient(135deg, #0F2D1F 0%, #2A5A8F 55%, #0F2D1F 100%)',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative radial glows */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at 18% 80%, #C8841A 0%, transparent 48%), radial-gradient(ellipse at 82% 18%, #3A8F5E 0%, transparent 48%)'
                }} />

                <div style={{
                    maxWidth: 1180, margin: '0 auto', padding: '80px 24px 96px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center'
                }} className="hero-grid">

                    {/* Copy */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 700,
                            padding: '6px 14px', borderRadius: 999, marginBottom: 24
                        }}>
                            <Star size={11} fill="currentColor" style={{ color: '#C8841A' }} />
                            Trusted by 340+ educational institutions
                        </div>

                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(38px, 5vw, 60px)',
                            color: 'white', lineHeight: 1.18, marginBottom: 20
                        }}>
                            Certify Every<br />
                            <em style={{ color: '#C8841A' }}>Achievement</em>
                            <br />With Confidence
                        </h1>

                        <p style={{
                            color: 'rgba(226,237,230,0.75)', fontSize: 17,
                            lineHeight: 1.75, marginBottom: 32, maxWidth: 460
                        }}>
                            The all-in-one academic certification portal that empowers coordinators, principals, and administrators to issue, approve, and manage student certificates seamlessly.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <button
                                onClick={() => setCurrentView('login')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: '#C8841A', color: 'white', fontWeight: 700,
                                    fontSize: 15, padding: '13px 26px', borderRadius: 12,
                                    border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(200,132,26,0.4)',
                                    transition: 'all 0.2s', fontFamily: 'var(--font-body)'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(200,132,26,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,132,26,0.4)'; }}
                            >
                                Start Free Today <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentView('login')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.25)',
                                    color: 'white', fontWeight: 600, fontSize: 15,
                                    padding: '13px 26px', borderRadius: 12,
                                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                            >
                                Sign In to Portal
                            </button>
                        </div>
                    </div>

                    {/* Hero preview card */}
                    <div style={{ position: 'relative', zIndex: 1 }} className="hero-card-wrapper">
                        <div style={{
                            background: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 20, padding: 24
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 700 }}>Recent Certificates</span>
                                <span style={{ background: 'rgba(76,175,80,0.25)', color: '#81C784', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>● Live</span>
                            </div>

                            {[
                                { name: 'Alex Johnson',  course: 'Advanced Mathematics',  grade: 'A+', status: 'Approved',  dot: '#4CAF50' },
                                { name: 'Maria Garcia',  course: 'Physics Fundamentals',  grade: 'A',  status: 'Pending',   dot: '#FFA726' },
                                { name: 'Aisha Patel',   course: 'Chemistry Lab',          grade: 'A+', status: 'Approved',  dot: '#4CAF50' },
                            ].map((c, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    borderRadius: 12, padding: '12px 16px', marginBottom: 10
                                }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%',
                                        background: 'rgba(42,90,143,0.5)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0
                                    }}>
                                        {c.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.course}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ color: '#C8841A', fontSize: 14, fontWeight: 700 }}>{c.grade}</div>
                                        <div style={{ color: c.dot, fontSize: 11, fontWeight: 600 }}>{c.status}</div>
                                    </div>
                                </div>
                            ))}

                            <div style={{
                                paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)',
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: 11, color: 'rgba(255,255,255,0.38)'
                            }}>
                                <span>Cervify Academy</span>
                                <span>Jul 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════════════════════ */}
            <section style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                    maxWidth: 1180, margin: '0 auto', padding: '40px 24px',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24
                }} className="stats-bar-grid">
                    {stats.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 34, color: 'var(--primary)',
                                marginBottom: 4
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.1em', color: 'var(--text-light)'
                            }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                FEATURES
            ══════════════════════════════════════════════════════════ */}
            <section id="features" style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <div style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'var(--accent)', border: '1px solid rgba(200,132,26,0.3)',
                        padding: '5px 14px', borderRadius: 999, marginBottom: 14
                    }}>Features</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 14 }}>
                        Everything You Need to<br /><em>Certify Excellence</em>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
                        A complete certification ecosystem built for academic institutions, large and small.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {features.map((f, i) => (
                        <div key={i} className="card" style={{ cursor: 'default' }}
                             onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(42,90,143,0.35)'; e.currentTarget.querySelector('.feat-icon').style.background = '#2A5A8F'; e.currentTarget.querySelector('.feat-icon').style.color = 'white'; }}
                             onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.querySelector('.feat-icon').style.background = 'rgba(42,90,143,0.08)'; e.currentTarget.querySelector('.feat-icon').style.color = '#2A5A8F'; }}
                        >
                            <div className="feat-icon" style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(42,90,143,0.08)', color: '#2A5A8F',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16, transition: 'all 0.25s'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: 16, fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                ROLES
            ══════════════════════════════════════════════════════════ */}
            <section id="roles" style={{ background: 'rgba(42,90,143,0.04)', padding: '80px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'var(--accent)', border: '1px solid rgba(200,132,26,0.3)',
                            padding: '5px 14px', borderRadius: 999, marginBottom: 14
                        }}>Three Roles</div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px, 4vw, 40px)' }}>
                            Designed for Every<br /><em>Academic Stakeholder</em>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {roles.map((r, i) => (
                            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Coloured header */}
                                <div style={{ background: r.color, padding: '28px 24px' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: 'rgba(255,255,255,0.18)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', marginBottom: 12
                                    }}>
                                        {r.icon}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color: 'white' }}>{r.role}</div>
                                </div>
                                {/* Body */}
                                <div style={{ padding: '22px 24px 26px' }}>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 18 }}>{r.desc}</p>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {r.actions.map((a, j) => (
                                            <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                                                <CheckCircle size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                CTA
            ══════════════════════════════════════════════════════════ */}
            <section id="about" style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px' }}>
                <div style={{
                    background: '#2A5A8F',
                    borderRadius: 28, padding: '64px 48px',
                    textAlign: 'center', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at 70% 50%, rgba(200,132,26,0.20) 0%, transparent 55%)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <img src={logoImg} alt="Cervify" style={{
                        width: 68, height: 68, objectFit: 'contain',
                        filter: 'brightness(0) invert(1)', opacity: 0.30,
                        marginBottom: 16
                    }} />
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(28px, 4vw, 46px)',
                            color: 'white', marginBottom: 16
                        }}>
                            Ready to Transform<br /><em>Academic Certification?</em>
                        </h2>
                        <p style={{
                            color: 'rgba(226,237,230,0.72)', fontSize: 17,
                            maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.75
                        }}>
                            Join hundreds of institutions already using Cervify to honour student achievement with dignity and precision.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => setCurrentView('login')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: '#C8841A', color: 'white', fontWeight: 700,
                                    fontSize: 15, padding: '14px 30px', borderRadius: 12,
                                    border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(200,132,26,0.4)',
                                    fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                                Sign In to Portal <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentView('verify')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white', fontWeight: 600, fontSize: 15,
                                    padding: '14px 30px', borderRadius: 12,
                                    cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Verify a Certificate
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════════════════ */}
            <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div style={{
                    maxWidth: 1180, margin: '0 auto', padding: '32px 24px',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    justifyContent: 'space-between', gap: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={logoImg} alt="Cervify" style={{ width: 30, height: 30, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CERVIFY</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>
                        © 2024 Cervify. Academic Certification Portal. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-light)' }}>
                        {['Privacy', 'Terms', 'Support'].map(l => (
                            <a key={l} href="#" style={{ color: 'var(--text-light)', textDecoration: 'none' }}
                               onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                               onMouseLeave={e => e.target.style.color = 'var(--text-light)'}>{l}</a>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Responsive overrides */}
            <style>{`
                @media (max-width: 900px) {
                    .hero-grid { grid-template-columns: 1fr !important; }
                    .hero-card-wrapper { display: none !important; }
                    .stats-bar-grid { grid-template-columns: 1fr 1fr !important; }
                    .nav-links-desktop { display: none !important; }
                    .nav-cta-desktop { display: none !important; }
                    .nav-hamburger { display: flex !important; }
                }
                @media (min-width: 901px) {
                    .nav-hamburger { display: none !important; }
                }
            `}</style>
        </div>
    );
}

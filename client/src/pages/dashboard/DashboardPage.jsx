/**
 * @file DashboardPage.jsx
 * @description Analytics dashboard — Figma academic design template.
 *
 * Displays clean stat cards with green/amber palette,
 * gradient progress bars, and a welcoming hero greeting.
 */

import React from 'react';
import { BarChart2, Award, Users, FileText, CheckSquare, TrendingUp, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * Clean academic stat card with coloured icon container.
 */
function StatCard({ icon, label, value, color = 'var(--primary)', bgColor }) {
    const bg = bgColor || `${color}12`;
    return (
        <div
            className="card card-glow stat-card"
            style={{
                borderTop: `3px solid ${color}`,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Soft background tint */}
            <div style={{
                position: 'absolute',
                top: -24, right: -24,
                width: 88, height: 88,
                borderRadius: '50%',
                background: color,
                opacity: 0.05,
                filter: 'blur(20px)',
                pointerEvents: 'none'
            }} />
            <div className="stat-icon" style={{ background: bg, color }}>
                {icon}
            </div>
            <div className="stat-info">
                <span className="stat-value">{value ?? '—'}</span>
                <span className="stat-label">{label}</span>
            </div>
        </div>
    );
}

/**
 * Clean progress bar row for breakdown charts.
 */
function BarRow({ label, count, max, color }) {
    const pct = max > 0 ? ((count / max) * 100).toFixed(1) : 0;
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: `${color}12`,
                    color,
                    padding: '2px 9px',
                    borderRadius: 99,
                    border: `1px solid ${color}25`
                }}>{count} cert{count !== 1 ? 's' : ''}</span>
            </div>
            <div style={{
                height: 7,
                background: 'var(--bg-surface-2)',
                borderRadius: 99,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    borderRadius: 99,
                    transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
            </div>
        </div>
    );
}

/** @returns {JSX.Element} */
export default function DashboardPage() {
    const { reportsSummary: rep, user } = useAppContext();

    const totals     = rep?.totals      || {};
    const byCategory = (rep?.byCategory  || []).map(r => ({ label: r.category_name, count: r.count }));
    const byDept     = (rep?.byDepartment || []).map(r => ({ label: r.deptName,      count: r.count }));

    const maxCat  = Math.max(...byCategory.map(r => r.count), 1);
    const maxDept = Math.max(...byDept.map(r => r.count), 1);

    const roleColors = {
        admin:       '#2A5A8F',
        coordinator: '#2E86AB',
        principal:   '#C8841A'
    };
    const userColor = roleColors[user?.role] || 'var(--primary)';

    return (
        <div className="page-content">

            {/* ── Hero Greeting ──────────────────────────────────────── */}
            <div style={{
                marginBottom: 28,
                padding: '22px 28px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgba(42, 90, 143, 0.08) 0%, rgba(200, 132, 26, 0.05) 100%)',
                border: '1px solid rgba(42, 90, 143, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative soft orb */}
                <div style={{
                    position: 'absolute', right: -30, top: -30,
                    width: 160, height: 160,
                    borderRadius: '50%',
                    background: 'rgba(42, 90, 143, 0.06)',
                    filter: 'blur(30px)',
                    pointerEvents: 'none'
                }} />
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>
                        Welcome back 👋
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 24,
                        marginBottom: 6,
                        color: 'var(--text-primary)'
                    }}>
                        {user?.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge" style={{
                            background: `${userColor}12`,
                            color: userColor,
                            border: `1px solid ${userColor}25`,
                            textTransform: 'capitalize'
                        }}>
                            {user?.role}
                        </span>
                        {user?.department && (
                            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                                · {user.department}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'var(--success)',
                    fontWeight: 600,
                    background: 'rgba(46, 125, 50, 0.08)',
                    border: '1px solid rgba(46, 125, 50, 0.18)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)'
                }}>
                    <Activity size={13} />
                    System operational
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────────────── */}
            <div className="stats-grid">
                <StatCard icon={<BarChart2  size={22} />} label="Total Activities"    value={totals.activities}   color="#2A5A8F" />
                <StatCard icon={<Users      size={22} />} label="Registered Students" value={totals.students}     color="#2E86AB" />
                <StatCard icon={<FileText   size={22} />} label="Staff Members"       value={totals.staff}        color="#C8841A" />
                <StatCard icon={<Award      size={22} />} label="Certs Issued"        value={totals.certificates} color="#8B4513" />
                <StatCard icon={<CheckSquare size={22} />} label="Validated"          value={totals.validated}    color="#2E7D32" />
            </div>

            {/* ── Breakdown Charts ────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(42, 90, 143, 0.10)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Award size={16} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 16,
                            color: 'var(--text-primary)'
                        }}>By Activity Category</h3>
                    </div>
                    {byCategory.length > 0
                        ? byCategory.map((row, i) => (
                            <BarRow key={i} label={row.label} count={row.count} max={maxCat} color="#2A5A8F" />
                          ))
                        : <p style={{ color: 'var(--text-light)', fontSize: 13 }}>No certificate data yet.</p>
                    }
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(46, 134, 171, 0.10)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileText size={16} style={{ color: '#2E86AB' }} />
                        </div>
                        <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 16,
                            color: 'var(--text-primary)'
                        }}>By Department</h3>
                    </div>
                    {byDept.length > 0
                        ? byDept.map((row, i) => (
                            <BarRow key={i} label={row.label} count={row.count} max={maxDept} color="#2E86AB" />
                          ))
                        : <p style={{ color: 'var(--text-light)', fontSize: 13 }}>No certificate data yet.</p>
                    }
                </div>
            </div>
        </div>
    );
}

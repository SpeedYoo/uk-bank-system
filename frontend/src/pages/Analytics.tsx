import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../api/axios';

interface MonthlyEntry {
    month: string;
    income: number;
    expenses: number;
}

interface BreakdownEntry {
    name: string;
    value: number;
}

interface Totals {
    income: number;
    expenses: number;
    net: number;
}

const BREAKDOWN_COLORS: Record<string, string> = {
    'Deposits': '#00FF85',
    'Transfers In': '#3b82f6',
    'Card Top-up': '#f59e0b',
    'Transfers Out': '#ef4444',
};

const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl p-3 shadow-lg text-xs" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {fmt(p.value)}
                </p>
            ))}
        </div>
    );
};

const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl p-3 shadow-lg text-xs" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="font-bold" style={{ color: payload[0].payload.fill || 'var(--text-primary)' }}>
                {payload[0].name}
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>{fmt(payload[0].value)}</p>
        </div>
    );
};

const SummaryCard = ({
    label, value, icon, color,
}: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
        <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{fmt(value)}</p>
    </div>
);

const MONTHS_OPTIONS = [3, 6, 12];

const Analytics: React.FC = () => {
    const [months, setMonths] = useState(6);
    const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
    const [breakdown, setBreakdown] = useState<BreakdownEntry[]>([]);
    const [totals, setTotals] = useState<Totals>({ income: 0, expenses: 0, net: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get('/analytics/summary/', { params: { months } });
                setMonthly(res.data.monthly);
                setBreakdown(res.data.breakdown);
                setTotals(res.data.totals);
            } catch (err) {
                console.error('Analytics fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [months]);

    const totalBreakdown = breakdown.reduce((s, b) => s + b.value, 0);

    return (
        <div className="p-4 sm:p-6 md:p-10 w-full animate-fadeIn">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
                    <div className="flex p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        {MONTHS_OPTIONS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMonths(m)}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={months === m
                                    ? { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }
                                    : { color: 'var(--text-muted)' }}
                            >
                                {m}M
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FF85]" />
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SummaryCard label="Total Income" value={totals.income} icon={<TrendingUp size={18} />} color="#00FF85" />
                            <SummaryCard label="Total Expenses" value={totals.expenses} icon={<TrendingDown size={18} />} color="#ef4444" />
                            <SummaryCard
                                label="Net"
                                value={Math.abs(totals.net)}
                                icon={<Minus size={18} />}
                                color={totals.net >= 0 ? '#00FF85' : '#ef4444'}
                            />
                        </div>

                        {/* Bar chart */}
                        <div className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
                                Income vs Expenses — last {months} months
                            </h2>
                            {monthly.every(m => m.income === 0 && m.expenses === 0) ? (
                                <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    No transaction data yet.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={monthly} barCategoryGap="30%" barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => `£${v}`}
                                            width={60}
                                        />
                                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }} />
                                        <Legend
                                            wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 16 }}
                                        />
                                        <Bar dataKey="income" name="Income" fill="#00FF85" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Pie chart + legend */}
                        <div className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
                                Spending breakdown
                            </h2>
                            {breakdown.length === 0 ? (
                                <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    No transaction data yet.
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-full md:w-64 shrink-0">
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie
                                                    data={breakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={95}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {breakdown.map((entry) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={BREAKDOWN_COLORS[entry.name] || '#6b7280'}
                                                        />
                                                    ))}
                                                </Pie>
                                                <PieTooltip content={<CustomPieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex-1 space-y-3 w-full">
                                        {breakdown.map(entry => {
                                            const color = BREAKDOWN_COLORS[entry.name] || '#6b7280';
                                            const pct = totalBreakdown > 0 ? (entry.value / totalBreakdown) * 100 : 0;
                                            return (
                                                <div key={entry.name}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                                                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(entry.value)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;

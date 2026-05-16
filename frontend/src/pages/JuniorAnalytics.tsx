import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../api/axios';

interface MonthlyEntry   { month: string; income: number; expenses: number; }
interface BreakdownEntry { name: string; value: number; }
interface Totals         { income: number; expenses: number; net: number; }

const BREAKDOWN_COLORS: Record<string, string> = {
    'Deposits':      '#00FF85',
    'Transfers In':  '#3b82f6',
    'Card Top-up':   '#f59e0b',
    'Transfers Out': '#ef4444',
};

const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

const MONTHS_OPTIONS = [3, 6, 12];

/* ── Custom tooltips ────────────────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl p-3 shadow-lg text-xs bg-white border border-purple-200">
            <p className="font-bold mb-1 text-gray-800">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
            ))}
        </div>
    );
};

const PieTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl p-3 shadow-lg text-xs bg-white border border-purple-200">
            <p className="font-bold" style={{ color: payload[0].payload.fill || '#7c3aed' }}>
                {payload[0].name}
            </p>
            <p className="text-gray-500">{fmt(payload[0].value)}</p>
        </div>
    );
};

/* ── Summary card ───────────────────────────────────────────────────── */
const SummaryCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="rounded-2xl p-4 sm:p-5 bg-white border-2 border-purple-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{label}</span>
        </div>
        <p className="text-2xl font-black tracking-tight text-gray-800">{fmt(value)}</p>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════ */
const JuniorAnalytics: React.FC = () => {
    const [months, setMonths]       = useState(6);
    const [monthly, setMonthly]     = useState<MonthlyEntry[]>([]);
    const [breakdown, setBreakdown] = useState<BreakdownEntry[]>([]);
    const [totals, setTotals]       = useState<Totals>({ income: 0, expenses: 0, net: 0 });
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        const load = async () => {
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
        load();
    }, [months]);

    const totalBreakdown = breakdown.reduce((s, b) => s + b.value, 0);

    return (
        <div className="space-y-6 animate-fadeIn pb-6">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-purple-800 tracking-tight">Analytics</h1>
                    <p className="text-sm text-purple-400 font-medium mt-0.5">Your spending overview</p>
                </div>
                {/* Period switcher */}
                <div className="flex p-1 rounded-xl bg-white border-2 border-purple-100 shadow-sm">
                    {MONTHS_OPTIONS.map(m => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                months === m
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow'
                                    : 'text-purple-300 hover:text-purple-500'
                            }`}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SummaryCard label="Total Income"   value={totals.income}           icon={<TrendingUp size={18} />}  color="#00FF85" />
                        <SummaryCard label="Total Expenses" value={totals.expenses}          icon={<TrendingDown size={18} />} color="#ef4444" />
                        <SummaryCard
                            label="Net"
                            value={Math.abs(totals.net)}
                            icon={<Minus size={18} />}
                            color={totals.net >= 0 ? '#8b5cf6' : '#ef4444'}
                        />
                    </div>

                    {/* Bar chart */}
                    <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 sm:p-6 shadow-sm">
                        <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-purple-400">
                            Income vs Expenses — last {months} months
                        </h2>
                        {monthly.every(m => m.income === 0 && m.expenses === 0) ? (
                            <div className="flex items-center justify-center h-48 text-sm text-purple-300">
                                No transaction data yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={monthly} barCategoryGap="30%" barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#a78bfa', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a78bfa', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={v => `£${v}`}
                                        width={60}
                                    />
                                    <Tooltip content={<BarTooltip />} cursor={{ fill: '#f3e8ff', opacity: 0.7 }} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: '#a78bfa', paddingTop: 16 }} />
                                    <Bar dataKey="income"   name="Income"   fill="#00FF85" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Donut chart + legend */}
                    <div className="bg-white rounded-[1.5rem] border-2 border-purple-100 p-5 sm:p-6 shadow-sm">
                        <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-purple-400">
                            Spending breakdown
                        </h2>
                        {breakdown.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-sm text-purple-300">
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
                                                {breakdown.map(entry => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={BREAKDOWN_COLORS[entry.name] || '#8b5cf6'}
                                                    />
                                                ))}
                                            </Pie>
                                            <PieTooltip content={<PieTooltipContent />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend + progress bars */}
                                <div className="flex-1 space-y-3 w-full">
                                    {breakdown.map(entry => {
                                        const color = BREAKDOWN_COLORS[entry.name] || '#8b5cf6';
                                        const pct   = totalBreakdown > 0 ? (entry.value / totalBreakdown) * 100 : 0;
                                        return (
                                            <div key={entry.name}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                        <span className="text-sm font-semibold text-gray-800">{entry.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                                                        <span className="text-sm font-bold text-gray-800">{fmt(entry.value)}</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 rounded-full overflow-hidden bg-purple-50">
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
    );
};

export default JuniorAnalytics;

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
  RadialBarChart, RadialBar,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/* ─── Types ────────────────────────────────────────────────── */
type StatItem = { name: string; count: number };
type TimeItem = { date: string; count: number };
type Stats = {
  total: number;
  uniqueRespondents: number;
  lifeStages: StatItem[];
  emotions: StatItem[];
  moments: StatItem[];
  awareness: StatItem[];
  wishes: StatItem[];
  orgSizes: StatItem[];
  timeline: TimeItem[];
  stageCombinations: StatItem[];
};
type Submission = {
  id: number;
  submission_number: number;
  life_stages: string;
  emotions: string;
  moments: string;
  awareness: string;
  wishes: string;
  organization_name: string | null;
  org_size: string | null;
  submitted_at: string;
};

const COLORS = ["#1D9E75", "#26c993", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#14b8a6", "#6366f1", "#84cc16"];
const TOOLTIP_STYLE = { background: "#191c22", border: "1px solid #2a2e38", borderRadius: 10, fontSize: 13 };
const PER_PAGE = 10;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Table state
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [page, setPage] = useState(1);
  const [detailSub, setDetailSub] = useState<Submission | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`).then((r) => r.json()),
        fetch(`${API}/api/admin/submissions`).then((r) => r.json()),
      ]);
      if (statsRes.ok) setStats(statsRes);
      if (subsRes.ok) setSubs(subsRes.data);
      setLastUpdated(new Date());
      if (isInitial) setLoading(false);
    } catch (e: unknown) {
      if (isInitial) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    timerRef.current = setInterval(() => fetchData(false), 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [search, filterStage]);

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );

  if (error)
    return (
      <div className="mt-12 text-center">
        <p className="text-red-400">Failed to load data: {error}</p>
        <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">Make sure the backend is running on {API}</p>
      </div>
    );

  if (!stats) return null;

  const topStage = stats.lifeStages[0];
  const topEmotion = stats.emotions[0];
  const topWish = stats.wishes[0];

  // Filter submissions
  const filtered = subs.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      const match = [s.organization_name, s.life_stages, s.emotions, s.wishes]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterStage && !(s.life_stages || "").toLowerCase().includes(filterStage.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Unique stages for filter dropdown
  const allStages = [...new Set(stats.lifeStages.map((s) => s.name))];

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-bold">Dashboard</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">
            Survey analytics &amp; submission insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-brand)]" title="Auto-refreshing every 30s" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard label="Total Submissions" value={stats.total} icon="📊" accent="#1D9E75" />
        <KPICard label="Unique Respondents" value={stats.uniqueRespondents} icon="👥" accent="#6366f1" />
        <KPICard label="Top Life Stage" valueStr={topStage?.name ?? "—"} sub={topStage ? `${topStage.count} selections` : ""} icon="🧬" accent="#3b82f6" />
        <KPICard label="Top Emotion" valueStr={topEmotion?.name ?? "—"} sub={topEmotion ? `${topEmotion.count} mentions` : ""} icon="💭" accent="#f59e0b" />
        <KPICard label="Top Wish" valueStr={topWish?.name ?? "—"} sub={topWish ? `${topWish.count} picks` : ""} icon="✨" accent="#a855f7" />
      </div>

      {/* Charts Row 1: Life Stages + Awareness */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Life Stages Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.lifeStages} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#d0d4dc", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {stats.lifeStages.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Awareness Levels</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.awareness} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} stroke="none">
                {stats.awareness.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#8b919e" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Emotions + Wishes */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Top Emotions</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.emotions.slice(0, 8)} margin={{ left: 10, right: 20, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: "#8b919e", fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Wishes Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.wishes} margin={{ left: 10, right: 20, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: "#8b919e", fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28} fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3: Moments + Org Size */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Top Moments (Work disruptions)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.moments.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={200} tick={{ fill: "#d0d4dc", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18} fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-4 text-[15px] font-semibold">Organization Size</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.orgSizes} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} stroke="none">
                {stats.orgSizes.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#8b919e" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Survey Path Funnel */}
      {stats.stageCombinations.length > 0 && (
        <div className="glass-card mb-6 p-5">
          <h2 className="mb-1 text-[15px] font-semibold">Survey Path Combinations</h2>
          <p className="mb-4 text-[12px] text-[var(--color-text-muted)]">Most popular life-stage combinations chosen by respondents</p>
          <div className="space-y-2">
            {stats.stageCombinations.slice(0, 8).map((combo, i) => {
              const pct = stats.total > 0 ? Math.round((combo.count / stats.total) * 100) : 0;
              return (
                <div key={combo.name} className="flex items-center gap-3">
                  <span className="w-6 text-right text-[12px] font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12px]">{combo.name}</span>
                      <span className="text-[12px] font-semibold" style={{ color: COLORS[i % COLORS.length] }}>{combo.count} ({pct}%)</span>
                    </div>
                    <div className="h-[6px] rounded-full bg-[var(--color-surface-3)]">
                      <div className="h-[6px] rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card mb-6 p-5">
        <h2 className="mb-4 text-[15px] font-semibold">Submissions Over Time</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.timeline} margin={{ left: 10, right: 20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e38" />
            <XAxis dataKey="date" tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8b919e", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="count" stroke="#1D9E75" strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Submissions Table */}
      <div className="glass-card mb-8 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold">Recent Submissions</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)]"
            />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">All stages</option>
              {allStages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <a
              href={`${API}/api/admin/export`}
              download
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#169363]"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              Export CSV
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Organization Name</th>
                <th className="px-3 py-2.5">Life Stages</th>
                <th className="px-3 py-2.5">Emotions</th>
                <th className="px-3 py-2.5">Awareness</th>
                <th className="px-3 py-2.5">Wishes</th>
                <th className="px-3 py-2.5">Org Size</th>
                <th className="px-3 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setDetailSub(s)}
                  className="cursor-pointer border-b border-[var(--color-border)]/50 transition-colors hover:bg-[var(--color-surface-3)]"
                >
                  <td className="px-3 py-2.5 font-medium text-[var(--color-brand)]">{s.submission_number}</td>
                  <td className="max-w-[140px] truncate px-3 py-2.5">{s.organization_name || <span className="text-[var(--color-text-muted)]">—</span>}</td>
                  <td className="max-w-[140px] truncate px-3 py-2.5">{s.life_stages || "—"}</td>
                  <td className="max-w-[160px] truncate px-3 py-2.5">{s.emotions || "—"}</td>
                  <td className="px-3 py-2.5">{s.awareness || "—"}</td>
                  <td className="max-w-[160px] truncate px-3 py-2.5">{s.wishes || "—"}</td>
                  <td className="px-3 py-2.5">{s.org_size || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--color-text-muted)]">{new Date(s.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-[var(--color-text-muted)]">
                    {search || filterStage ? "No matching submissions" : "No submissions yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-3)] disabled:opacity-30"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages);
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${p === page ? "bg-[var(--color-brand)] font-bold text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-3)] disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailSub && <DetailModal sub={detailSub} onClose={() => setDetailSub(null)} />}
    </div>
  );
}

/* ─── KPI Card with count-up ───────────────────────────────── */
function KPICard({ label, value, valueStr, sub, icon, accent }: {
  label: string;
  value?: number;
  valueStr?: string;
  sub?: string;
  icon: string;
  accent: string;
}) {
  const [display, setDisplay] = useState(0);
  const isNum = value !== undefined;

  useEffect(() => {
    if (!isNum) return;
    let start = 0;
    const end = value!;
    if (end === 0) { setDisplay(0); return; }
    const duration = 800;
    const stepTime = Math.max(Math.floor(duration / end), 16);
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, isNum]);

  return (
    <div className="glass-card relative overflow-hidden p-4">
      <div className="absolute -top-4 -right-4 text-[64px] opacity-[0.06]">{icon}</div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
      <p className="text-[24px] font-bold" style={{ color: accent }}>{isNum ? display : valueStr}</p>
      {sub && <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">{sub}</p>}
    </div>
  );
}

/* ─── Detail Modal ─────────────────────────────────────────── */
function DetailModal({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  const fields = [
    { label: "Life Stages", val: sub.life_stages, color: "#1D9E75" },
    { label: "Emotions", val: sub.emotions, color: "#f59e0b" },
    { label: "Moments", val: sub.moments, color: "#ef4444" },
    { label: "Awareness", val: sub.awareness, color: "#3b82f6" },
    { label: "Wishes", val: sub.wishes, color: "#a855f7" },
    { label: "Organization", val: sub.organization_name },
    { label: "Org Size", val: sub.org_size },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card relative mx-4 max-h-[85vh] w-full max-w-[520px] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-muted)] transition-colors hover:text-white">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[16px] font-extrabold text-white">
            #{sub.submission_number}
          </div>
          <div>
            <p className="text-[15px] font-bold">Submission #{sub.submission_number}</p>
            <p className="text-[12px] text-[var(--color-text-muted)]">{new Date(sub.submitted_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: f.color || "var(--color-text-muted)" }}>{f.label}</p>
              <p className="text-[13px]">{f.val || <span className="text-[var(--color-text-muted)]">Not provided</span>}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

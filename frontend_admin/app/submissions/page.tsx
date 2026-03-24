"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PER_PAGE = 15;

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

export default function SubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/submissions`);
      const data = await res.json();
      if (data.ok) setSubs(data.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  useEffect(() => { setPage(1); }, [search, filterStage]);

  // Unique stages
  const allStages = [...new Set(subs.flatMap((s) => (s.life_stages || "").split(",").map((v) => v.trim()).filter(Boolean)))];

  const filtered = subs.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (![s.organization_name, s.life_stages, s.emotions, s.wishes, s.moments].filter(Boolean).some((v) => v!.toLowerCase().includes(q))) return false;
    }
    if (filterStage && !(s.life_stages || "").toLowerCase().includes(filterStage.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-bold">All Submissions</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">
            {subs.length} total survey responses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-[11px] text-[var(--color-text-muted)]">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
          <a
            href={`${API}/api/admin/export`}
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#169363]"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search by organization, emotions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)]"
        />
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)]"
        >
          <option value="">All life stages</option>
          {allStages.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterStage) && (
          <button
            onClick={() => { setSearch(""); setFilterStage(""); }}
            className="text-[12px] text-[var(--color-text-muted)] underline hover:text-[var(--color-text-secondary)]"
          >
            Clear filters
          </button>
        )}
        <p className="ml-auto text-[12px] text-[var(--color-text-muted)]">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Organization Name</th>
                <th className="px-3 py-3">Life Stages</th>
                <th className="px-3 py-3">Emotions</th>
                <th className="px-3 py-3">Awareness</th>
                <th className="px-3 py-3">Wishes</th>
                <th className="px-3 py-3">Org Size</th>
                <th className="px-3 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <Fragment key={s.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="cursor-pointer border-b border-[var(--color-border)]/40 transition-colors hover:bg-[var(--color-surface-3)]"
                  >
                    <td className="px-3 py-2.5 font-medium text-[var(--color-brand)]">{s.submission_number}</td>
                    <td className="max-w-[150px] truncate px-3 py-2.5">{s.organization_name || <span className="text-[var(--color-text-muted)]">—</span>}</td>
                    <td className="max-w-[130px] truncate px-3 py-2.5">{s.life_stages || "—"}</td>
                    <td className="max-w-[150px] truncate px-3 py-2.5">{s.emotions || "—"}</td>
                    <td className="px-3 py-2.5">{s.awareness || "—"}</td>
                    <td className="max-w-[150px] truncate px-3 py-2.5">{s.wishes || "—"}</td>
                    <td className="px-3 py-2.5">{s.org_size || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[var(--color-text-muted)]">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={8} className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          <DetailField label="Life Stages" value={s.life_stages} color="#1D9E75" />
                          <DetailField label="Emotions" value={s.emotions} color="#f59e0b" />
                          <DetailField label="Moments" value={s.moments} color="#ef4444" />
                          <DetailField label="Awareness" value={s.awareness} color="#3b82f6" />
                          <DetailField label="Wishes" value={s.wishes} color="#a855f7" />
                          <DetailField label="Organization" value={s.organization_name} />
                          <DetailField label="Org Size" value={s.org_size} />
                          <DetailField label="Submitted" value={new Date(s.submitted_at).toLocaleString()} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-[var(--color-text-muted)]">
                    {search || filterStage ? "No matching submissions found" : "No submissions yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
            <p className="text-[12px] text-[var(--color-text-muted)]">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-3)] disabled:opacity-30"
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : Math.min(page - 3 + i, totalPages);
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
                      p === page
                        ? "bg-[var(--color-brand)] font-bold text-white"
                        : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                    }`}
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
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value, color }: { label: string; value: string | null; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--color-surface)] p-2.5">
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: color || "var(--color-text-muted)" }}>{label}</p>
      <p className="text-[12px] leading-relaxed">{value || <span className="text-[var(--color-text-muted)]">—</span>}</p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from './layout';

const API = process.env.NEXT_PUBLIC_API_URL + '/api';

// ── Shared styles ─────────────────────────────────────────────────────────────
const card = 'rounded-[24px] p-6 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]';
const surfaceCard = `${card} shadow-sm hover:shadow-md`;

// ── Skeletons ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-[24px] p-6 animate-pulse" style={{ background: 'var(--md-surface-container)' }}>
      <div className="w-10 h-10 rounded-full mb-4" style={{ background: 'var(--md-surface-low)' }} />
      <div className="h-7 w-16 rounded-full mb-2" style={{ background: 'var(--md-surface-low)' }} />
      <div className="h-3 w-24 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: 'var(--md-surface-low)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded-full w-1/3" style={{ background: 'var(--md-surface-low)' }} />
        <div className="h-2.5 rounded-full w-1/4" style={{ background: 'var(--md-surface-low)' }} />
      </div>
      <div className="h-3 w-12 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const statColors = [
  { bg: 'var(--md-primary)',   text: '#fff' },
  { bg: 'var(--md-tertiary)',  text: '#fff' },
  { bg: '#386A20',             text: '#fff' },
  { bg: '#7D5700',             text: '#fff' },
];

function StatCard({ label, value, icon, idx }: { label: string; value: string | number; icon: string; idx: number }) {
  const c = statColors[idx % 4];
  return (
    <div
      className={`${surfaceCard} group cursor-default`}
      style={{ background: 'var(--md-surface-container)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: c.bg, color: c.text }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>{label}</p>
    </div>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    APPROVED: { bg: '#DCFCE7', color: '#166534' },
    PENDING:  { bg: '#FEF9C3', color: '#854D0E' },
    REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] ?? { bg: 'var(--md-surface-low)', color: 'var(--md-on-surface-variant)' };
  return (
    <span className="inline-block text-xs font-medium px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ── PENDING PAYMENT ───────────────────────────────────────────────────────────
function PendingPaymentDashboard({ data }: { data: any }) {
  return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl" style={{ background: 'var(--md-secondary-container)' }}>
        ⏳
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--md-on-background)' }}>Payment pending</h1>
      <p className="mb-2" style={{ color: 'var(--md-on-surface-variant)' }}>
        Your campus <span className="font-semibold" style={{ color: 'var(--md-on-background)' }}>{data.registration?.campusName}</span> will be activated once payment is confirmed.
      </p>
      <p className="text-sm mb-8" style={{ color: 'var(--md-on-surface-variant)' }}>If you already paid, please wait a few minutes.</p>
      <Link
        href="/campus/create"
        className="inline-flex items-center gap-2 px-6 h-10 rounded-full text-sm font-medium border transition-all duration-300 active:scale-95 hover:bg-[#6750A4]/5"
        style={{ borderColor: 'var(--md-outline)', color: 'var(--md-primary)' }}
      >
        Register a different campus
      </Link>
    </div>
  );
}

// ── PRINCIPAL ─────────────────────────────────────────────────────────────────
function PrincipalDashboard({ data }: { data: any }) {
  const { campus, stats, departmentBreakdown } = data;
  const statItems = [
    { label: 'Departments',   value: stats.departments,  icon: '🏛' },
    { label: 'Teachers',      value: stats.teachers,     icon: '👨🏫' },
    { label: 'Students',      value: stats.students,     icon: '🎓' },
    { label: 'Pending Marks', value: stats.pendingMarks, icon: '📋' },
  ];
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="relative rounded-[32px] p-8 overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
        <div aria-hidden="true" className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-primary)', opacity: 0.12 }} />
        <div aria-hidden="true" className="absolute -bottom-6 right-24 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-tertiary)', opacity: 0.1 }} />
        <h1 className="text-2xl font-bold relative" style={{ color: 'var(--md-on-background)' }}>Welcome back</h1>
        <p className="text-sm mt-1 relative" style={{ color: 'var(--md-on-surface-variant)' }}>
          {campus.name} · {campus.code}{campus.address && ` · ${campus.address}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department breakdown */}
        <div className="lg:col-span-2 rounded-[24px] overflow-hidden shadow-sm" style={{ background: 'var(--md-surface-container)' }}>
          <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--md-surface-low)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--md-on-background)' }}>Department Breakdown</h2>
            <Link href="/dashboard/departments" className="text-xs font-medium transition-colors hover:opacity-70" style={{ color: 'var(--md-primary)' }}>Manage →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--md-surface-low)' }}>
            {departmentBreakdown.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>
                No departments yet. <Link href="/dashboard/departments" className="font-medium" style={{ color: 'var(--md-primary)' }}>Add one →</Link>
              </div>
            ) : departmentBreakdown.map((d: any) => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-4 transition-colors duration-200 hover:bg-[#6750A4]/5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}>
                  {d.department.shortName.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--md-on-background)' }}>{d.department.name}</p>
                  <p className="text-xs" style={{ color: d.hod ? 'var(--md-on-surface-variant)' : 'var(--md-warning)' }}>
                    {d.hod ? d.hod.name : 'No HOD assigned'}
                  </p>
                </div>
                <div className="flex gap-5 text-right flex-shrink-0">
                  <div><p className="text-sm font-semibold" style={{ color: 'var(--md-on-background)' }}>{d._count.students}</p><p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>Students</p></div>
                  <div><p className="text-sm font-semibold" style={{ color: 'var(--md-on-background)' }}>{d._count.teachers}</p><p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>Teachers</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-[24px] p-6 shadow-sm" style={{ background: 'var(--md-surface-container)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--md-on-background)' }}>Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Departments', href: '/dashboard/departments' },
                { label: 'Teachers',    href: '/dashboard/teachers' },
                { label: 'Students',    href: '/dashboard/students' },
                { label: 'Results',     href: '/dashboard/marks' },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 hover:shadow-sm"
                  style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}
                >
                  {a.label}
                  <span className="opacity-60">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Campus card */}
          <div className="rounded-[24px] p-6 relative overflow-hidden" style={{ background: 'var(--md-primary)' }}>
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl" style={{ background: 'var(--md-tertiary)', opacity: 0.4 }} />
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-white/60">Campus</p>
            <p className="font-bold text-lg leading-tight text-white">{campus.name}</p>
            <p className="text-sm mt-1 text-white/70">{campus.code}</p>
            {campus.address && <p className="text-xs mt-1 text-white/50">{campus.address}</p>}
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-5">
              <div><p className="text-xl font-bold text-white">{stats.departments}</p><p className="text-xs text-white/60">Depts</p></div>
              <div><p className="text-xl font-bold text-white">{stats.students}</p><p className="text-xs text-white/60">Students</p></div>
              <div><p className="text-xl font-bold text-white">{stats.teachers}</p><p className="text-xs text-white/60">Teachers</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOD ───────────────────────────────────────────────────────────────────────
function HODDashboard({ data }: { data: any }) {
  const { campus, department, stats, semesterBreakdown } = data;
  const statItems = [
    { label: 'Teachers',      value: stats.teachers,     icon: '👨🏫' },
    { label: 'Students',      value: stats.students,     icon: '🎓' },
    { label: 'Subjects',      value: stats.subjects,     icon: '📚' },
    { label: 'Pending Marks', value: stats.pendingMarks, icon: '📋' },
  ];
  const max = Math.max(...(semesterBreakdown?.map((x: any) => x.students) ?? [1]), 1);
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative rounded-[32px] p-8 overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
        <div aria-hidden="true" className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-tertiary)', opacity: 0.12 }} />
        <h1 className="text-2xl font-bold relative" style={{ color: 'var(--md-on-background)' }}>{department.name}</h1>
        <p className="text-sm mt-1 relative" style={{ color: 'var(--md-on-surface-variant)' }}>{campus.name} · {department.shortName}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="rounded-[24px] overflow-hidden shadow-sm" style={{ background: 'var(--md-surface-container)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--md-surface-low)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--md-on-background)' }}>Students by Semester</h2>
        </div>
        <div className="p-6 flex items-end gap-3">
          {semesterBreakdown?.map((s: any) => {
            const pct = Math.round((s.students / max) * 100);
            return (
              <div key={s.semester} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--md-on-background)' }}>{s.students}</span>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 80, background: 'var(--md-surface-low)' }}>
                  <div
                    className="w-full rounded-full transition-all duration-500"
                    style={{ height: `${pct}%`, marginTop: `${100 - pct}%`, background: 'var(--md-primary)' }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>Sem {s.semester}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TEACHER ───────────────────────────────────────────────────────────────────
function TeacherDashboard({ data }: { data: any }) {
  const { campus, department, teacher, stats } = data;
  const statItems = [
    { label: 'Students',        value: stats.students,       icon: '🎓' },
    { label: 'Subjects',        value: stats.subjects,       icon: '📚' },
    { label: 'Submitted Marks', value: stats.submittedMarks, icon: '✅' },
    { label: 'Pending Marks',   value: stats.pendingMarks,   icon: '⏳' },
  ];
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative rounded-[32px] p-8 overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
        <div aria-hidden="true" className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-primary)', opacity: 0.1 }} />
        <h1 className="text-2xl font-bold relative" style={{ color: 'var(--md-on-background)' }}>Welcome back</h1>
        <p className="text-sm mt-1 relative" style={{ color: 'var(--md-on-surface-variant)' }}>{department.name} · {campus.name}</p>
        {teacher.designation && <p className="text-xs mt-0.5 relative" style={{ color: 'var(--md-on-surface-variant)' }}>{teacher.designation}{teacher.employeeId && ` · ${teacher.employeeId}`}</p>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="rounded-[24px] p-6 shadow-sm" style={{ background: 'var(--md-surface-container)' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--md-on-background)' }}>Quick Actions</h2>
        <Link
          href="/dashboard/marks/add"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-full text-sm font-medium text-white transition-all duration-300 active:scale-95 hover:shadow-md hover:opacity-90"
          style={{ background: 'var(--md-primary)' }}
        >
          Submit Marks
        </Link>
      </div>
    </div>
  );
}

// ── STUDENT ───────────────────────────────────────────────────────────────────
function StudentDashboard({ data }: { data: any }) {
  const { campus, department, student, stats, marks } = data;
  const statItems = [
    { label: 'Assessments',   value: stats.totalAssessments, icon: '📝' },
    { label: 'Marks Obtained',value: stats.totalMarks,       icon: '✅' },
    { label: 'Total Max',     value: stats.totalMax,         icon: '🎯' },
    { label: 'Percentage',    value: `${stats.percentage}%`, icon: '📊' },
  ];
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="relative rounded-[32px] p-8 overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
        <div aria-hidden="true" className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--md-primary)', opacity: 0.1 }} />
        <h1 className="text-2xl font-bold relative" style={{ color: 'var(--md-on-background)' }}>My Dashboard</h1>
        <p className="text-sm mt-1 relative" style={{ color: 'var(--md-on-surface-variant)' }}>{department.name} · {campus.name}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[`Roll: ${student.roll}`, `Session: ${student.session}`, `Semester ${student.semester}`, student.shift].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary)' }}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="rounded-[24px] overflow-hidden shadow-sm" style={{ background: 'var(--md-surface-container)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--md-surface-low)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--md-on-background)' }}>My Marks</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ borderColor: 'var(--md-surface-low)', background: 'var(--md-surface-low)' }}>
              {['Subject', 'Type', 'Marks', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--md-on-surface-variant)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>No marks available yet.</td></tr>
            ) : marks.map((m: any) => (
              <tr key={m.id} className="border-b transition-colors duration-200 hover:bg-[#6750A4]/5" style={{ borderColor: 'var(--md-surface-low)' }}>
                <td className="px-6 py-3.5">
                  <p className="font-medium" style={{ color: 'var(--md-on-background)' }}>{m.subject.name}</p>
                  <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>{m.subject.code}</p>
                </td>
                <td className="px-6 py-3.5" style={{ color: 'var(--md-on-surface-variant)' }}>{m.assessmentType} #{m.assessmentNo}</td>
                <td className="px-6 py-3.5 font-semibold" style={{ color: 'var(--md-on-background)' }}>
                  {m.marksObtained}<span className="font-normal" style={{ color: 'var(--md-on-surface-variant)' }}>/{m.subject.maxMarks}</span>
                </td>
                <td className="px-6 py-3.5"><StatusChip status={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { role } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionToken = localStorage.getItem('nexus_session_token');
    const accessToken  = localStorage.getItem('nexus_access_token');
    fetch(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${sessionToken ?? ''}`, 'X-Access-Token': accessToken ?? '' },
    })
      .then(r => r.json())
      .then(({ data, message }) => { if (data) setData(data); else setError(message || 'Failed to load'); })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[32px] p-8 animate-pulse" style={{ background: 'var(--md-surface-container)' }}>
          <div className="h-7 w-64 rounded-full mb-2" style={{ background: 'var(--md-surface-low)' }} />
          <div className="h-4 w-48 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[24px] overflow-hidden" style={{ background: 'var(--md-surface-container)' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--md-surface-low)' }}>
              <div className="h-4 w-32 rounded-full animate-pulse" style={{ background: 'var(--md-surface-low)' }} />
            </div>
            {[...Array(4)].map((_, i) => <RowSkeleton key={i} />)}
          </div>
          <div className="rounded-[24px] p-6 animate-pulse space-y-3" style={{ background: 'var(--md-surface-container)' }}>
            <div className="h-4 w-28 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-full" style={{ background: 'var(--md-surface-low)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{error}</p>
      </div>
    );
  }

  if (role === 'PRINCIPAL') {
    if (data?.pendingPayment) return <PendingPaymentDashboard data={data} />;
    return <PrincipalDashboard data={data} />;
  }
  if (role === 'HOD')     return <HODDashboard data={data} />;
  if (role === 'TEACHER') return <TeacherDashboard data={data} />;
  if (role === 'STUDENT') return <StudentDashboard data={data} />;
  return null;
}

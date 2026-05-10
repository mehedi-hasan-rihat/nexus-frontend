'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from './layout';

const API = process.env.NEXT_PUBLIC_API_URL + '/api';

const GRADIENT = 'linear-gradient(135deg, #0052FF, #4D7CFF)';

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-[--card] rounded-2xl border border-[--border] p-5 animate-pulse">
      <div className="w-10 h-10 bg-[--muted] rounded-xl mb-3" />
      <div className="h-7 w-16 bg-[--muted] rounded mb-1.5" />
      <div className="h-3 w-24 bg-[--muted] rounded" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 bg-[--muted] rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[--muted] rounded w-1/3" />
        <div className="h-2.5 bg-[--muted] rounded w-1/4" />
      </div>
      <div className="h-3 w-12 bg-[--muted] rounded" />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-[--card] rounded-2xl border border-[--border] p-5 hover:shadow-md transition-shadow duration-200">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: GRADIENT }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-[--foreground]">{value}</p>
      <p className="text-sm text-[--muted-foreground] mt-0.5">{label}</p>
    </div>
  );
}

// ── PENDING PAYMENT view ─────────────────────────────────────────────────────
function PendingPaymentDashboard({ data }: { data: any }) {
  const { registration } = data;
  return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className="w-16 h-16 bg-[--muted] rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">⏳</span>
      </div>
      <h1 className="text-2xl font-bold text-[--foreground] mb-2">Payment pending</h1>
      <p className="text-[--muted-foreground] mb-2">
        Your campus <span className="font-semibold text-[--foreground]">{registration?.campusName}</span> will be activated once payment is confirmed.
      </p>
      <p className="text-sm text-[--muted-foreground] mb-8">If you already paid, please wait a few minutes for the system to process.</p>
      <a
        href="/campus/create"
        className="inline-block border border-[--border] hover:border-[--accent] text-[--foreground] hover:text-[--accent] font-medium px-6 py-3 rounded-xl transition-all text-sm"
      >
        Register a different campus
      </a>
    </div>
  );
}

// ── PRINCIPAL view ────────────────────────────────────────────────────────────
function PrincipalDashboard({ data }: { data: any }) {
  const { campus, stats, departmentBreakdown } = data;
  const statItems = [
    { label: 'Departments', value: stats.departments, icon: '🏛' },
    { label: 'Teachers', value: stats.teachers, icon: '👨🏫' },
    { label: 'Students', value: stats.students, icon: '🎓' },
    { label: 'Pending Marks', value: stats.pendingMarks, icon: '📋' },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--foreground]">Welcome back</h1>
        <p className="text-sm text-[--muted-foreground] mt-1">
          {campus.name} · {campus.code}{campus.address && ` · ${campus.address}`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department breakdown */}
        <div className="lg:col-span-2 bg-[--card] rounded-2xl border border-[--border] overflow-hidden">
          <div className="px-6 py-4 border-b border-[--border] flex items-center justify-between">
            <h2 className="font-semibold text-[--foreground]">Department Breakdown</h2>
            <Link href="/dashboard/departments" className="text-xs text-[--accent] hover:underline font-medium">Manage →</Link>
          </div>
          <div className="divide-y divide-[--border]">
            {departmentBreakdown.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[--muted-foreground]">
                No departments yet.{' '}
                <Link href="/dashboard/departments" className="text-[--accent] hover:underline">Add one →</Link>
              </div>
            ) : departmentBreakdown.map((d: any) => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[--muted] transition-colors">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: GRADIENT }}
                >
                  {d.department.shortName.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[--foreground] truncate">{d.department.name}</p>
                  <p className="text-xs text-[--muted-foreground]">
                    {d.hod ? d.hod.name : <span className="text-amber-500">No HOD</span>}
                  </p>
                </div>
                <div className="flex gap-5 text-right flex-shrink-0">
                  <div>
                    <p className="text-sm font-semibold text-[--foreground]">{d._count.students}</p>
                    <p className="text-xs text-[--muted-foreground]">Students</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[--foreground]">{d._count.teachers}</p>
                    <p className="text-xs text-[--muted-foreground]">Teachers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-[--card] rounded-2xl border border-[--border] p-6">
            <h2 className="font-semibold text-[--foreground] mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Manage Departments', href: '/dashboard/departments' },
                { label: 'Manage Teachers', href: '/dashboard/teachers' },
                { label: 'Manage Students', href: '/dashboard/students' },
                { label: 'View Results', href: '/dashboard/results' },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all active:scale-[0.98] min-h-[44px]"
                  style={{ background: GRADIENT }}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Campus card */}
          <div
            className="rounded-2xl p-6 text-white"
            style={{ background: GRADIENT }}
          >
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest mb-3">Campus</p>
            <p className="font-bold text-lg leading-tight">{campus.name}</p>
            <p className="text-white/70 text-sm mt-1">{campus.code}</p>
            {campus.address && <p className="text-white/60 text-xs mt-2">{campus.address}</p>}
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-5">
              <div><p className="text-xl font-bold">{stats.departments}</p><p className="text-white/60 text-xs">Depts</p></div>
              <div><p className="text-xl font-bold">{stats.students}</p><p className="text-white/60 text-xs">Students</p></div>
              <div><p className="text-xl font-bold">{stats.teachers}</p><p className="text-white/60 text-xs">Teachers</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOD view ──────────────────────────────────────────────────────────────────
function HODDashboard({ data }: { data: any }) {
  const { campus, department, stats, semesterBreakdown } = data;
  const statItems = [
    { label: 'Teachers', value: stats.teachers, icon: '👨🏫' },
    { label: 'Students', value: stats.students, icon: '🎓' },
    { label: 'Subjects', value: stats.subjects, icon: '📚' },
    { label: 'Pending Marks', value: stats.pendingMarks, icon: '📋' },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--foreground]">{department.name}</h1>
        <p className="text-sm text-[--muted-foreground] mt-1">{campus.name} · {department.shortName}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="bg-[--card] rounded-2xl border border-[--border] overflow-hidden">
        <div className="px-6 py-4 border-b border-[--border]">
          <h2 className="font-semibold text-[--foreground]">Students by Semester</h2>
        </div>
        <div className="p-6 flex items-end gap-3">
          {semesterBreakdown.map((s: any) => {
            const max = Math.max(...semesterBreakdown.map((x: any) => x.students), 1);
            const pct = Math.round((s.students / max) * 100);
            return (
              <div key={s.semester} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-[--foreground]">{s.students}</span>
                <div className="w-full bg-[--muted] rounded-lg overflow-hidden" style={{ height: 80 }}>
                  <div
                    className="w-full rounded-lg transition-all"
                    style={{
                      height: `${pct}%`,
                      marginTop: `${100 - pct}%`,
                      background: 'var(--accent)',
                    }}
                  />
                </div>
                <span className="text-xs text-[--muted-foreground]">Sem {s.semester}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TEACHER view ──────────────────────────────────────────────────────────────
function TeacherDashboard({ data }: { data: any }) {
  const { campus, department, teacher, stats } = data;
  const statItems = [
    { label: 'Students', value: stats.students, icon: '🎓' },
    { label: 'Subjects', value: stats.subjects, icon: '📚' },
    { label: 'Submitted Marks', value: stats.submittedMarks, icon: '✅' },
    { label: 'Pending Marks', value: stats.pendingMarks, icon: '⏳' },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--foreground]">Welcome back</h1>
        <p className="text-sm text-[--muted-foreground] mt-1">{department.name} · {campus.name}</p>
        {teacher.designation && (
          <p className="text-xs text-[--muted-foreground] mt-0.5">
            {teacher.designation}{teacher.employeeId && ` · ${teacher.employeeId}`}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="bg-[--card] rounded-2xl border border-[--border] p-6">
        <h2 className="font-semibold text-[--foreground] mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/dashboard/results"
            className="flex-1 text-center py-3 rounded-xl text-white text-sm font-medium transition-all active:scale-[0.98] min-h-[44px] flex items-center justify-center"
            style={{ background: GRADIENT }}
          >
            Submit Marks
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── STUDENT view ──────────────────────────────────────────────────────────────
function StudentDashboard({ data }: { data: any }) {
  const { campus, department, student, stats, marks } = data;
  const statItems = [
    { label: 'Assessments', value: stats.totalAssessments, icon: '📝' },
    { label: 'Marks Obtained', value: stats.totalMarks, icon: '✅' },
    { label: 'Total Max', value: stats.totalMax, icon: '🎯' },
    { label: 'Percentage', value: `${stats.percentage}%`, icon: '📊' },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--foreground]">My Dashboard</h1>
        <p className="text-sm text-[--muted-foreground] mt-1">{department.name} · {campus.name}</p>
        <p className="text-xs text-[--muted-foreground] mt-0.5">
          Roll: {student.roll} · Session: {student.session} · Semester {student.semester} · {student.shift}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="bg-[--card] rounded-2xl border border-[--border] overflow-hidden">
        <div className="px-6 py-4 border-b border-[--border]">
          <h2 className="font-semibold text-[--foreground]">My Marks</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--border] bg-[--muted] text-left">
              <th className="px-6 py-3 text-xs font-semibold text-[--muted-foreground] uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-xs font-semibold text-[--muted-foreground] uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-xs font-semibold text-[--muted-foreground] uppercase tracking-wider text-right">Marks</th>
              <th className="px-6 py-3 text-xs font-semibold text-[--muted-foreground] uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {marks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[--muted-foreground]">
                  No marks available yet.
                </td>
              </tr>
            ) : marks.map((m: any) => (
              <tr key={m.id} className="hover:bg-[--muted] transition-colors">
                <td className="px-6 py-3.5">
                  <p className="font-medium text-[--foreground]">{m.subject.name}</p>
                  <p className="text-xs text-[--muted-foreground]">{m.subject.code}</p>
                </td>
                <td className="px-6 py-3.5 text-[--muted-foreground]">{m.assessmentType} #{m.assessmentNo}</td>
                <td className="px-6 py-3.5 text-right font-semibold text-[--foreground]">
                  {m.marksObtained}
                  <span className="text-[--muted-foreground] font-normal">/{m.subject.maxMarks}</span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    m.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : m.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                      : 'bg-[--muted] text-[--muted-foreground]'
                  }`}>
                    {m.status}
                  </span>
                </td>
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
    const accessToken = localStorage.getItem('nexus_access_token');
    fetch(`${API}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${sessionToken ?? ''}`,
        'X-Access-Token': accessToken ?? '',
      },
    })
      .then((r) => r.json())
      .then(({ data, message }) => {
        if (data) setData(data);
        else setError(message || 'Failed to load dashboard');
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse space-y-2">
          <div className="h-7 w-64 bg-[--muted] rounded" />
          <div className="h-4 w-48 bg-[--muted] rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[--card] rounded-2xl border border-[--border] overflow-hidden">
            <div className="px-6 py-4 border-b border-[--border]">
              <div className="h-4 w-32 bg-[--muted] rounded animate-pulse" />
            </div>
            {[...Array(4)].map((_, i) => <RowSkeleton key={i} />)}
          </div>
          <div className="bg-[--card] rounded-2xl border border-[--border] p-6 animate-pulse space-y-3">
            <div className="h-4 w-28 bg-[--muted] rounded" />
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[--muted] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <p className="text-[--muted-foreground] text-sm">{error}</p>
      </div>
    );
  }

  if (role === 'PRINCIPAL') {
    if (data?.pendingPayment) return <PendingPaymentDashboard data={data} />;
    return <PrincipalDashboard data={data} />;
  }
  if (role === 'HOD') return <HODDashboard data={data} />;
  if (role === 'TEACHER') return <TeacherDashboard data={data} />;
  if (role === 'STUDENT') return <StudentDashboard data={data} />;
  return null;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from './layout';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 animate-pulse">
      <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
      <div className="h-7 w-16 bg-gray-100 rounded mb-1.5" />
      <div className="h-3 w-24 bg-gray-100 rounded" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-3 w-12 bg-gray-100 rounded" />
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const colors = [
  { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
];

function StatCard({ label, value, icon, idx }: { label: string; value: string | number; icon: string; idx: number }) {
  const c = colors[idx % 4];
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5`}>
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── PENDING PAYMENT view ─────────────────────────────────────────────────────
function PendingPaymentDashboard({ data }: { data: any }) {
  const { registration } = data;
  return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">⏳</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment pending</h1>
      <p className="text-gray-500 mb-2">Your campus <span className="font-semibold text-gray-800">{registration?.campusName}</span> will be activated once payment is confirmed.</p>
      <p className="text-sm text-gray-400 mb-8">If you already paid, please wait a few minutes for the system to process.</p>
      <a
        href="/campus/create"
        className="inline-block border border-[#e2e8f0] hover:border-blue-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors text-sm"
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">{campus.name} · {campus.code}{campus.address && ` · ${campus.address}`}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Department Breakdown</h2>
            <Link href="/dashboard/departments" className="text-xs text-blue-600 hover:underline font-medium">Manage →</Link>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {departmentBreakdown.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No departments yet. <Link href="/dashboard/departments" className="text-blue-600 hover:underline">Add one →</Link></div>
            ) : departmentBreakdown.map((d: any) => (
              <div key={d.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                  {d.department.shortName.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{d.department.name}</p>
                  <p className="text-xs text-gray-400">{d.hod ? d.hod.name : <span className="text-amber-500">No HOD</span>}</p>
                </div>
                <div className="flex gap-5 text-right flex-shrink-0">
                  <div><p className="text-sm font-semibold text-gray-800">{d._count.students}</p><p className="text-xs text-gray-400">Students</p></div>
                  <div><p className="text-sm font-semibold text-gray-800">{d._count.teachers}</p><p className="text-xs text-gray-400">Teachers</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Manage Departments', href: '/dashboard/departments', color: 'bg-blue-600 hover:bg-blue-700' },
                { label: 'Manage Teachers', href: '/dashboard/teachers', color: 'bg-emerald-600 hover:bg-emerald-700' },
                { label: 'Manage Students', href: '/dashboard/students', color: 'bg-violet-600 hover:bg-violet-700' },
                { label: 'View Results', href: '/dashboard/results', color: 'bg-amber-600 hover:bg-amber-700' },
              ].map((a) => (
                <Link key={a.label} href={a.href} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium ${a.color} transition-colors`}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">Campus</p>
            <p className="font-bold text-lg leading-tight">{campus.name}</p>
            <p className="text-blue-200 text-sm mt-1">{campus.code}</p>
            {campus.address && <p className="text-blue-200 text-xs mt-2">{campus.address}</p>}
            <div className="mt-4 pt-4 border-t border-blue-500 flex gap-5">
              <div><p className="text-xl font-bold">{stats.departments}</p><p className="text-blue-200 text-xs">Depts</p></div>
              <div><p className="text-xl font-bold">{stats.students}</p><p className="text-blue-200 text-xs">Students</p></div>
              <div><p className="text-xl font-bold">{stats.teachers}</p><p className="text-blue-200 text-xs">Teachers</p></div>
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
        <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{campus.name} · {department.shortName}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="font-semibold text-gray-800">Students by Semester</h2>
        </div>
        <div className="p-6 flex items-end gap-3">
          {semesterBreakdown.map((s: any) => {
            const max = Math.max(...semesterBreakdown.map((x: any) => x.students), 1);
            const pct = Math.round((s.students / max) * 100);
            return (
              <div key={s.semester} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-700">{s.students}</span>
                <div className="w-full bg-blue-100 rounded-lg overflow-hidden" style={{ height: 80 }}>
                  <div className="w-full bg-blue-500 rounded-lg transition-all" style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
                </div>
                <span className="text-xs text-gray-400">Sem {s.semester}</span>
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">{department.name} · {campus.name}</p>
        {teacher.designation && <p className="text-xs text-gray-400 mt-0.5">{teacher.designation}{teacher.employeeId && ` · ${teacher.employeeId}`}</p>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link href="/dashboard/results" className="flex-1 text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Submit Marks</Link>
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
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{department.name} · {campus.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Roll: {student.roll} · Session: {student.session} · Semester {student.semester} · {student.shift}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s, i) => <StatCard key={s.label} {...s} idx={i} />)}
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="font-semibold text-gray-800">My Marks</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Marks</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {marks.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">No marks available yet.</td></tr>
            ) : marks.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5">
                  <p className="font-medium text-gray-800">{m.subject.name}</p>
                  <p className="text-xs text-gray-400">{m.subject.code}</p>
                </td>
                <td className="px-6 py-3.5 text-gray-600">{m.assessmentType} #{m.assessmentNo}</td>
                <td className="px-6 py-3.5 text-right font-semibold text-gray-800">{m.marksObtained}<span className="text-gray-400 font-normal">/{m.subject.maxMarks}</span></td>
                <td className="px-6 py-3.5 text-right">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    m.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    m.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-gray-100 text-gray-500'
                  }`}>{m.status}</span>
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
          <div className="h-7 w-64 bg-gray-100 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0]"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></div>
            {[...Array(4)].map((_, i) => <RowSkeleton key={i} />)}
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 animate-pulse space-y-3">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
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

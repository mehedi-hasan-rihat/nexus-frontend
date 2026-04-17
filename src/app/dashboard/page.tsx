'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Department {
  id: string;
  department: { name: string; shortName: string };
  _count: { students: number; teachers: number };
}

interface Campus {
  id: string;
  campusName: string;
  campusCode: string;
  address: string | null;
  departments: Department[];
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const statColors = [
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, campusRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: 'include' }),
          fetch(`${API}/campus/mine`, { credentials: 'include' }),
        ]);
        if (meRes.ok) {
          const { data } = await meRes.json();
          setUser(data);
        }
        if (campusRes.ok) {
          const { data } = await campusRes.json();
          setCampus(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = campus?.departments.reduce((s, d) => s + d._count.students, 0) ?? 0;
  const totalTeachers = campus?.departments.reduce((s, d) => s + d._count.teachers, 0) ?? 0;
  const totalDepts = campus?.departments.length ?? 0;

  const stats = [
    { label: 'Total Students', value: loading ? '—' : totalStudents, icon: '🎓', ...statColors[0] },
    { label: 'Total Teachers', value: loading ? '—' : totalTeachers, icon: '👨🏫', ...statColors[1] },
    { label: 'Departments', value: loading ? '—' : totalDepts, icon: '🏛', ...statColors[2] },
    { label: 'Current Semester', value: loading ? '—' : '8th', icon: '📅', ...statColors[3] },
  ];

  const quickActions = [
    { label: 'Add Student', icon: '➕', href: '/dashboard/students/new', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Add Teacher', icon: '➕', href: '/dashboard/teachers/new', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Publish Result', icon: '📤', href: '/dashboard/results/new', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'Class Schedule', icon: '📅', href: '/dashboard/schedule', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {loading ? 'Loading…' : `Welcome back, ${user?.name ?? 'Principal'}`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {campus ? `${campus.campusName} · ${campus.campusCode}` : 'Loading campus info…'}
          {campus?.address && <span className="ml-2 text-gray-400">· {campus.address}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Departments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Departments</h2>
            <Link href="/dashboard/departments" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : campus?.departments.length ? (
              campus.departments.map((dept) => (
                <div key={dept.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-sm font-bold text-blue-600">
                    {dept.department.shortName.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{dept.department.name}</p>
                    <p className="text-xs text-gray-400">{dept.department.shortName}</p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{dept._count.students}</p>
                      <p className="text-xs text-gray-400">Students</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{dept._count.teachers}</p>
                      <p className="text-xs text-gray-400">Teachers</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400 text-sm">No departments added yet.</p>
                <Link href="/dashboard/departments/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                  Add a department →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium ${a.color} transition-colors`}
                >
                  <span>{a.icon}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Campus Info Card */}
          {campus && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">Campus</p>
              <p className="font-bold text-lg leading-tight">{campus.campusName}</p>
              <p className="text-blue-200 text-sm mt-1">{campus.campusCode}</p>
              {campus.address && (
                <p className="text-blue-200 text-xs mt-3 leading-relaxed">{campus.address}</p>
              )}
              <div className="mt-4 pt-4 border-t border-blue-500 flex gap-4">
                <div>
                  <p className="text-xl font-bold">{totalDepts}</p>
                  <p className="text-blue-200 text-xs">Departments</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{totalStudents}</p>
                  <p className="text-blue-200 text-xs">Students</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{totalTeachers}</p>
                  <p className="text-blue-200 text-xs">Teachers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

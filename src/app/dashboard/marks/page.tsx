'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { markApi, type Mark } from '@/lib/api';
import { md } from '@/lib/styles';

export default function MarksPage() {
  const [marks, setMarks]   = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markApi.list().then(async r => {
      if (r.ok) { const { data } = await r.json(); setMarks(data); }
      setLoading(false);
    });
  }, []);

  const grouped = marks.reduce<Record<string, Mark[]>>((acc, m) => {
    const key = `${m.subject.code} — ${m.subject.name} | ${m.assessmentType.replace('_', ' ')} #${m.assessmentNo}`;
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  const statusStyle = (s: string) => {
    if (s === 'APPROVED') return { bg: '#DCFCE7', color: '#166534' };
    if (s === 'REJECTED') return { bg: '#FEE2E2', color: '#991B1B' };
    return { bg: '#FEF9C3', color: '#854D0E' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>Marks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>View and manage student marks</p>
        </div>
        <Link href="/dashboard/marks/add" className={md.btnFilled} style={{ background: 'var(--md-primary)' }}>
          + Add / Update Marks
        </Link>
      </div>

      {loading ? (
        <div className="p-10 flex justify-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className={`${md.card} p-12 text-center text-sm shadow-sm`} style={{ background: 'var(--md-surface-container)', color: 'var(--md-on-surface-variant)' }}>
          No marks recorded yet.
        </div>
      ) : (
        Object.entries(grouped).map(([label, rows]) => (
          <div key={label} className={`${md.card} overflow-hidden shadow-sm`} style={{ background: 'var(--md-surface-container)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--md-surface-low)', background: 'var(--md-surface-low)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--md-on-background)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>
                Semester {rows[0].subject.semester} · Max {rows[0].subject.maxMarks}
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: 'var(--md-surface-low)' }}>
                  {['Student', 'Roll No.', 'Marks Obtained', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--md-on-surface-variant)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(m => (
                  <tr key={m.id} className="border-b transition-colors duration-200 hover:bg-[#6750A4]/5" style={{ borderColor: 'var(--md-surface-low)' }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--md-on-background)' }}>{m.student.user.name}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--md-on-surface-variant)' }}>{m.student.roll}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--md-on-background)' }}>{m.marksObtained}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-3 py-1 rounded-full" style={statusStyle(m.status)}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

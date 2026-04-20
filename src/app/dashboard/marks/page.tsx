'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { markApi, type Mark } from '@/lib/api';

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markApi.list().then(async (r) => {
      if (r.ok) { const { data } = await r.json(); setMarks(data); }
      setLoading(false);
    });
  }, []);

  // Group by subject + assessmentType + assessmentNo
  const grouped = marks.reduce<Record<string, Mark[]>>((acc, m) => {
    const key = `${m.subject.code} — ${m.subject.name} | ${m.assessmentType.replace('_', ' ')} #${m.assessmentNo}`;
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage student marks</p>
        </div>
        <Link
          href="/dashboard/marks/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Add / Update Marks
        </Link>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-sm text-gray-400">
          No marks recorded yet.
        </div>
      ) : (
        Object.entries(grouped).map(([label, rows]) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-[#e2e8f0]">
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">Semester {rows[0].subject.semester} · Max {rows[0].subject.maxMarks}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-[#e2e8f0]">
                <tr>
                  {['Student', 'Roll No.', 'Marks Obtained', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {rows.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{m.student.user.name}</td>
                    <td className="px-5 py-3 text-gray-500">{m.student.roll}</td>
                    <td className="px-5 py-3 text-gray-800">{m.marksObtained}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        m.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                        m.status === 'REJECTED' ? 'bg-red-50 text-red-500' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>{m.status}</span>
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

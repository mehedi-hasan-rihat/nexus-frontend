'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentApi, subjectApi, markApi, type Student, type Subject, type AssessmentType } from '@/lib/api';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const ASSESSMENT_TYPES: AssessmentType[] = ['CLASS_TEST', 'QUIZ', 'MIDTERM', 'ATTENDANCE'];

const inputCls = 'w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500';
const selectCls = `${inputCls} text-gray-700`;

export default function AddMarksPage() {
  const router = useRouter();
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('CLASS_TEST');
  const [assessmentNo, setAssessmentNo] = useState('1');
  const [markValues, setMarkValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!semester) { setSubjects([]); setStudents([]); setSubjectId(''); return; }
    setLoading(true);
    Promise.all([
      subjectApi.list(Number(semester)),
      studentApi.listBySemester(Number(semester)),
    ]).then(async ([sRes, stRes]) => {
      if (sRes.ok)  { const { data } = await sRes.json();  setSubjects(data); }
      if (stRes.ok) { const { data } = await stRes.json(); setStudents(data); const init: Record<string, string> = {}; data.forEach((s: Student) => { init[s.id] = ''; }); setMarkValues(init); }
      setLoading(false);
    });
  }, [semester]);

  const selectedSubject = subjects.find(s => s.id === subjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) { setError('Please select a subject.'); return; }
    setBusy(true); setError('');

    const marks = students
      .filter(s => markValues[s.id] !== '')
      .map(s => ({ studentId: s.id, marksObtained: Number(markValues[s.id]) }));

    if (marks.length === 0) { setError('Enter marks for at least one student.'); setBusy(false); return; }

    const res = await markApi.bulkUpsert({ subjectId, assessmentType, assessmentNo: Number(assessmentNo), marks });
    if (res.ok) { router.push('/dashboard/marks'); }
    else { const d = await res.json(); setError(d.message ?? 'Error saving marks.'); }
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add / Update Marks</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select semester, subject and assessment, then fill in marks</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top controls */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Assessment Details</p>

          <select value={semester} onChange={e => setSemester(e.target.value)} required className={selectCls}>
            <option value="">Select semester *</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          {semester && (
            <>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className={selectCls}>
                <option value="">Select subject *</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code}) — Max {s.maxMarks}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select value={assessmentType} onChange={e => setAssessmentType(e.target.value as AssessmentType)} className={selectCls}>
                  {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
                <input
                  type="number" min={1} value={assessmentNo}
                  onChange={e => setAssessmentNo(e.target.value)}
                  placeholder="Assessment No."
                  required className={inputCls}
                />
              </div>
            </>
          )}
        </div>

        {/* Student marks table */}
        {semester && (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No students found for semester {semester}.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[#e2e8f0]">
                  <tr>
                    {['Student', 'Roll No.', `Marks${selectedSubject ? ` (Max ${selectedSubject.maxMarks})` : ''}`].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{s.user.name}</p>
                        <p className="text-xs text-gray-400">{s.user.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{s.roll}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number" min={0}
                          max={selectedSubject?.maxMarks}
                          placeholder="—"
                          value={markValues[s.id] ?? ''}
                          onChange={e => setMarkValues(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-24 px-2 py-1.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy || !semester || !subjectId || students.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {busy ? 'Saving…' : 'Save Marks'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/marks')}
            className="px-6 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

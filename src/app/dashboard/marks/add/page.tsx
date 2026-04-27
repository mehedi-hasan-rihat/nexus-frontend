'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentApi, subjectApi, markApi, type Student, type Subject, type AssessmentType } from '@/lib/api';
import { md } from '@/lib/styles';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const ASSESSMENT_TYPES: AssessmentType[] = ['CLASS_TEST', 'QUIZ', 'MIDTERM', 'ATTENDANCE'];

export default function AddMarksPage() {
  const router = useRouter();
  const [semester, setSemester]         = useState('');
  const [subjects, setSubjects]         = useState<Subject[]>([]);
  const [students, setStudents]         = useState<Student[]>([]);
  const [subjectId, setSubjectId]       = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('CLASS_TEST');
  const [assessmentNo, setAssessmentNo] = useState('1');
  const [markValues, setMarkValues]     = useState<Record<string, string>>({});
  const [loading, setLoading]           = useState(false);
  const [busy, setBusy]                 = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!semester) { setSubjects([]); setStudents([]); setSubjectId(''); return; }
    setLoading(true);
    Promise.all([subjectApi.list(Number(semester)), studentApi.listBySemester(Number(semester))]).then(async ([sRes, stRes]) => {
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
    const marks = students.filter(s => markValues[s.id] !== '').map(s => ({ studentId: s.id, marksObtained: Number(markValues[s.id]) }));
    if (marks.length === 0) { setError('Enter marks for at least one student.'); setBusy(false); return; }
    const res = await markApi.bulkUpsert({ subjectId, assessmentType, assessmentNo: Number(assessmentNo), marks });
    if (res.ok) { router.push('/dashboard/marks'); }
    else { const d = await res.json(); setError(d.message ?? 'Error saving marks.'); }
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>Add / Update Marks</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>Select semester, subject and assessment, then fill in marks</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Assessment details */}
        <div className={`${md.card} p-6 shadow-sm space-y-4`} style={{ background: 'var(--md-surface-container)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--md-on-background)' }}>Assessment Details</p>
          <select value={semester} onChange={e => setSemester(e.target.value)} required className={md.select}>
            <option value="">Select semester *</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {semester && (
            <>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className={md.select}>
                <option value="">Select subject *</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code}) — Max {s.maxMarks}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select value={assessmentType} onChange={e => setAssessmentType(e.target.value as AssessmentType)} className={md.select}>
                  {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
                <input type="number" min={1} value={assessmentNo} onChange={e => setAssessmentNo(e.target.value)} placeholder="Assessment No." required className={md.input} />
              </div>
            </>
          )}
        </div>

        {/* Student marks table */}
        {semester && (
          <div className={`${md.card} overflow-hidden shadow-sm`} style={{ background: 'var(--md-surface-container)' }}>
            {loading ? (
              <div className="p-10 flex justify-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>No students found for semester {semester}.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left" style={{ borderColor: 'var(--md-surface-low)', background: 'var(--md-surface-low)' }}>
                    {['Student', 'Roll No.', `Marks${selectedSubject ? ` (Max ${selectedSubject.maxMarks})` : ''}`].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--md-on-surface-variant)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b transition-colors duration-200 hover:bg-[#6750A4]/5" style={{ borderColor: 'var(--md-surface-low)' }}>
                      <td className="px-5 py-3">
                        <p className="font-medium" style={{ color: 'var(--md-on-background)' }}>{s.user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>{s.user.email}</p>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--md-on-surface-variant)' }}>{s.roll}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number" min={0} max={selectedSubject?.maxMarks} placeholder="—"
                          value={markValues[s.id] ?? ''}
                          onChange={e => setMarkValues(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-24 px-3 h-10 text-sm bg-[#E7E0EC] rounded-t-lg rounded-b-none border-0 border-b-2 border-[#79747E] outline-none text-[#1C1B1F] transition-colors duration-200 focus:border-[#6750A4]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {error && <p className="text-xs px-1" style={{ color: 'var(--md-error)' }}>{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={busy || !semester || !subjectId || students.length === 0} className={md.btnFilled} style={{ background: 'var(--md-primary)' }}>
            {busy ? 'Saving…' : 'Save Marks'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard/marks')} className={md.btnOutlined} style={{ borderColor: 'var(--md-outline)', color: 'var(--md-on-surface-variant)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

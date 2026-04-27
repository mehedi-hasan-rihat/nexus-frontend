'use client';

import { useEffect, useState } from 'react';
import { studentApi, departmentApi, type Student, type Department } from '@/lib/api';
import { md } from '@/lib/styles';

type Modal = { type: 'create' } | { type: 'edit'; student: Student } | null;

export default function StudentsPage() {
  const [students, setStudents]     = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState<Modal>(null);
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState('');

  const load = async () => {
    const [sRes, dRes] = await Promise.all([studentApi.list(), departmentApi.list()]);
    if (sRes.ok) { const { data } = await sRes.json(); setStudents(data); }
    if (dRes.ok) { const { data } = await dRes.json(); setDepartments(data); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const close = () => { setModal(null); setError(''); };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await studentApi.create({
      name: fd.get('name') as string, email: fd.get('email') as string,
      password: fd.get('password') as string, campusDepartmentId: fd.get('campusDepartmentId') as string,
      roll: fd.get('roll') as string, session: fd.get('session') as string,
      semester: Number(fd.get('semester')), shift: (fd.get('shift') as 'MORNING' | 'EVENING') || 'MORNING',
    });
    if (res.ok) { close(); load(); } else { const d = await res.json(); setError(d.message ?? 'Error'); }
    setBusy(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modal?.type !== 'edit') return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await studentApi.update(modal.student.id, {
      roll: (fd.get('roll') as string) || undefined,
      session: (fd.get('session') as string) || undefined,
      semester: fd.get('semester') ? Number(fd.get('semester')) : undefined,
      campusDepartmentId: (fd.get('campusDepartmentId') as string) || undefined,
    });
    if (res.ok) { close(); load(); } else { const d = await res.json(); setError(d.message ?? 'Error'); }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student and their account?')) return;
    await studentApi.remove(id); load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>Students</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>Manage enrolled students</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className={md.btnFilled}
          style={{ background: 'var(--md-primary)' }}
        >
          + Add Student
        </button>
      </div>

      {/* Table */}
      <div className={`${md.card} overflow-hidden shadow-sm`} style={{ background: 'var(--md-surface-container)' }}>
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>No students yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--md-surface-low)', background: 'var(--md-surface-low)' }}>
                {['Student', 'Department', 'Roll No.', 'Semester', 'Shift', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--md-on-surface-variant)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b transition-colors duration-200 hover:bg-[#6750A4]/5" style={{ borderColor: 'var(--md-surface-low)' }}>
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: 'var(--md-on-background)' }}>{s.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>{s.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}>
                      {s.campusDepartment.department.shortName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{s.roll}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{s.semester}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{s.shift}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'edit', student: s })} className={`${md.btnTonal} px-4 h-8 text-xs`} style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}>Edit</button>
                      <button onClick={() => handleDelete(s.id)} className={`${md.btnTonal} px-4 h-8 text-xs`} style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-[28px] p-6 shadow-xl" style={{ background: 'var(--md-background)' }}>
            {modal.type === 'create' && (
              <>
                <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--md-on-background)' }}>Add Student</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                  <input name="name" placeholder="Full name" required className={md.input} />
                  <input name="email" type="email" placeholder="Email" required className={md.input} />
                  <input name="password" type="password" placeholder="Password" required className={md.input} />
                  <select name="campusDepartmentId" required className={md.select}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="roll" placeholder="Roll number" required className={md.input} />
                  <input name="session" placeholder="Session (e.g. 2023-24)" required className={md.input} />
                  <input name="semester" type="number" min={1} max={12} placeholder="Semester" required className={md.input} />
                  <select name="shift" className={md.select}>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                  </select>
                  {error && <p className="text-xs px-1" style={{ color: 'var(--md-error)' }}>{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={busy} className={`flex-1 ${md.btnFilled}`} style={{ background: 'var(--md-primary)' }}>{busy ? 'Saving…' : 'Create'}</button>
                    <button type="button" onClick={close} className={`flex-1 ${md.btnOutlined}`} style={{ borderColor: 'var(--md-outline)', color: 'var(--md-on-surface-variant)' }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
            {modal.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--md-on-background)' }}>Edit Student</h2>
                <p className="text-sm mb-5" style={{ color: 'var(--md-on-surface-variant)' }}>{modal.student.user.name}</p>
                <form onSubmit={handleEdit} className="space-y-3">
                  <select name="campusDepartmentId" defaultValue={modal.student.campusDepartmentId} className={md.select}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="roll" defaultValue={modal.student.roll} placeholder="Roll number" className={md.input} />
                  <input name="session" defaultValue={modal.student.session} placeholder="Session" className={md.input} />
                  <input name="semester" type="number" min={1} max={12} defaultValue={modal.student.semester} placeholder="Semester" className={md.input} />
                  {error && <p className="text-xs px-1" style={{ color: 'var(--md-error)' }}>{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={busy} className={`flex-1 ${md.btnFilled}`} style={{ background: 'var(--md-primary)' }}>{busy ? 'Saving…' : 'Save'}</button>
                    <button type="button" onClick={close} className={`flex-1 ${md.btnOutlined}`} style={{ borderColor: 'var(--md-outline)', color: 'var(--md-on-surface-variant)' }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

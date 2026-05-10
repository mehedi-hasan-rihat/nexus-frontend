'use client';

import { useEffect, useState } from 'react';
import { studentApi, departmentApi, type Student, type Department } from '@/lib/api';

type Modal =
  | { type: 'create' }
  | { type: 'edit'; student: Student }
  | null;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      campusDepartmentId: fd.get('campusDepartmentId') as string,
      roll: fd.get('roll') as string,
      session: fd.get('session') as string,
      semester: Number(fd.get('semester')),
      shift: (fd.get('shift') as 'MORNING' | 'EVENING') || 'MORNING',
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
    await studentApi.remove(id);
    load();
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage enrolled students</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1447E6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No students yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[#e2e8f0]">
              <tr>
                {['Student', 'Department', 'Roll No.', 'Semester', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{s.user.name}</p>
                    <p className="text-xs text-gray-400">{s.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{s.campusDepartment.department.shortName}</td>
                  <td className="px-5 py-4 text-gray-500">{s.roll}</td>
                  <td className="px-5 py-4 text-gray-500">{s.semester}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => setModal({ type: 'edit', student: s })} className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {modal.type === 'create' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Add Student</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                  <input name="name" placeholder="Full name" required className={inputCls} />
                  <input name="email" type="email" placeholder="Email" required className={inputCls} />
                  <input name="password" type="password" placeholder="Password" required className={inputCls} />
                  <select name="campusDepartmentId" required className={`${inputCls} text-gray-700`}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="roll" placeholder="Roll number" required className={inputCls} />
                  <input name="session" placeholder="Session (e.g. 2023-24)" required className={inputCls} />
                  <input name="semester" type="number" min={1} max={12} placeholder="Semester" required className={inputCls} />
                  <select name="shift" className={`${inputCls} text-gray-700`}>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                  </select>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Create'}</button>
                    <button type="button" onClick={close} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </>
            )}

            {modal.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Edit Student</h2>
                <p className="text-sm text-gray-500 mb-5">{modal.student.user.name}</p>
                <form onSubmit={handleEdit} className="space-y-3">
                  <select name="campusDepartmentId" defaultValue={modal.student.campusDepartmentId} className={`${inputCls} text-gray-700`}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="roll" defaultValue={modal.student.roll} placeholder="Roll number" className={inputCls} />
                  <input name="session" defaultValue={modal.student.session} placeholder="Session" className={inputCls} />
                  <input name="semester" type="number" min={1} max={12} defaultValue={modal.student.semester} placeholder="Semester" className={inputCls} />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
                    <button type="button" onClick={close} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
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

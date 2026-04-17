'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { teacherApi, departmentApi, type Teacher, type Department } from '@/lib/api';

type Modal =
  | { type: 'create' }
  | { type: 'edit'; teacher: Teacher }
  | null;

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [tRes, dRes] = await Promise.all([teacherApi.list(), departmentApi.list()]);
    if (tRes.ok) { const { data } = await tRes.json(); setTeachers(data); }
    if (dRes.ok) { const { data } = await dRes.json(); setDepartments(data); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const close = () => { setModal(null); setError(''); };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await teacherApi.create({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      campusDepartmentId: fd.get('campusDepartmentId') as string,
      employeeId: (fd.get('employeeId') as string) || undefined,
      designation: (fd.get('designation') as string) || undefined,
      qualification: (fd.get('qualification') as string) || undefined,
    });
    if (res.ok) { close(); load(); } else { const d = await res.json(); setError(d.message ?? 'Error'); }
    setBusy(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modal?.type !== 'edit') return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await teacherApi.update(modal.teacher.id, {
      designation: (fd.get('designation') as string) || undefined,
      campusDepartmentId: (fd.get('campusDepartmentId') as string) || undefined,
    });
    if (res.ok) { close(); load(); } else { const d = await res.json(); setError(d.message ?? 'Error'); }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher and their account?')) return;
    await teacherApi.remove(id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage teaching staff across departments</p>
        </div>
        <Button onClick={() => setModal({ type: 'create' })}>+ Add Teacher</Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No teachers yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[#e2e8f0]">
              <tr>
                {['Teacher', 'Department', 'Employee ID', 'Designation', 'Qualification', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {teachers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{t.user.name}</p>
                    <p className="text-xs text-gray-400">{t.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{t.campusDepartment.department.shortName}</td>
                  <td className="px-5 py-4 text-gray-500">{t.employeeId ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{t.designation ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{t.qualification ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setModal({ type: 'edit', teacher: t })}
                        className="text-xs text-gray-500 hover:text-gray-800"
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >Delete</button>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Add Teacher</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                  <Input name="name" placeholder="Full name" required />
                  <Input name="email" type="email" placeholder="Email" required />
                  <Input name="password" type="password" placeholder="Password" required />
                  <select
                    name="campusDepartmentId"
                    required
                    className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department.name}</option>
                    ))}
                  </select>
                  <Input name="employeeId" placeholder="Employee ID (optional)" />
                  <Input name="designation" placeholder="Designation (optional)" />
                  <Input name="qualification" placeholder="Qualification (optional)" />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create'}</Button>
                    <button type="button" onClick={close} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </form>
              </>
            )}

            {modal.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Edit Teacher</h2>
                <p className="text-sm text-gray-500 mb-5">{modal.teacher.user.name}</p>
                <form onSubmit={handleEdit} className="space-y-3">
                  <select
                    name="campusDepartmentId"
                    defaultValue={modal.teacher.campusDepartmentId}
                    className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department.name}</option>
                    ))}
                  </select>
                  <Input name="designation" defaultValue={modal.teacher.designation ?? ''} placeholder="Designation" />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                    <button type="button" onClick={close} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
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

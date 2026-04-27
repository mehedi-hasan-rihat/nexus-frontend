'use client';

import { useEffect, useState } from 'react';
import { teacherApi, departmentApi, type Teacher, type Department } from '@/lib/api';
import { md } from '@/lib/styles';

type Modal = { type: 'create' } | { type: 'edit'; teacher: Teacher } | null;

export default function TeachersPage() {
  const [teachers, setTeachers]       = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState<Modal>(null);
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState('');

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
      name: fd.get('name') as string, email: fd.get('email') as string,
      password: fd.get('password') as string, campusDepartmentId: fd.get('campusDepartmentId') as string,
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
    await teacherApi.remove(id); load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--md-on-background)' }}>Teachers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>Manage teaching staff across departments</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} className={md.btnFilled} style={{ background: 'var(--md-primary)' }}>
          + Add Teacher
        </button>
      </div>

      <div className={`${md.card} overflow-hidden shadow-sm`} style={{ background: 'var(--md-surface-container)' }}>
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--md-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>No teachers yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--md-surface-low)', background: 'var(--md-surface-low)' }}>
                {['Teacher', 'Department', 'Employee ID', 'Designation', 'Qualification', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--md-on-surface-variant)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-b transition-colors duration-200 hover:bg-[#6750A4]/5" style={{ borderColor: 'var(--md-surface-low)' }}>
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: 'var(--md-on-background)' }}>{t.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>{t.user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}>
                      {t.campusDepartment.department.shortName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{t.employeeId ?? '—'}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{t.designation ?? '—'}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--md-on-surface-variant)' }}>{t.qualification ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setModal({ type: 'edit', teacher: t })} className={`${md.btnTonal} px-4 h-8 text-xs`} style={{ background: 'var(--md-secondary-container)', color: 'var(--md-primary)' }}>Edit</button>
                      <button onClick={() => handleDelete(t.id)} className={`${md.btnTonal} px-4 h-8 text-xs`} style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-[28px] p-6 shadow-xl" style={{ background: 'var(--md-background)' }}>
            {modal.type === 'create' && (
              <>
                <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--md-on-background)' }}>Add Teacher</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                  <input name="name" placeholder="Full name" required className={md.input} />
                  <input name="email" type="email" placeholder="Email" required className={md.input} />
                  <input name="password" type="password" placeholder="Password" required className={md.input} />
                  <select name="campusDepartmentId" required className={md.select}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="employeeId" placeholder="Employee ID (optional)" className={md.input} />
                  <input name="designation" placeholder="Designation (optional)" className={md.input} />
                  <input name="qualification" placeholder="Qualification (optional)" className={md.input} />
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
                <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--md-on-background)' }}>Edit Teacher</h2>
                <p className="text-sm mb-5" style={{ color: 'var(--md-on-surface-variant)' }}>{modal.teacher.user.name}</p>
                <form onSubmit={handleEdit} className="space-y-3">
                  <select name="campusDepartmentId" defaultValue={modal.teacher.campusDepartmentId} className={md.select}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                  <input name="designation" defaultValue={modal.teacher.designation ?? ''} placeholder="Designation" className={md.input} />
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

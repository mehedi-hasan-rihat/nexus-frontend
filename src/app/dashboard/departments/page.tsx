'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { departmentApi, type Department, type GlobalDepartment } from '@/lib/api';

type Modal =
  | { type: 'add' }
  | { type: 'remove'; dept: Department }
  | { type: 'assignHOD'; dept: Department }
  | { type: 'changeHOD'; dept: Department }
  | { type: 'removeHOD'; dept: Department }
  | null;

export default function DepartmentsPage() {
  const [campusDepts, setCampusDepts] = useState<Department[]>([]);
  const [allDepts, setAllDepts] = useState<GlobalDepartment[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [hodPassword, setHodPassword] = useState('');
  const [hodId, setHodId] = useState('');

  const fetchCampusDepts = useCallback(async () => {
    const res = await departmentApi.list();
    if (res.ok) { const { data } = await res.json(); setCampusDepts(data); }
  }, []);

  // Load campus departments immediately
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const campusRes = await departmentApi.list();
      if (campusRes.ok) { const { data } = await campusRes.json(); setCampusDepts(data); }
      setLoading(false);
    };
    init();
  }, []);

  // Lazy load global departments only when "Add Department" modal opens
  useEffect(() => {
    if (modal?.type === 'add' && allDepts.length === 0) {
      const loadGlobal = async () => {
        setLoadingGlobal(true);
        const allRes = await departmentApi.listGlobal();
        if (allRes.ok) { const { data } = await allRes.json(); setAllDepts(data); }
        setLoadingGlobal(false);
      };
      loadGlobal();
    }
  }, [modal, allDepts.length]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal) closeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };
    if (modal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [modal]);

  const closeModal = () => {
    setModal(null); setError('');
    setSelectedDeptId(''); setHodName(''); setHodEmail(''); setHodPassword(''); setHodId('');
  };

  const handleAdd = async () => {
    if (!selectedDeptId) return;
    setSubmitting(true); setError('');
    const res = await departmentApi.create({ departmentId: selectedDeptId });
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Failed'); setSubmitting(false); return; }
    await fetchCampusDepts();
    setSubmitting(false); closeModal();
  };

  const handleRemove = async (dept: Department) => {
    setSubmitting(true); setError('');
    const res = await departmentApi.remove(dept.id);
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Failed'); setSubmitting(false); return; }
    await fetchCampusDepts();
    setSubmitting(false); closeModal();
  };

  const handleAssignHOD = async (deptId: string) => {
    setSubmitting(true); setError('');
    const res = await departmentApi.setHodNew(deptId, { name: hodName, email: hodEmail, password: hodPassword });
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Failed'); setSubmitting(false); return; }
    await fetchCampusDepts();
    setSubmitting(false); closeModal();
  };

  const handleChangeHOD = async (deptId: string) => {
    setSubmitting(true); setError('');
    const res = await departmentApi.setHodExisting(deptId, hodId);
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Failed'); setSubmitting(false); return; }
    await fetchCampusDepts();
    setSubmitting(false); closeModal();
  };

  const handleRemoveHOD = async (dept: Department) => {
    setSubmitting(true); setError('');
    const res = await departmentApi.removeHod(dept.id);
    const data = await res.json();
    if (!res.ok) { setError(data.message || 'Failed'); setSubmitting(false); return; }
    await fetchCampusDepts();
    setSubmitting(false); closeModal();
  };

  const addedIds = new Set(campusDepts.map((d) => d.department.id));
  const availableDepts = allDepts.filter((d) => !addedIds.has(d.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--foreground]">Departments</h1>
          <p className="text-sm text-[--muted-foreground] mt-0.5">Manage departments and assign Heads of Department</p>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-2 bg-[--accent] hover:opacity-90 text-[--accent-foreground] text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity uppercase tracking-wide"
        >
          <span>+</span> Add Department
        </button>
      </div>

      <div className="bg-[--card] rounded-lg border border-[--border] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-10 h-10 border-4 border-[#1447E6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : campusDepts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[--muted-foreground] text-sm">No departments added yet.</p>
            <button onClick={() => setModal({ type: 'add' })} className="mt-2 text-sm text-[--accent] hover:underline font-medium">
              Add your first department →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--border] bg-[--muted] text-left">
                <th className="px-6 py-3 text-xs font-bold text-[--muted-foreground] uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-xs font-bold text-[--muted-foreground] uppercase tracking-wider">HOD</th>
                <th className="px-6 py-3 text-xs font-bold text-[--muted-foreground] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {campusDepts.map((cd) => (
                <tr key={cd.id} className="hover:bg-[--muted] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[--accent] rounded-lg flex items-center justify-center text-xs font-bold text-[--accent-foreground]">
                        {cd.department.shortName.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[--foreground]">{cd.department.name}</p>
                        <p className="text-xs text-[--muted-foreground]">{cd.department.shortName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cd.hod ? (
                      <div>
                        <p className="font-medium text-[--foreground]">{cd.hod.name}</p>
                        <p className="text-xs text-[--muted-foreground]">{cd.hod.email}</p>
                      </div>
                    ) : (
                      <span className="inline-block text-xs text-[--accent-foreground] bg-[--accent] px-2 py-1 rounded-md font-medium">
                        No HOD assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {!cd.hod ? (
                        <button
                          onClick={() => setModal({ type: 'assignHOD', dept: cd })}
                          className="text-xs font-bold text-[--accent] hover:text-[--foreground] px-3 py-1.5 rounded-lg hover:bg-[--muted] transition-colors uppercase tracking-wide"
                        >
                          Assign HOD
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setModal({ type: 'changeHOD', dept: cd })}
                            className="text-xs font-bold text-[--muted-foreground] hover:text-[--foreground] px-3 py-1.5 rounded-lg hover:bg-[--muted] transition-colors uppercase tracking-wide"
                          >
                            Change HOD
                          </button>
                          <button
                            onClick={() => setModal({ type: 'removeHOD', dept: cd })}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors uppercase tracking-wide"
                          >
                            Remove HOD
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setModal({ type: 'remove', dept: cd })}
                        className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors uppercase tracking-wide"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div ref={modalRef} className="bg-[--card] rounded-lg shadow-2xl w-full max-w-md p-6 border border-[--border] animate-in zoom-in-95 duration-200">

            {/* Add Department */}
            {modal.type === 'add' && (
              <>
                <h2 className="text-lg font-bold text-[--foreground] mb-1 uppercase tracking-wide">Add Department</h2>
                <p className="text-sm text-[--muted-foreground] mb-5">Select a department to add to your campus.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                {loadingGlobal ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#1447E6] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : availableDepts.length === 0 ? (
                  <p className="text-sm text-[--muted-foreground] text-center py-6">All available departments have been added.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-5 pr-1">
                    {availableDepts.map((d) => (
                      <label
                        key={d.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDeptId === d.id ? 'border-[--accent] bg-[--accent]/10' : 'border-[--border] hover:bg-[--muted]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dept"
                          value={d.id}
                          checked={selectedDeptId === d.id}
                          onChange={() => setSelectedDeptId(d.id)}
                          className="accent-[--accent]"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[--foreground]">{d.name}</p>
                          <p className="text-xs text-[--muted-foreground]">{d.shortName}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-[--border] text-sm font-bold text-[--muted-foreground] hover:bg-[--muted] transition-colors uppercase tracking-wide">Cancel</button>
                  <button onClick={handleAdd} disabled={!selectedDeptId || submitting} className="flex-1 py-2.5 rounded-lg bg-[--accent] hover:opacity-90 text-[--accent-foreground] text-sm font-bold transition-opacity disabled:opacity-50 uppercase tracking-wide">
                    {submitting ? 'Adding…' : 'Add'}
                  </button>
                </div>
              </>
            )}

            {/* Remove Department */}
            {modal.type === 'remove' && (
              <>
                <h2 className="text-lg font-bold text-[--foreground] mb-1 uppercase tracking-wide">Remove Department</h2>
                <p className="text-sm text-[--muted-foreground] mb-5">
                  Remove <span className="font-semibold text-[--foreground]">{modal.dept.department.name}</span> from your campus? This cannot be undone.
                </p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-[--border] text-sm font-bold text-[--muted-foreground] hover:bg-[--muted] transition-colors uppercase tracking-wide">Cancel</button>
                  <button onClick={() => handleRemove(modal.dept)} disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 uppercase tracking-wide">
                    {submitting ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </>
            )}

            {/* Assign HOD (new user) */}
            {modal.type === 'assignHOD' && (
              <>
                <h2 className="text-lg font-bold text-[--foreground] mb-1 uppercase tracking-wide">Assign HOD</h2>
                <p className="text-sm text-[--muted-foreground] mb-5">Create a new HOD account for <span className="font-semibold text-[--foreground]">{modal.dept.department.name}</span>.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="space-y-3 mb-5">
                  <input value={hodName} onChange={(e) => setHodName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 text-sm border border-[--border] bg-[--card] text-[--foreground] rounded-lg outline-none focus:ring-2 focus:ring-[--accent]" />
                  <input type="email" value={hodEmail} onChange={(e) => setHodEmail(e.target.value)} placeholder="Email address" className="w-full px-3 py-2.5 text-sm border border-[--border] bg-[--card] text-[--foreground] rounded-lg outline-none focus:ring-2 focus:ring-[--accent]" />
                  <input type="password" value={hodPassword} onChange={(e) => setHodPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2.5 text-sm border border-[--border] bg-[--card] text-[--foreground] rounded-lg outline-none focus:ring-2 focus:ring-[--accent]" />
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-[--border] text-sm font-bold text-[--muted-foreground] hover:bg-[--muted] transition-colors uppercase tracking-wide">Cancel</button>
                  <button onClick={() => handleAssignHOD(modal.dept.id)} disabled={submitting || !hodName || !hodEmail || !hodPassword} className="flex-1 py-2.5 rounded-lg bg-[--accent] hover:opacity-90 text-[--accent-foreground] text-sm font-bold transition-opacity disabled:opacity-50 uppercase tracking-wide">
                    {submitting ? 'Assigning…' : 'Assign'}
                  </button>
                </div>
              </>
            )}

            {/* Change HOD (existing user) */}
            {modal.type === 'changeHOD' && (
              <>
                <h2 className="text-lg font-bold text-[--foreground] mb-1 uppercase tracking-wide">Change HOD</h2>
                <p className="text-sm text-[--muted-foreground] mb-5">Enter the user ID of the new HOD for <span className="font-semibold text-[--foreground]">{modal.dept.department.name}</span>.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="mb-5">
                  <input value={hodId} onChange={(e) => setHodId(e.target.value)} placeholder="Paste user ID" className="w-full px-3 py-2.5 text-sm border border-[--border] bg-[--card] text-[--foreground] rounded-lg outline-none focus:ring-2 focus:ring-[--accent]" />
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-[--border] text-sm font-bold text-[--muted-foreground] hover:bg-[--muted] transition-colors uppercase tracking-wide">Cancel</button>
                  <button onClick={() => handleChangeHOD(modal.dept.id)} disabled={submitting || !hodId} className="flex-1 py-2.5 rounded-lg bg-[--accent] hover:opacity-90 text-[--accent-foreground] text-sm font-bold transition-opacity disabled:opacity-50 uppercase tracking-wide">
                    {submitting ? 'Updating…' : 'Change'}
                  </button>
                </div>
              </>
            )}

            {/* Remove HOD */}
            {modal.type === 'removeHOD' && (
              <>
                <h2 className="text-lg font-bold text-[--foreground] mb-1 uppercase tracking-wide">Remove HOD</h2>
                <p className="text-sm text-[--muted-foreground] mb-5">
                  Remove <span className="font-semibold text-[--foreground]">{modal.dept.hod?.name}</span> as HOD of {modal.dept.department.name}?
                </p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-[--border] text-sm font-bold text-[--muted-foreground] hover:bg-[--muted] transition-colors uppercase tracking-wide">Cancel</button>
                  <button onClick={() => handleRemoveHOD(modal.dept)} disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors disabled:opacity-50 uppercase tracking-wide">
                    {submitting ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

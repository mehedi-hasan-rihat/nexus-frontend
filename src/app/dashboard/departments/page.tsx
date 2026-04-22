'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [hodPassword, setHodPassword] = useState('');
  const [hodId, setHodId] = useState('');

  const fetchCampusDepts = useCallback(async () => {
    const res = await departmentApi.list();
    if (res.ok) { const { data } = await res.json(); setCampusDepts(data); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [campusRes, allRes] = await Promise.all([
        departmentApi.list(),
        departmentApi.listGlobal(),
      ]);
      if (campusRes.ok) { const { data } = await campusRes.json(); setCampusDepts(data); }
      if (allRes.ok) { const { data } = await allRes.json(); setAllDepts(data); }
      setLoading(false);
    };
    init();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage departments and assign Heads of Department</p>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <span>+</span> Add Department
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : campusDepts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No departments added yet.</p>
            <button onClick={() => setModal({ type: 'add' })} className="mt-2 text-sm text-blue-600 hover:underline">
              Add your first department →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">HOD</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {campusDepts.map((cd) => (
                <tr key={cd.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-xs font-bold text-blue-600">
                        {cd.department.shortName.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{cd.department.name}</p>
                        <p className="text-xs text-gray-400">{cd.department.shortName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {cd.hod ? (
                      <div>
                        <p className="font-medium text-gray-800">{cd.hod.name}</p>
                        <p className="text-xs text-gray-400">{cd.hod.email}</p>
                      </div>
                    ) : (
                      <span className="inline-block text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        No HOD assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {!cd.hod ? (
                        <button
                          onClick={() => setModal({ type: 'assignHOD', dept: cd })}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Assign HOD
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setModal({ type: 'changeHOD', dept: cd })}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            Change HOD
                          </button>
                          <button
                            onClick={() => setModal({ type: 'removeHOD', dept: cd })}
                            className="text-xs font-medium text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                          >
                            Remove HOD
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setModal({ type: 'remove', dept: cd })}
                        className="text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Add Department */}
            {modal.type === 'add' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Department</h2>
                <p className="text-sm text-gray-500 mb-5">Select a department to add to your campus.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                {availableDepts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">All available departments have been added.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-5 pr-1">
                    {availableDepts.map((d) => (
                      <label
                        key={d.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          selectedDeptId === d.id ? 'border-blue-500 bg-blue-50' : 'border-[#e2e8f0] hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dept"
                          value={d.id}
                          checked={selectedDeptId === d.id}
                          onChange={() => setSelectedDeptId(d.id)}
                          className="accent-blue-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.shortName}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleAdd} disabled={!selectedDeptId || submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Adding…' : 'Add Department'}
                  </button>
                </div>
              </>
            )}

            {/* Remove Department */}
            {modal.type === 'remove' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Remove Department</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Remove <span className="font-medium text-gray-800">{modal.dept.department.name}</span> from your campus? This cannot be undone.
                </p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={() => handleRemove(modal.dept)} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </>
            )}

            {/* Assign HOD (new user) */}
            {modal.type === 'assignHOD' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Assign HOD</h2>
                <p className="text-sm text-gray-500 mb-5">Create a new HOD account for <span className="font-medium text-gray-800">{modal.dept.department.name}</span>.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="space-y-3 mb-5">
                  <input value={hodName} onChange={(e) => setHodName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="email" value={hodEmail} onChange={(e) => setHodEmail(e.target.value)} placeholder="Email address" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="password" value={hodPassword} onChange={(e) => setHodPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={() => handleAssignHOD(modal.dept.id)} disabled={submitting || !hodName || !hodEmail || !hodPassword} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Assigning…' : 'Assign HOD'}
                  </button>
                </div>
              </>
            )}

            {/* Change HOD (existing user) */}
            {modal.type === 'changeHOD' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Change HOD</h2>
                <p className="text-sm text-gray-500 mb-5">Enter the user ID of the new HOD for <span className="font-medium text-gray-800">{modal.dept.department.name}</span>.</p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="mb-5">
                  <input value={hodId} onChange={(e) => setHodId(e.target.value)} placeholder="Paste user ID" className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={() => handleChangeHOD(modal.dept.id)} disabled={submitting || !hodId} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Updating…' : 'Change HOD'}
                  </button>
                </div>
              </>
            )}

            {/* Remove HOD */}
            {modal.type === 'removeHOD' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Remove HOD</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Remove <span className="font-medium text-gray-800">{modal.dept.hod?.name}</span> as HOD of {modal.dept.department.name}?
                </p>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={() => handleRemoveHOD(modal.dept)} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                    {submitting ? 'Removing…' : 'Remove HOD'}
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

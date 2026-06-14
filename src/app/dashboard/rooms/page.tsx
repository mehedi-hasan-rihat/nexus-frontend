'use client';

import { useEffect, useState } from 'react';
import { roomApi, type Room } from '@/lib/api';

const GRADIENT = 'linear-gradient(135deg, #0052FF, #4D7CFF)';

const ROOM_TYPES = ['Classroom', 'Lab', 'Seminar Hall', 'Auditorium', 'Conference Room'];

type Modal =
  | { type: 'create' }
  | { type: 'edit'; room: Room }
  | { type: 'bulk' }
  | null;

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
      active
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        : 'bg-[#f1f5f9] text-gray-400 border border-gray-200'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

const inp = 'w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white';
const sel = `${inp} cursor-pointer`;

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const load = async () => {
    setLoading(true);
    const res = await roomApi.list();
    if (res.ok) {
      const { data } = await res.json();
      setRooms(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const close = () => { setModal(null); setError(''); };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const visible = rooms.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && r.type !== filterType) return false;
    if (filterActive === 'active' && !r.isActive) return false;
    if (filterActive === 'inactive' && r.isActive) return false;
    return true;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalActive   = rooms.filter(r => r.isActive).length;
  const totalInactive = rooms.filter(r => !r.isActive).length;
  const totalCapacity = rooms.filter(r => r.isActive && r.capacity).reduce((s, r) => s + (r.capacity ?? 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await roomApi.create({
      name:     (fd.get('name') as string).trim(),
      type:     (fd.get('type') as string) || undefined,
      capacity: fd.get('capacity') ? Number(fd.get('capacity')) : undefined,
    });
    if (res.ok) { close(); load(); }
    else { const d = await res.json(); setError(d.message ?? 'Failed to create room'); }
    setBusy(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modal?.type !== 'edit') return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const res = await roomApi.update(modal.room.id, {
      name:     (fd.get('name') as string).trim(),
      type:     (fd.get('type') as string) || undefined,
      capacity: fd.get('capacity') ? Number(fd.get('capacity')) : undefined,
      isActive: fd.get('isActive') === 'true',
    });
    if (res.ok) { close(); load(); }
    else { const d = await res.json(); setError(d.message ?? 'Failed to update room'); }
    setBusy(false);
  };

  const handleBulk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = fd.get('names') as string;
    const names = raw.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) { setError('Enter at least one room name'); return; }
    setBusy(true); setError('');
    const res = await roomApi.bulkCreate(names);
    if (res.ok) { close(); load(); }
    else { const d = await res.json(); setError(d.message ?? 'Failed'); }
    setBusy(false);
  };

  const handleToggleActive = async (room: Room) => {
    await roomApi.update(room.id, { isActive: !room.isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room permanently?')) return;
    await roomApi.remove(id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage classrooms, labs, and halls available for scheduling
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <button
            onClick={() => setModal({ type: 'bulk' })}
            className="px-4 py-2 text-sm font-medium border border-[#e2e8f0] text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            Bulk Add
          </button>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all active:scale-[0.98]"
            style={{ background: GRADIENT }}
          >
            + Add Room
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Rooms',   value: totalActive,   icon: '✅' },
          { label: 'Inactive Rooms', value: totalInactive, icon: '🔴' },
          { label: 'Total Capacity', value: totalCapacity || '—', icon: '👤' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: GRADIENT }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by room name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
        >
          <option value="">All Types</option>
          {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="flex rounded-xl border border-[#e2e8f0] overflow-hidden text-sm">
          {(['all', 'active', 'inactive'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterActive(v)}
              className={`px-3 py-2 font-medium capitalize transition-all ${
                filterActive === v ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
              style={filterActive === v ? { background: GRADIENT } : undefined}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1447E6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🚪</div>
            <p className="text-sm text-gray-400">
              {rooms.length === 0
                ? 'No rooms yet. Click "+ Add Room" or "Bulk Add" to get started.'
                : 'No rooms match your filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[#e2e8f0]">
              <tr>
                {['Room', 'Type', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {visible.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${!r.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{r.type ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{r.capacity ?? '—'}</td>
                  <td className="px-5 py-4"><Badge active={r.isActive} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModal({ type: 'edit', room: r })}
                        className="text-xs text-gray-500 hover:text-gray-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(r)}
                        className={`text-xs font-medium ${r.isActive ? 'text-amber-500 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                      >
                        {r.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && visible.length > 0 && (
          <div className="px-5 py-3 border-t border-[#f1f5f9] bg-gray-50 text-xs text-gray-400">
            Showing {visible.length} of {rooms.length} rooms
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Create */}
            {modal.type === 'create' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Add Room</h2>
                <form onSubmit={handleCreate} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Room Name / Number <span className="text-red-400">*</span></label>
                    <input name="name" required placeholder="e.g. 401, Lab-1" className={inp} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Type</label>
                    <select name="type" className={sel}>
                      <option value="">— Select type —</option>
                      {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Capacity (seats)</label>
                    <input name="capacity" type="number" min={1} placeholder="e.g. 40" className={inp} />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-all"
                      style={{ background: GRADIENT }}
                    >
                      {busy ? 'Creating…' : 'Create Room'}
                    </button>
                    <button type="button" onClick={close} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Edit */}
            {modal.type === 'edit' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Edit Room</h2>
                <p className="text-sm text-gray-500 mb-5">{modal.room.name}</p>
                <form onSubmit={handleEdit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Room Name <span className="text-red-400">*</span></label>
                    <input name="name" required defaultValue={modal.room.name} className={inp} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Type</label>
                    <select name="type" defaultValue={modal.room.type ?? ''} className={sel}>
                      <option value="">— Select type —</option>
                      {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Capacity</label>
                    <input name="capacity" type="number" min={1} defaultValue={modal.room.capacity ?? ''} placeholder="e.g. 40" className={inp} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium">Status</label>
                    <select name="isActive" defaultValue={String(modal.room.isActive)} className={sel}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-all"
                      style={{ background: GRADIENT }}
                    >
                      {busy ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={close} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Bulk */}
            {modal.type === 'bulk' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Bulk Add Rooms</h2>
                <p className="text-sm text-gray-500 mb-5">Enter one room name per line</p>
                <form onSubmit={handleBulk} className="space-y-3">
                  <textarea
                    name="names"
                    rows={8}
                    placeholder={'101\n102\n103\nLab-1\nLab-2\nSeminar Hall'}
                    className="w-full px-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono resize-none"
                  />
                  <p className="text-xs text-gray-400">Duplicate names will be skipped automatically.</p>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-all"
                      style={{ background: GRADIENT }}
                    >
                      {busy ? 'Adding…' : 'Add Rooms'}
                    </button>
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

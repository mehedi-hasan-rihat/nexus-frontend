'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '../layout';
import {
  routineApi, departmentApi, subjectApi, teacherApi, roomApi,
  type Routine, type RoutineSlot, type Department,
  type Subject, type Teacher, type Room, type Shift, type GenerateRoutinePayload,
} from '@/lib/api';

const GRADIENT = 'linear-gradient(135deg, #0052FF, #4D7CFF)';
const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }

/** "09:00" + 45 minutes → "09:45" */
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/** "09:00" + duration 45 → "09:00-09:45" */
function makeSlot(start: string, duration: number) {
  return `${start}-${addMinutes(start, duration)}`;
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Config panel (days, time slots, rooms, sections, teacher assignments)
// ─────────────────────────────────────────────────────────────────────────────

interface SectionCfg {
  suffix: string;                    // "A", "B" → becomes "CSE-1A"
  subjectWeekly: { code: string; weekly_classes: number }[];
}

interface TeacherMapping {
  teacherId: string;
  subjectCodes: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW TABS
// ─────────────────────────────────────────────────────────────────────────────
type ViewTab = 'section' | 'teacher' | 'room' | 'department';

// ─────────────────────────────────────────────────────────────────────────────
// TIMETABLE GRID — reads a list of slots and renders day(row) × time(col)
// ─────────────────────────────────────────────────────────────────────────────
function TimetableGrid({
  slots,
  days,
  timeSlots,
  groupLabel,
  editable,
  onCellClick,
}: {
  slots: RoutineSlot[];
  days: string[];
  timeSlots: string[];
  groupLabel?: string;
  editable?: boolean;
  onCellClick?: (slot: RoutineSlot) => void;
}) {
  const map = new Map<string, RoutineSlot>();
  for (const s of slots) map.set(`${s.day}|${s.timeSlot}`, s);

  return (
    <div className="overflow-x-auto rounded-xl border border-[--border]">
      {groupLabel && (
        <div className="px-4 py-2.5 bg-[--muted] border-b border-[--border]">
          <span className="text-xs font-bold text-[--foreground] uppercase tracking-wide">{groupLabel}</span>
        </div>
      )}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {/* vertical label: Day */}
            <th className="bg-[--muted] border border-[--border] px-3 py-2.5 text-left text-[--muted-foreground] font-semibold uppercase tracking-wide w-24 whitespace-nowrap">
              Day / Time
            </th>
            {timeSlots.map(ts => (
              <th key={ts} className="bg-[--muted] border border-[--border] px-2 py-2.5 text-center text-[--muted-foreground] font-semibold whitespace-nowrap min-w-[110px]">
                {ts}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td className="bg-[--muted] border border-[--border] px-3 py-2 font-semibold text-[--foreground] whitespace-nowrap">
                {day}
              </td>
              {timeSlots.map(ts => {
                const cell = map.get(`${day}|${ts}`);
                return (
                  <td
                    key={ts}
                    onClick={() => cell && editable && onCellClick?.(cell)}
                    className={`border border-[--border] px-2 py-1.5 align-top transition-colors ${
                      !cell ? 'bg-[--muted]/20' :
                      editable ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20' : ''
                    }`}
                  >
                    {cell ? (
                      <div className="space-y-0.5 text-center">
                        <p className="font-bold text-[--foreground]">{cell.subject.code}</p>
                        <p className="text-[--muted-foreground] leading-tight truncate max-w-[100px] mx-auto">{cell.subject.name}</p>
                        <p className="text-blue-600 font-medium">{cell.teacher.user.name}</p>
                        <p className="text-[--muted-foreground]">🚪 {cell.room}</p>
                      </div>
                    ) : (
                      <span className="block text-center text-[--muted-foreground]/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT SLOT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EditSlotModal({
  slot, subjects, teachers, rooms, days, timeSlots,
  onSave, onClose,
}: {
  slot: RoutineSlot;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  days: string[];
  timeSlots: string[];
  onSave: (slotId: string, data: object) => Promise<void>;
  onClose: () => void;
}) {
  const [day, setDay] = useState(slot.day);
  const [ts, setTs] = useState(slot.timeSlot);
  const [room, setRoom] = useState(slot.room);
  const [subjectId, setSubjectId] = useState(slot.subjectId);
  const [teacherId, setTeacherId] = useState(slot.teacherId);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const sel = 'w-full px-3 py-2 text-sm border border-[--border] rounded-lg bg-[--card] text-[--foreground] outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[--card] rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-[--foreground] mb-4">Edit Slot</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[--muted-foreground] mb-1 block">Day</label>
              <select value={day} onChange={e => setDay(e.target.value)} className={sel}>
                {days.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[--muted-foreground] mb-1 block">Time Slot</label>
              <select value={ts} onChange={e => setTs(e.target.value)} className={sel}>
                {timeSlots.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[--muted-foreground] mb-1 block">Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={sel}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[--muted-foreground] mb-1 block">Teacher</label>
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className={sel}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.user.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[--muted-foreground] mb-1 block">Room</label>
            <select value={room} onChange={e => setRoom(e.target.value)} className={sel}>
              {rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.name}>{r.name}{r.type ? ` (${r.type})` : ''}</option>)}
            </select>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true); setErr('');
                try { await onSave(slot.id, { day, timeSlot: ts, room, subjectId, teacherId }); onClose(); }
                catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Error'); }
                finally { setBusy(false); }
              }}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
              style={{ background: GRADIENT }}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onClose} className="text-sm text-[--muted-foreground] hover:text-[--foreground]">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — SETUP WIZARD  (days + time slots + rooms + sections + teachers)
// ─────────────────────────────────────────────────────────────────────────────
function SetupWizard({
  departments, subjects, teachers, rooms,
  onGenerate, onClose,
}: {
  departments: Department[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  onGenerate: (payload: GenerateRoutinePayload) => Promise<void>;
  onClose: () => void;
}) {
  // ── Step index: 0=meta, 1=days+slots, 2=rooms, 3=sections, 4=teachers
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // meta
  const [deptId, setDeptId] = useState(departments[0]?.id ?? '');
  const [semester, setSemester] = useState(1);
  const [shift, setShift] = useState<Shift>('MORNING');

  // days
  const [days, setDays] = useState<string[]>(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);

  // time slots: array of {start, duration}
  const [slotInputs, setSlotInputs] = useState<{ start: string; duration: number }[]>([
    { start: '09:00', duration: 45 },
    { start: '09:45', duration: 45 },
    { start: '10:30', duration: 45 },
    { start: '11:15', duration: 45 },
    { start: '12:00', duration: 45 },
  ]);

  // rooms
  const [selRooms, setSelRooms] = useState<string[]>(
    rooms.filter(r => r.isActive).map(r => r.name)
  );

  // sections
  const [sections, setSections] = useState<SectionCfg[]>([{ suffix: 'A', subjectWeekly: [] }]);

  // teacher mappings
  const [tMaps, setTMaps] = useState<TeacherMapping[]>([]);

  const filteredSubjects = subjects.filter(
    s => s.campusDepartmentId === deptId && s.semester === semester
  );

  const deptShort = departments.find(d => d.id === deptId)?.department.shortName ?? 'SEC';

  const timeSlots = slotInputs.map(si => makeSlot(si.start, si.duration));

  const sel = 'w-full px-3 py-2 text-sm border border-[--border] rounded-lg bg-[--card] text-[--foreground] outline-none focus:ring-2 focus:ring-blue-500';
  const inp = sel;

  const STEPS = ['Basic Info', 'Days & Times', 'Rooms', 'Sections', 'Teachers'];

  async function submit() {
    setBusy(true); setErr('');
    const payload: GenerateRoutinePayload = {
      campusDepartmentId: deptId,
      semester,
      shift,
      days,
      timeSlots,
      rooms: selRooms.map(r => ({ room: r })),
      teachers: tMaps.map(m => ({ id: m.teacherId, subjects: m.subjectCodes })),
      sections: sections.map(sec => ({
        section: `${deptShort}-${semester}${sec.suffix}`,
        subjects: sec.subjectWeekly,
      })),
    };
    try {
      await onGenerate(payload);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed');
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[--card] rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Stepper header */}
        <div className="px-6 pt-6 pb-4 border-b border-[--border]">
          <h2 className="text-lg font-bold text-[--foreground] mb-4">Create Routine</h2>
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-all ${
                    i < step ? 'bg-emerald-500 text-white cursor-pointer' :
                    i === step ? 'text-white' : 'bg-[--muted] text-[--muted-foreground]'
                  }`}
                  style={i === step ? { background: GRADIENT } : undefined}
                >
                  {i < step ? '✓' : i + 1}
                </button>
                <span className={`ml-1.5 text-xs font-medium hidden sm:block ${i === step ? 'text-[--foreground]' : 'text-[--muted-foreground]'}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[--border] mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-[--muted-foreground] mb-1 block font-medium">Department</label>
                  <select value={deptId} onChange={e => setDeptId(e.target.value)} className={sel}>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.department.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[--muted-foreground] mb-1 block font-medium">Semester</label>
                  <input type="number" min={1} max={8} value={semester} onChange={e => setSemester(Number(e.target.value))} className={inp} />
                </div>
                <div>
                  <label className="text-xs text-[--muted-foreground] mb-1 block font-medium">Shift</label>
                  <select value={shift} onChange={e => setShift(e.target.value as Shift)} className={sel}>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Days + Time Slots ── */}
          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-[--muted-foreground] mb-2 block font-medium">Select Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map(d => (
                    <label key={d} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-all select-none ${
                      days.includes(d)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : 'border-[--border] text-[--muted-foreground] hover:border-[--foreground]'
                    }`}>
                      <input type="checkbox" className="sr-only" checked={days.includes(d)}
                        onChange={() => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} />
                      {d.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[--muted-foreground] font-medium">Time Slots</label>
                  <button
                    type="button"
                    onClick={() => {
                      const last = slotInputs[slotInputs.length - 1];
                      const nextStart = last ? addMinutes(last.start, last.duration) : '09:00';
                      setSlotInputs(prev => [...prev, { start: nextStart, duration: 45 }]);
                    }}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >+ Add Slot</button>
                </div>
                <div className="space-y-2">
                  {slotInputs.map((si, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-[--muted-foreground] w-5 text-right">{i + 1}.</span>
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="time"
                          value={si.start}
                          onChange={e => setSlotInputs(prev => prev.map((s, j) => j === i ? { ...s, start: e.target.value } : s))}
                          className="px-2 py-1.5 text-sm border border-[--border] rounded-lg bg-[--card] text-[--foreground] outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-[--muted-foreground]">+</span>
                        <input
                          type="number"
                          min={15}
                          max={180}
                          step={5}
                          value={si.duration}
                          onChange={e => setSlotInputs(prev => prev.map((s, j) => j === i ? { ...s, duration: Number(e.target.value) } : s))}
                          className="w-16 px-2 py-1.5 text-sm border border-[--border] rounded-lg bg-[--card] text-[--foreground] outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs text-[--muted-foreground]">min</span>
                        <span className="text-xs font-mono text-[--foreground] ml-1 bg-[--muted] px-2 py-0.5 rounded">
                          {makeSlot(si.start, si.duration)}
                        </span>
                      </div>
                      {slotInputs.length > 1 && (
                        <button onClick={() => setSlotInputs(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Rooms ── */}
          {step === 2 && (
            <div>
              <label className="text-xs text-[--muted-foreground] mb-2 block font-medium">
                Select Rooms to Use ({selRooms.length} selected)
              </label>
              {rooms.length === 0 ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
                  No rooms found. Please add rooms in Room Management first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rooms.map(r => (
                    <label key={r.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      selRooms.includes(r.name)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : r.isActive
                        ? 'border-[--border] hover:border-[--foreground]'
                        : 'border-[--border] opacity-40 cursor-not-allowed'
                    }`}>
                      <input type="checkbox" className="sr-only" disabled={!r.isActive}
                        checked={selRooms.includes(r.name)}
                        onChange={() => {
                          if (!r.isActive) return;
                          setSelRooms(prev => prev.includes(r.name) ? prev.filter(x => x !== r.name) : [...prev, r.name]);
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold">{r.name}</p>
                        {r.type && <p className="text-xs opacity-70">{r.type}</p>}
                        {r.capacity && <p className="text-xs opacity-70">Cap: {r.capacity}</p>}
                        {!r.isActive && <p className="text-xs text-red-400">Inactive</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Sections ── */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-[--muted-foreground] font-medium">Sections & Subject Weekly Classes</label>
                <button
                  type="button"
                  onClick={() => setSections(prev => [...prev, { suffix: String.fromCharCode(65 + prev.length), subjectWeekly: [] }])}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >+ Add Section</button>
              </div>
              <div className="space-y-4">
                {sections.map((sec, si) => (
                  <div key={si} className="border border-[--border] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[--muted-foreground]">Suffix</label>
                        <input
                          value={sec.suffix}
                          onChange={e => setSections(prev => prev.map((s, j) => j === si ? { ...s, suffix: e.target.value } : s))}
                          className="w-12 px-2 py-1 text-sm border border-[--border] rounded-lg bg-[--card] text-[--foreground]"
                        />
                      </div>
                      <span className="text-xs text-[--muted-foreground]">
                        → <strong className="text-[--foreground]">{deptShort}-{semester}{sec.suffix}</strong>
                      </span>
                      {sections.length > 1 && (
                        <button onClick={() => setSections(prev => prev.filter((_, j) => j !== si))}
                          className="ml-auto text-xs text-red-400 hover:text-red-600">Remove</button>
                      )}
                    </div>

                    {filteredSubjects.length === 0 ? (
                      <p className="text-xs text-amber-600">No subjects found for Sem {semester} in this department</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredSubjects.map(subj => {
                          const entry = sec.subjectWeekly.find(x => x.code === subj.code);
                          return (
                            <div key={subj.id} className="flex items-center gap-3">
                              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                <input type="checkbox" checked={!!entry}
                                  onChange={() => setSections(prev => prev.map((s, j) => {
                                    if (j !== si) return s;
                                    const has = s.subjectWeekly.find(x => x.code === subj.code);
                                    return { ...s, subjectWeekly: has ? s.subjectWeekly.filter(x => x.code !== subj.code) : [...s.subjectWeekly, { code: subj.code, weekly_classes: 2 }] };
                                  }))}
                                  className="rounded"
                                />
                                <span className="text-xs text-[--foreground]">{subj.code} <span className="text-[--muted-foreground]">— {subj.name}</span></span>
                              </label>
                              {entry && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[--muted-foreground]">×/week</span>
                                  <input type="number" min={1} max={7} value={entry.weekly_classes}
                                    onChange={e => setSections(prev => prev.map((s, j) => j !== si ? s : {
                                      ...s, subjectWeekly: s.subjectWeekly.map(x => x.code === subj.code ? { ...x, weekly_classes: Number(e.target.value) } : x)
                                    }))}
                                    className="w-12 px-2 py-1 text-xs border border-[--border] rounded bg-[--card] text-[--foreground]"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Teachers ── */}
          {step === 4 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-[--muted-foreground] font-medium">Assign Subjects to Teachers</label>
                <button
                  type="button"
                  onClick={() => setTMaps(prev => [...prev, { teacherId: teachers[0]?.id ?? '', subjectCodes: [] }])}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >+ Add Teacher</button>
              </div>
              {tMaps.length === 0 && (
                <p className="text-xs text-[--muted-foreground] bg-[--muted] px-4 py-3 rounded-lg">
                  Add teachers and assign which subjects each can teach.
                </p>
              )}
              <div className="space-y-3">
                {tMaps.map((m, i) => (
                  <div key={i} className="border border-[--border] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <select value={m.teacherId}
                        onChange={e => setTMaps(prev => prev.map((t, j) => j === i ? { ...t, teacherId: e.target.value } : t))}
                        className={`flex-1 ${sel}`}
                      >
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.user.name} · {t.campusDepartment.department.shortName}</option>)}
                      </select>
                      <button onClick={() => setTMaps(prev => prev.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    <div>
                      <p className="text-xs text-[--muted-foreground] mb-1.5">Can teach:</p>
                      <div className="flex flex-wrap gap-2">
                        {filteredSubjects.length === 0
                          ? <span className="text-xs text-amber-600">No subjects for Sem {semester}</span>
                          : filteredSubjects.map(s => (
                            <label key={s.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-xs transition-all ${
                              m.subjectCodes.includes(s.code)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                                : 'border-[--border] text-[--muted-foreground]'
                            }`}>
                              <input type="checkbox" className="sr-only" checked={m.subjectCodes.includes(s.code)}
                                onChange={() => setTMaps(prev => prev.map((t, j) => j !== i ? t : {
                                  ...t, subjectCodes: t.subjectCodes.includes(s.code) ? t.subjectCodes.filter(c => c !== s.code) : [...t.subjectCodes, s.code]
                                }))}
                              />
                              {s.code}
                            </label>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="text-sm text-[--muted-foreground] hover:text-[--foreground]"
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 text-sm font-medium text-white rounded-xl"
                style={{ background: GRADIENT }}
              >
                Next →
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={submit}
                className="px-5 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-50"
                style={{ background: GRADIENT }}
              >
                {busy ? 'Generating…' : '🗓 Generate Routine'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW PANEL — 3 copies: by section, by teacher, by room, by department
// ─────────────────────────────────────────────────────────────────────────────
function RoutineViews({
  routine,
  days,
  timeSlots,
  editable,
  subjects,
  teachers,
  rooms,
  onSlotSave,
}: {
  routine: Routine;
  days: string[];
  timeSlots: string[];
  editable: boolean;
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  onSlotSave: (slotId: string, data: object) => Promise<void>;
}) {
  const [tab, setTab] = useState<ViewTab>('section');
  const [editSlot, setEditSlot] = useState<RoutineSlot | null>(null);

  const slots = routine.slots;

  // derive used days/timeslots from the actual data (so grid only shows relevant ones)
  const usedDays = days.length > 0 ? days : [...new Set(slots.map(s => s.day))].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b));
  const usedSlots = timeSlots.length > 0 ? timeSlots : [...new Set(slots.map(s => s.timeSlot))].sort();

  // Group by teacher
  const byTeacher = new Map<string, RoutineSlot[]>();
  for (const s of slots) {
    const key = s.teacher.user.name;
    if (!byTeacher.has(key)) byTeacher.set(key, []);
    byTeacher.get(key)!.push(s);
  }

  // Group by room
  const byRoom = new Map<string, RoutineSlot[]>();
  for (const s of slots) {
    if (!byRoom.has(s.room)) byRoom.set(s.room, []);
    byRoom.get(s.room)!.push(s);
  }

  const tabs: { key: ViewTab; label: string; icon: string }[] = [
    { key: 'section', label: 'Section View', icon: '🎓' },
    { key: 'teacher', label: 'Teacher View', icon: '👨‍🏫' },
    { key: 'room',    label: 'Room View',    icon: '🚪' },
    { key: 'department', label: 'Dept Overview', icon: '🏛' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-[--muted] p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-1 justify-center ${
              tab === t.key
                ? 'bg-[--card] text-[--foreground] shadow-sm'
                : 'text-[--muted-foreground] hover:text-[--foreground]'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Section View — single timetable for this section */}
      {tab === 'section' && (
        <TimetableGrid
          slots={slots}
          days={usedDays}
          timeSlots={usedSlots}
          editable={editable}
          onCellClick={setEditSlot}
        />
      )}

      {/* Teacher View — one grid per teacher */}
      {tab === 'teacher' && (
        <div className="space-y-6">
          {[...byTeacher.entries()].map(([name, tSlots]) => (
            <TimetableGrid
              key={name}
              slots={tSlots}
              days={usedDays}
              timeSlots={usedSlots}
              groupLabel={`👨‍🏫 ${name}`}
              editable={false}
            />
          ))}
          {byTeacher.size === 0 && <p className="text-sm text-[--muted-foreground] text-center py-8">No slots yet.</p>}
        </div>
      )}

      {/* Room View — one grid per room */}
      {tab === 'room' && (
        <div className="space-y-6">
          {[...byRoom.entries()].map(([room, rSlots]) => (
            <TimetableGrid
              key={room}
              slots={rSlots}
              days={usedDays}
              timeSlots={usedSlots}
              groupLabel={`🚪 Room ${room}`}
              editable={false}
            />
          ))}
          {byRoom.size === 0 && <p className="text-sm text-[--muted-foreground] text-center py-8">No slots yet.</p>}
        </div>
      )}

      {/* Department view — all slots in a flat full grid */}
      {tab === 'department' && (
        <TimetableGrid
          slots={slots}
          days={usedDays}
          timeSlots={usedSlots}
          groupLabel={`🏛 ${routine.section} — Full Department View`}
          editable={editable}
          onCellClick={setEditSlot}
        />
      )}

      {editSlot && (
        <EditSlotModal
          slot={editSlot}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          days={usedDays}
          timeSlots={usedSlots}
          onSave={onSlotSave}
          onClose={() => setEditSlot(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RoutinePage() {
  const { role } = useUser();
  const isManager = role === 'PRINCIPAL' || role === 'HOD';

  const [departments, setDepartments]   = useState<Department[]>([]);
  const [subjects,    setSubjects]      = useState<Subject[]>([]);
  const [teachers,    setTeachers]      = useState<Teacher[]>([]);
  const [rooms,       setRooms]         = useState<Room[]>([]);
  const [routines,    setRoutines]      = useState<Routine[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selected,    setSelected]      = useState<Routine | null>(null);
  const [showWizard,  setShowWizard]    = useState(false);
  const [loading,     setLoading]       = useState(true);
  const [error,       setError]         = useState('');
  const [actionBusy,  setActionBusy]    = useState(false);

  const loadBase = useCallback(async () => {
    setLoading(true);
    try {
      const calls: Promise<Response>[] = [
        departmentApi.list(),
        subjectApi.list(),
        roomApi.list(),
      ];
      if (isManager) calls.push(teacherApi.list());

      const [dRes, sRes, rRes, tRes] = await Promise.all(calls);

      if (dRes.ok) {
        const { data } = await dRes.json();
        setDepartments(data ?? []);
        if (data?.[0]?.id && !selectedDept) setSelectedDept(data[0].id);
      }
      if (sRes.ok) { const { data } = await sRes.json(); setSubjects(data ?? []); }
      if (rRes.ok) { const { data } = await rRes.json(); setRooms(data ?? []); }
      if (tRes?.ok) { const { data } = await tRes.json(); setTeachers(data ?? []); }
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  }, [isManager]); // eslint-disable-line

  const loadRoutines = useCallback(async (deptId: string) => {
    if (!deptId) return;
    try {
      const res = await routineApi.list(deptId);
      if (res.ok) { const { data } = await res.json(); setRoutines(data ?? []); setSelected(null); }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => { loadBase(); }, []); // eslint-disable-line
  useEffect(() => { if (selectedDept) loadRoutines(selectedDept); }, [selectedDept, loadRoutines]);

  const handleGenerate = async (payload: GenerateRoutinePayload) => {
    const res = await routineApi.generate(payload);
    const body = await res.json();
    if (!res.ok) throw new Error(body.message ?? 'Generation failed');
    await loadRoutines(payload.campusDepartmentId);
  };

  const handlePublish = async (routineId: string, publish: boolean) => {
    setActionBusy(true);
    const res = await routineApi.publish(routineId, publish);
    if (res.ok) {
      await loadRoutines(selectedDept);
      setSelected(prev => prev ? { ...prev, isPublished: publish } : prev);
    }
    setActionBusy(false);
  };

  const handleDelete = async (routineId: string) => {
    if (!confirm('Delete this routine and all its slots?')) return;
    setActionBusy(true);
    await routineApi.delete(routineId);
    await loadRoutines(selectedDept);
    setSelected(null);
    setActionBusy(false);
  };

  const handleSlotSave = async (slotId: string, data: object) => {
    const res = await routineApi.updateSlot(slotId, data as Parameters<typeof routineApi.updateSlot>[1]);
    const body = await res.json();
    if (!res.ok) throw new Error(body.message ?? 'Update failed');
    if (selected) {
      const rRes = await routineApi.getById(selected.id);
      if (rRes.ok) {
        const { data: rd } = await rRes.json();
        setSelected(rd);
        setRoutines(prev => prev.map(r => r.id === rd.id ? rd : r));
      }
    }
  };

  // Derive the days + slots used by selected routine (for view grids)
  const selectedDays = selected
    ? [...new Set(selected.slots.map(s => s.day))].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
    : [];
  const selectedTimeSlots = selected
    ? [...new Set(selected.slots.map(s => s.timeSlot))].sort()
    : [];

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-5 animate-pulse">
      <div className="h-8 w-48 bg-[--muted] rounded" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="h-96 bg-[--card] rounded-2xl border border-[--border]" />
        <div className="lg:col-span-2 h-96 bg-[--card] rounded-2xl border border-[--border]" />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto py-20 text-center">
      <p className="text-[--muted-foreground] text-sm">{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[--foreground]">Class Routine</h1>
          <p className="text-sm text-[--muted-foreground] mt-0.5">
            {isManager
              ? 'Create and manage weekly class schedules. View by section, teacher, or room.'
              : 'View your weekly class schedule'}
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowWizard(true)}
            className="sm:ml-auto px-5 py-2.5 text-sm font-medium text-white rounded-xl whitespace-nowrap transition-all active:scale-[0.98]"
            style={{ background: GRADIENT }}
          >
            + Create Routine
          </button>
        )}
      </div>

      {/* Department tabs */}
      {departments.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <button key={d.id} onClick={() => setSelectedDept(d.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedDept === d.id ? 'text-white' : 'bg-[--card] border border-[--border] text-[--muted-foreground] hover:text-[--foreground]'
              }`}
              style={selectedDept === d.id ? { background: GRADIENT } : undefined}
            >
              {d.department.shortName}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">

        {/* ── Routine list sidebar ── */}
        <div className="bg-[--card] rounded-2xl border border-[--border] overflow-hidden">
          <div className="px-4 py-4 border-b border-[--border]">
            <h2 className="font-semibold text-[--foreground] text-sm">Routines</h2>
            <p className="text-xs text-[--muted-foreground] mt-0.5">{routines.length} saved</p>
          </div>
          <div className="divide-y divide-[--border] max-h-[600px] overflow-y-auto">
            {routines.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-[--muted-foreground]">
                {isManager ? 'Click "+ Create Routine" to generate one.' : 'No published routines.'}
              </div>
            ) : routines.map(r => (
              <button key={r.id} onClick={() => setSelected(r)}
                className={`w-full text-left px-4 py-3.5 hover:bg-[--muted] transition-colors ${selected?.id === r.id ? 'bg-[--muted]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[--foreground] truncate">{r.section}</p>
                    <p className="text-xs text-[--muted-foreground]">Sem {r.semester} · {r.shift}</p>
                    <p className="text-xs text-[--muted-foreground]">{r.slots.length} classes/wk</p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    {r.isPublished
                      ? <Badge text="Live" color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                      : <Badge text="Draft" color="bg-amber-50 text-amber-600 border border-amber-100" />
                    }
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main view area ── */}
        <div className="lg:col-span-3 space-y-4">
          {!selected ? (
            <div className="bg-[--card] rounded-2xl border border-[--border] py-24 text-center">
              <div className="text-4xl mb-3">🗓</div>
              <p className="text-sm text-[--muted-foreground]">Select a routine to view the timetable</p>
            </div>
          ) : (
            <>
              {/* Routine meta bar */}
              <div className="bg-[--card] rounded-2xl border border-[--border] px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[--foreground]">{selected.section}</h2>
                    {selected.isPublished
                      ? <Badge text="Published" color="bg-emerald-50 text-emerald-600 border border-emerald-100" />
                      : <Badge text="Draft" color="bg-amber-50 text-amber-600 border border-amber-100" />
                    }
                  </div>
                  <p className="text-sm text-[--muted-foreground] mt-0.5">
                    Semester {selected.semester} · {selected.shift} · {selected.slots.length} classes/week
                  </p>
                </div>
                {isManager && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      disabled={actionBusy}
                      onClick={() => handlePublish(selected.id, !selected.isPublished)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[--border] hover:bg-[--muted] text-[--foreground] disabled:opacity-50 transition-all"
                    >
                      {selected.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      disabled={actionBusy}
                      onClick={() => handleDelete(selected.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* 3 view copies */}
              <RoutineViews
                routine={selected}
                days={selectedDays}
                timeSlots={selectedTimeSlots}
                editable={isManager}
                subjects={subjects.filter(s => s.campusDepartmentId === selectedDept)}
                teachers={teachers}
                rooms={rooms}
                onSlotSave={handleSlotSave}
              />
            </>
          )}
        </div>
      </div>

      {/* Setup Wizard */}
      {showWizard && (
        <SetupWizard
          departments={departments}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          onGenerate={handleGenerate}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

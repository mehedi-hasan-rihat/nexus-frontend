import { tokenStore } from './token';

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const req = (url: string, method = 'GET', body?: unknown): Promise<Response> => {
  const sessionToken = tokenStore.getSession();
  const accessToken = tokenStore.getAccess();

  return fetch(`${BASE}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
      ...(accessToken && { 'X-Access-Token': accessToken }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  campusId: string;
  departmentId: string;
  department: { id: string; name: string; shortName: string };
  hod: { id: string; name: string; email: string } | null;
}

export interface GlobalDepartment {
  id: string;
  name: string;
  shortName: string;
}

export interface Teacher {
  id: string;
  userId: string;
  campusDepartmentId: string;
  employeeId: string | null;
  designation: string | null;
  qualification: string | null;
  user: { id: string; name: string; email: string; role: string };
  campusDepartment: { department: { name: string; shortName: string } };
}

export interface Student {
  id: string;
  userId: string;
  campusDepartmentId: string;
  roll: string;
  session: string;
  semester: number;
  shift: 'MORNING' | 'EVENING';
  user: { id: string; name: string; email: string; role: string };
  campusDepartment: { department: { name: string; shortName: string } };
}

export type CreditType = 'ONE' | 'TWO' | 'THREE' | 'FOUR';
export type AssessmentType = 'CLASS_TEST' | 'QUIZ' | 'MIDTERM' | 'ATTENDANCE';

export interface Subject {
  id: string;
  campusDepartmentId: string;
  name: string;
  code: string;
  semester: number;
  maxMarks: number;
  credit: CreditType;
  campusDepartment: { department: { name: string; shortName: string } };
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  assessmentType: AssessmentType;
  assessmentNo: number;
  marksObtained: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  student: { id: string; roll: string; semester: number; user: { id: string; name: string; email: string } };
  subject: { id: string; name: string; code: string; semester: number; maxMarks: number };
}

// ── Departments ────────────────────────────────────────────────────────────

export const departmentApi = {
  listGlobal:     ()                                                    => req('/departments'),
  list:           ()                                                    => req('/principal/departments'),
  create:         (body: { departmentId: string })                     => req('/principal/departments', 'POST', body),
  remove:         (id: string)                                         => req(`/principal/departments/${id}`, 'DELETE'),
  setHodNew:      (id: string, body: { name: string; email: string; password: string }) => req(`/principal/departments/${id}/hod`, 'POST', body),
  setHodExisting: (id: string, hodId: string)                         => req(`/principal/departments/${id}/hod`, 'PATCH', { hodId }),
  removeHod:      (id: string)                                         => req(`/principal/departments/${id}/hod`, 'DELETE'),
};

// ── Teachers ───────────────────────────────────────────────────────────────

export const teacherApi = {
  list:   ()                                                             => req('/principal/teachers'),
  create: (body: { name: string; email: string; password: string; campusDepartmentId: string; employeeId?: string; designation?: string; qualification?: string }) => req('/principal/teachers', 'POST', body),
  update: (id: string, body: Partial<{ designation: string; campusDepartmentId: string }>) => req(`/principal/teachers/${id}`, 'PATCH', body),
  remove: (id: string)                                                   => req(`/principal/teachers/${id}`, 'DELETE'),
};

// ── Students ───────────────────────────────────────────────────────────────

export const studentApi = {
  list:          ()                  => req('/principal/students'),
  listBySemester:(semester: number)  => req(`/principal/students?semester=${semester}`),
  create:        (body: { name: string; email: string; password: string; campusDepartmentId: string; roll: string; session: string; semester: number; shift?: 'MORNING' | 'EVENING' }) => req('/principal/students', 'POST', body),
  update:        (id: string, body: Partial<{ roll: string; session: string; semester: number; shift: string; campusDepartmentId: string }>) => req(`/principal/students/${id}`, 'PATCH', body),
  remove:        (id: string)        => req(`/principal/students/${id}`, 'DELETE'),
};

// ── Subjects ───────────────────────────────────────────────────────────────

export const subjectApi = {
  list:          (semester?: number) => req(`/subjects${semester ? `?semester=${semester}` : ''}`),
  create:        (body: { campusDepartmentId: string; name: string; code: string; semester: number; maxMarks: number; credit: CreditType }) => req('/subjects', 'POST', body),
  update:        (id: string, body: Partial<{ name: string; code: string; semester: number; maxMarks: number; credit: CreditType }>) => req(`/subjects/${id}`, 'PATCH', body),
  remove:        (id: string)        => req(`/subjects/${id}`, 'DELETE'),
};

// ── Rooms ──────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  campusId: string;
  name: string;
  capacity: number | null;
  type: string | null;
  isActive: boolean;
  createdAt: string;
}

export const roomApi = {
  list:       (activeOnly = false) => req(`/rooms${activeOnly ? '?activeOnly=true' : ''}`),
  create:     (body: { name: string; capacity?: number; type?: string }) => req('/rooms', 'POST', body),
  bulkCreate: (names: string[]) => req('/rooms/bulk', 'POST', { names }),
  update:     (id: string, body: Partial<{ name: string; capacity: number; type: string; isActive: boolean }>) => req(`/rooms/${id}`, 'PATCH', body),
  remove:     (id: string) => req(`/rooms/${id}`, 'DELETE'),
};

// ── Routine ────────────────────────────────────────────────────────────────

export type Shift = 'MORNING' | 'EVENING';

export interface RoutineSlot {
  id: string;
  routineId: string;
  day: string;
  timeSlot: string;
  room: string;
  subjectId: string;
  teacherId: string;
  subject: { id: string; name: string; code: string };
  teacher: { id: string; user: { name: string } };
}

export interface Routine {
  id: string;
  campusDepartmentId: string;
  semester: number;
  section: string;
  shift: Shift;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  slots: RoutineSlot[];
}

export interface GenerateRoutinePayload {
  campusDepartmentId: string;
  semester: number;
  shift: Shift;
  teachers: { id: string; subjects: string[] }[];
  /** Room names (labels) to use — comes from the Room DB records */
  rooms: { room: string }[];
  sections: { section: string; subjects: { code: string; weekly_classes: number }[] }[];
  /** Custom days — subset of the 5 weekdays */
  days?: string[];
  /** Custom time slots — e.g. ["09:00-09:45", "09:45-10:30"] */
  timeSlots?: string[];
}

export const routineApi = {
  generate: (body: GenerateRoutinePayload) =>
    req('/routines/generate', 'POST', body),
  list: (campusDepartmentId: string, params?: { semester?: number; section?: string; shift?: Shift }) => {
    const qs = new URLSearchParams();
    if (params?.semester) qs.set('semester', String(params.semester));
    if (params?.section)  qs.set('section', params.section);
    if (params?.shift)    qs.set('shift', params.shift);
    const q = qs.toString();
    return req(`/routines/${campusDepartmentId}${q ? `?${q}` : ''}`);
  },
  getById: (routineId: string) => req(`/routines/detail/${routineId}`),
  updateSlot: (slotId: string, body: { day?: string; timeSlot?: string; room?: string; subjectId?: string; teacherId?: string }) =>
    req(`/routines/slots/${slotId}`, 'PATCH', body),
  publish: (routineId: string, publish: boolean) =>
    req(`/routines/${routineId}/publish`, 'PATCH', { publish }),
  delete: (routineId: string) =>
    req(`/routines/${routineId}`, 'DELETE'),
};

// ── Marks ──────────────────────────────────────────────────────────────────

export const markApi = {
  list:       (params?: { subjectId?: string; semester?: number }) => {
    const qs = new URLSearchParams();
    if (params?.subjectId) qs.set('subjectId', params.subjectId);
    if (params?.semester)  qs.set('semester', String(params.semester));
    const q = qs.toString();
    return req(`/marks${q ? `?${q}` : ''}`);
  },
  bulkUpsert: (body: { subjectId: string; assessmentType: AssessmentType; assessmentNo: number; marks: { studentId: string; marksObtained: number }[] }) =>
    req('/marks/bulk', 'POST', body),
};

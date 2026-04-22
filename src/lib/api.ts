const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const req = (url: string, method = 'GET', body?: unknown): Promise<Response> =>
  fetch(`${BASE}${url}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

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

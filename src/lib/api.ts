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
  rollNumber: string | null;
  semester: number | null;
  user: { id: string; name: string; email: string; role: string };
  campusDepartment: { department: { name: string; shortName: string } };
}

// ── Departments ────────────────────────────────────────────────────────────

export const departmentApi = {
  list:            ()                                                    => req('/principal/departments'),
  listAll:         ()                                                    => req('/departments'),
  create:          (body: { departmentId: string })                     => req('/principal/departments', 'POST', body),
  update:          (id: string, body: Partial<{ name: string; shortName: string }>) => req(`/principal/departments/${id}`, 'PATCH', body),
  remove:          (id: string)                                         => req(`/principal/departments/${id}`, 'DELETE'),
  setHodNew:       (id: string, body: { name: string; email: string; password: string }) => req(`/principal/departments/${id}/hod`, 'POST', body),
  setHodExisting:  (id: string, hodId: string)                         => req(`/principal/departments/${id}/hod`, 'PATCH', { hodId }),
  removeHod:       (id: string)                                         => req(`/principal/departments/${id}/hod`, 'DELETE'),
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
  list:   ()                                                             => req('/principal/students'),
  create: (body: { name: string; email: string; password: string; campusDepartmentId: string; rollNumber?: string; semester?: number }) => req('/principal/students', 'POST', body),
  update: (id: string, body: Partial<{ rollNumber: string; semester: number; campusDepartmentId: string }>) => req(`/principal/students/${id}`, 'PATCH', body),
  remove: (id: string)                                                   => req(`/principal/students/${id}`, 'DELETE'),
};

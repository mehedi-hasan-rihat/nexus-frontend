'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type Role = 'PRINCIPAL' | 'HOD' | 'TEACHER' | 'STUDENT';

const navMap: Record<Role, { href: string; label: string; icon: string }[]> = {
  PRINCIPAL: [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/dashboard/departments', label: 'Departments', icon: '🏛' },
    { href: '/dashboard/teachers', label: 'Teachers', icon: '👨' },
  ],
  HOD: [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/dashboard/teachers', label: 'Teachers', icon: '👨' },
    { href: '/dashboard/students', label: 'Students', icon: '🎓' },
  ],
  TEACHER: [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  ],
  STUDENT: [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<Role>('PRINCIPAL');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.role) setRole(data.role as Role);
        if (data?.name) setUserName(data.name);
      });
  }, []);

  const navItems = navMap[role] ?? navMap.PRINCIPAL;

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#e2e8f0] gap-2">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-lg font-black tracking-tight text-gray-900 leading-none">nex</span>
            <span className="text-lg font-black tracking-tight text-blue-600 leading-none">us</span>
            <span className="ml-0.5 mb-2 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
          </Link>
          {sidebarOpen && <span className="ml-auto text-xs text-gray-400 font-medium capitalize">{role.toLowerCase()}</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {active && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#e2e8f0]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <span className="text-base w-5 text-center flex-shrink-0">↩</span>
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{userName || role}</p>
              <p className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {userName?.[0]?.toUpperCase() ?? role[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

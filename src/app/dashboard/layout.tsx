'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type Role = 'PRINCIPAL' | 'HOD' | 'TEACHER' | 'STUDENT';

interface UserCtx { name: string; role: Role; }
const UserContext = createContext<UserCtx>({ name: '', role: 'PRINCIPAL' });
export const useUser = () => useContext(UserContext);

const navMap: Record<Role, { href: string; label: string; icon: string }[]> = {
  PRINCIPAL: [
    { href: '/dashboard', label: 'Overview', icon: '⊞' },
    { href: '/dashboard/departments', label: 'Departments', icon: '🏛' },
    { href: '/dashboard/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { href: '/dashboard/students', label: 'Students', icon: '🎓' },
    { href: '/dashboard/marks', label: 'Results', icon: '📋' },
  ],
  HOD: [
    { href: '/dashboard', label: 'Overview', icon: '⊞' },
    { href: '/dashboard/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { href: '/dashboard/students', label: 'Students', icon: '🎓' },
    { href: '/dashboard/marks', label: 'Results', icon: '📋' },
  ],
  TEACHER: [
    { href: '/dashboard', label: 'Overview', icon: '⊞' },
    { href: '/dashboard/marks', label: 'Marks', icon: '📋' },
  ],
  STUDENT: [
    { href: '/dashboard', label: 'Overview', icon: '⊞' },
    { href: '/dashboard/marks', label: 'My Results', icon: '📋' },
  ],
};

function SidebarSkeleton() {
  return (
    <div className="flex-1 py-4 px-2 space-y-1 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded-lg mx-1" />
      ))}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserCtx | null>(null);

  useEffect(() => {
    const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('nexus_session_token') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('nexus_access_token') : null;
    if (!sessionToken) { router.replace('/login'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'X-Access-Token': accessToken ?? '',
      },
    })
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.role) setUser({ name: data.name ?? '', role: data.role as Role });
        else router.replace('/login');
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('nexus_session_token');
    const accessToken = localStorage.getItem('nexus_access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken ?? ''}`,
        'X-Access-Token': accessToken ?? '',
      },
    });
    localStorage.removeItem('nexus_session_token');
    localStorage.removeItem('nexus_access_token');
    document.cookie = 'nexus_auth=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const role = user?.role ?? 'PRINCIPAL';
  const navItems = navMap[role];

  return (
    <UserContext.Provider value={user ?? { name: '', role: 'PRINCIPAL' }}>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200`}>
          <div className="h-16 flex items-center px-4 border-b border-[#e2e8f0] gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-0.5 select-none">
              <span className="text-lg font-black tracking-tight text-gray-900 leading-none">nex</span>
              <span className="text-lg font-black tracking-tight text-blue-600 leading-none">us</span>
              <span className="ml-0.5 mb-2 w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
            </Link>
            {sidebarOpen && (
              <span className="ml-auto text-xs font-medium text-gray-400 capitalize">
                {role.toLowerCase()}
              </span>
            )}
          </div>

          {!user ? <SidebarSkeleton /> : (
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                    {active && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="p-3 border-t border-[#e2e8f0] flex-shrink-0">
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
          <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center px-6 gap-4 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
            >
              ☰
            </button>
            <div className="flex-1" />
            {!user ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="hidden sm:block space-y-1.5">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-100" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}

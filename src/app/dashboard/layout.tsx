'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
        <div key={i} className="h-10 bg-[--muted] rounded-lg mx-1" />
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

  const role = user?.role;
  const navItems = role ? navMap[role] : null;

  return (
    <UserContext.Provider value={user ?? { name: '', role: 'PRINCIPAL' }}>
      <div className="flex h-screen bg-[--muted] overflow-hidden">

        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-[--card] border-r border-[--border] flex flex-col transition-all duration-200`}
        >
          {/* Sidebar header */}
          <div className="h-16 flex items-center px-4 border-b border-[--border] gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 select-none group">
              {/* Logo Icon */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {/* Hexagon shape */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M16 2L28 9V23L16 30L4 23V9L16 2Z" 
                    fill="var(--accent)"
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  <text 
                    x="16" 
                    y="21" 
                    fontSize="14" 
                    fontWeight="900" 
                    fill="var(--accent-foreground)" 
                    textAnchor="middle"
                    fontFamily="var(--font-space-grotesk)"
                  >
                    N
                  </text>
                </svg>
              </div>
              
              {/* Logo Text - only show when sidebar is open */}
              {sidebarOpen && (
                <div className="flex items-center gap-0.5">
                  <span className="text-xl font-black tracking-tight text-[--foreground] leading-none uppercase">
                    Nexus
                  </span>
                </div>
              )}
            </Link>
            {sidebarOpen && (
              <span className="ml-auto text-xs font-medium text-[--muted-foreground] capitalize">
                {role?.toLowerCase()}
              </span>
            )}
          </div>

          {/* Nav items */}
          {!user ? <SidebarSkeleton /> : (
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {navItems?.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px] ${
                      active
                        ? 'bg-[--muted] text-[--accent]'
                        : 'text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground]'
                    }`}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                    {active && sidebarOpen && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0052FF, #4D7CFF)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Sign out */}
          <div className="p-3 border-t border-[--border] flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[--muted-foreground] hover:bg-red-50 hover:text-red-600 transition-all min-h-[44px]"
            >
              <span className="text-base w-5 text-center flex-shrink-0">↩</span>
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="h-16 bg-[--card] border-b border-[--border] flex items-center px-6 gap-4 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[--muted] text-[--muted-foreground] transition-colors text-lg"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="flex-1" />
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {!user ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="hidden sm:block space-y-1.5">
                  <div className="h-3 w-24 bg-[--muted] rounded" />
                  <div className="h-2.5 w-16 bg-[--muted] rounded" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[--muted]" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[--foreground]">{user.name}</p>
                  <p className="text-xs text-[--muted-foreground] capitalize">{user.role.toLowerCase()}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #0052FF, #4D7CFF)' }}
                >
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

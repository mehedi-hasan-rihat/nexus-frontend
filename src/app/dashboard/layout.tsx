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
    { href: '/dashboard',             label: 'Overview',     icon: '⊞' },
    { href: '/dashboard/departments', label: 'Departments',  icon: '🏛' },
    { href: '/dashboard/teachers',    label: 'Teachers',     icon: '👨' },
    { href: '/dashboard/students',    label: 'Students',     icon: '🎓' },
    { href: '/dashboard/marks',       label: 'Results',      icon: '📋' },
  ],
  HOD: [
    { href: '/dashboard',             label: 'Overview',     icon: '⊞' },
    { href: '/dashboard/teachers',    label: 'Teachers',     icon: '👨' },
    { href: '/dashboard/students',    label: 'Students',     icon: '🎓' },
    { href: '/dashboard/marks',       label: 'Results',      icon: '📋' },
  ],
  TEACHER: [
    { href: '/dashboard',             label: 'Overview',     icon: '⊞' },
    { href: '/dashboard/marks',       label: 'Marks',        icon: '📋' },
  ],
  STUDENT: [
    { href: '/dashboard',             label: 'Overview',     icon: '⊞' },
    { href: '/dashboard/marks',       label: 'My Results',   icon: '📋' },
  ],
};

function SidebarSkeleton() {
  return (
    <div className="flex-1 py-4 px-3 space-y-1 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-[#E8DEF8]/40 rounded-full mx-1" />
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
    const accessToken  = typeof window !== 'undefined' ? localStorage.getItem('nexus_access_token')  : null;
    if (!sessionToken) { router.replace('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}`, 'X-Access-Token': accessToken ?? '' },
    })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.role) setUser({ name: data.name ?? '', role: data.role as Role });
        else router.replace('/login');
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('nexus_session_token');
    const accessToken  = localStorage.getItem('nexus_access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken ?? ''}`, 'X-Access-Token': accessToken ?? '' },
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
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--md-background)' }}>

        {/* ── Sidebar ── */}
        <aside
          className="flex-shrink-0 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative"
          style={{
            width: sidebarOpen ? '256px' : '80px',
            background: 'var(--md-surface-container)',
          }}
        >
          {/* Decorative blur shape */}
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'var(--md-primary)', opacity: 0.08 }}
          />

          {/* Logo */}
          <div className="h-16 flex items-center px-5 flex-shrink-0 gap-2">
            <Link href="/" className="flex items-center gap-0.5 select-none">
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--md-on-background)' }}>nex</span>
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--md-primary)' }}>us</span>
              <span className="ml-0.5 mb-2 w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--md-primary)' }} />
            </Link>
            {sidebarOpen && (
              <span className="ml-auto text-xs font-medium capitalize px-2.5 py-1 rounded-full" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary)' }}>
                {role.toLowerCase()}
              </span>
            )}
          </div>

          {/* Nav */}
          {!user ? <SidebarSkeleton /> : (
            <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95"
                    style={{
                      background: active ? 'var(--md-secondary-container)' : 'transparent',
                      color: active ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--md-primary)1A'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {active && sidebarOpen && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--md-primary)' }} />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Sign out */}
          <div className="p-3 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 hover:bg-[#B3261E]/10"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              <span className="text-base w-5 text-center flex-shrink-0">↩</span>
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <header
            className="h-16 flex items-center px-6 gap-4 flex-shrink-0 border-b backdrop-blur-sm"
            style={{ background: 'var(--md-background)/95', borderColor: 'var(--md-surface-low)' }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 hover:bg-[#6750A4]/10 text-lg"
              style={{ color: 'var(--md-on-surface-variant)' }}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <div className="flex-1" />

            {!user ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="hidden sm:block space-y-1.5">
                  <div className="h-3 w-24 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
                  <div className="h-2.5 w-16 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
                </div>
                <div className="w-10 h-10 rounded-full" style={{ background: 'var(--md-surface-low)' }} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium" style={{ color: 'var(--md-on-background)' }}>{user.name}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--md-on-surface-variant)' }}>{user.role.toLowerCase()}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: 'var(--md-primary)' }}
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

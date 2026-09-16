'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Link2,
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  User,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Linkora Workspace...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Links Management', href: '/dashboard/links', icon: LinkIcon },
    { label: 'Click Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/90 dark:bg-slate-950/90 bg-white border-slate-200 p-4 justify-between shrink-0 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 dark:bg-slate-950 bg-white rounded-[10px] flex items-center justify-center">
                <Link2 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg text-slate-100 dark:text-slate-100 text-slate-900 leading-none block">
                Linkora
              </span>
              <span className="text-[10px] text-blue-400 font-mono">Workspace</span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 dark:hover:bg-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800 dark:border-slate-800 border-slate-200 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 text-slate-900 truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-800 dark:border-slate-800 border-slate-300 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 dark:bg-slate-950 bg-white">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg">Linkora</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/95 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xl">Linkora Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium ${
                        active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium"
            >
              Sign Out
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Link2, Menu, X, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800/80 bg-white/80 border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 dark:bg-slate-950 bg-white rounded-[10px] flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-500 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 dark:from-white dark:to-slate-400 from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Linkora
              </span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase -mt-1 hidden sm:block">
                Smart Links
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
              <a href="#features" className="hover:text-slate-100 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-slate-100 transition-colors">
                How It Works
              </a>
              <a href="#analytics" className="hover:text-slate-100 transition-colors">
                Analytics
              </a>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-9 bg-slate-800/40 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800/60 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all"
              >
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-4 animate-fadeIn">
          {!isDashboard && (
            <div className="flex flex-col space-y-3 font-medium text-slate-400">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                How It Works
              </a>
              <a
                href="#analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Analytics
              </a>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-blue-600 text-white font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-rose-400 border border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center bg-blue-600 text-white rounded-xl font-medium"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Link2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 dark:bg-slate-950 bg-white rounded-[14px] flex items-center justify-center">
                <Link2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
              Log in to your Linkora workspace
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-slate-400 pt-2">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold underline">
              Sign up free
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

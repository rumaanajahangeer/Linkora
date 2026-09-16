'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function NotFoundContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get('reason') || 'not_found';

  let title = 'Short Link Not Found';
  let description =
    'The short link you are trying to access does not exist or has been removed.';

  if (reason === 'inactive') {
    title = 'Short Link Disabled';
    description =
      'This short link has been temporarily disabled by its creator.';
  } else if (reason === 'expired') {
    title = 'Short Link Expired';
    description =
      'This short link has reached its set expiration date and is no longer active.';
  }

  return (
    <div className="w-full max-w-lg bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
          HTTP 404 — LINKORA REDIRECT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-800 font-medium text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
        >
          <LayoutDashboard className="w-4 h-4 text-blue-400" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-12">
        <Suspense fallback={<div className="text-slate-400 animate-pulse">Loading...</div>}>
          <NotFoundContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

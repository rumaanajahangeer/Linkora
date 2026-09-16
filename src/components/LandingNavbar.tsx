'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

function SunburstIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="white" />
      <g stroke="white" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.8M12 18.7v2.8M2.5 12h2.8M18.7 12h2.8" />
        <path d="M5.05 5.05l2 2M16.95 16.95l2 2M5.05 18.95l2-2M16.95 7.05l2-2" />
      </g>
    </svg>
  );
}

export function LandingNavbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-transparent px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <SunburstIcon />
          <span className="font-instrument text-sm font-semibold tracking-tight">Linkora</span>
        </Link>

        <nav className="hidden items-center gap-8 font-instrument text-sm font-medium text-white/80 md:flex">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#analytics" className="hover:text-white transition-colors">
            Analytics
          </a>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden font-instrument text-sm font-medium text-white/80 hover:text-white sm:block transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2.5 font-instrument text-sm font-semibold text-black hover:bg-slate-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { Link2, Github, Shield, FileText, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 dark:bg-slate-950 dark:border-slate-800/80 bg-slate-100 border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-100 dark:text-slate-100 text-slate-900">
                Linkora
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart links. Simply shared. High-performance URL shortener with real-time click analytics & custom branded aliases.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-sm text-slate-200 dark:text-slate-200 text-slate-900 mb-3 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-blue-400 transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-semibold text-sm text-slate-200 dark:text-slate-200 text-slate-900 mb-3 uppercase tracking-wider">
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Security Overview
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-sm text-slate-200 dark:text-slate-200 text-slate-900 mb-3 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Domain concept: <span className="text-slate-400 font-mono">linkora.app</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/60 dark:border-slate-800/60 border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Linkora Inc. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with precision & performance</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

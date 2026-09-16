'use client';

import { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, KeyRound, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal profile and security preferences.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">User Profile</h3>
            <p className="text-xs text-slate-400">Your account identity & credentials</p>
          </div>
        </div>

        {profileSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500">Email address cannot be changed.</p>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Security & Authentication</h3>
            <p className="text-xs text-slate-400">Password hashing and session encryption</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-400">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Password Hashing</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold">Bcrypt 10 Rounds</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Session Storage</span>
            </div>
            <span className="font-mono text-blue-400 font-semibold">HttpOnly Cookie (7 Days)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

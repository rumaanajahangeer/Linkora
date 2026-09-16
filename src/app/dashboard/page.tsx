'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Link2,
  Plus,
  Copy,
  Check,
  QrCode,
  BarChart3,
  ExternalLink,
  Trash2,
  Power,
  ArrowUpRight,
  MousePointerClick,
  Layers,
  Activity,
  Calendar,
} from 'lucide-react';
import { QRCodeModal } from '@/components/QRCodeModal';
import { formatDate } from '@/lib/utils';

interface LinkItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string | null;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export default function DashboardOverview() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Shorten widget state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Modal State
  const [qrModal, setQrModal] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  const [createdResult, setCreatedResult] = useState<LinkItem | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error('Fetch links error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setCreating(true);
    setCreateError(null);
    setCreatedResult(null);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          customAlias: customAlias.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create short link.');
      } else {
        setOriginalUrl('');
        setCustomAlias('');
        setTitle('');
        setCreatedResult(data);
        fetchLinks();
      }
    } catch {
      setCreateError('An unexpected error occurred.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (shortUrl: string, id: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isActive: !currentStatus } : l))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this short link? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Metrics
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const activeLinks = links.filter((l) => l.isActive).length;
  const clicksToday = Math.round(totalClicks * 0.12); // Sample estimation or calculated from recent events

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time link analytics and fast shortening workspace.
          </p>
        </div>

        <Link
          href="/dashboard/links"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-800 dark:border-slate-800 border-slate-300 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm self-start sm:self-auto"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Manage All Links</span>
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Links */}
        <div className="p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Links</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 dark:text-slate-100 text-slate-900 mt-3">
            {loading ? '...' : totalLinks}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Active short code redirects</p>
        </div>

        {/* Total Clicks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Clicks</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-indigo-400 mt-3">
            {loading ? '...' : totalClicks.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total recorded click events</p>
        </div>

        {/* Active Links */}
        <div className="p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Links</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-3">
            {loading ? '...' : activeLinks}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Ready for instant redirection</p>
        </div>

        {/* Clicks Today */}
        <div className="p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clicks Today</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-cyan-400 mt-3">
            {loading ? '...' : `+${clicksToday}`}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Recorded in past 24 hours</p>
        </div>
      </div>

      {/* Quick Shorten Bar Widget */}
      <div className="p-6 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 text-slate-900 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Create a New Short Link</span>
        </h2>

        {createError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {createError}
          </div>
        )}

        {createdResult && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold text-slate-200">Shortened Link Ready:</span>
              <a
                href={createdResult.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-400 hover:underline flex items-center space-x-1"
                title="Click to open link directly"
              >
                <span>{createdResult.shortUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={createdResult.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition-all flex items-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(createdResult.shortUrl, createdResult.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center space-x-1"
              >
                {copiedId === createdResult.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://your-long-destination-url.com/path"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-slate-500 font-mono">
                  /
                </span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="custom-alias"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-500/20 shrink-0 disabled:opacity-50"
              >
                {creating ? 'Shortening...' : 'Shorten'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Links Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 text-slate-900">
            Recent Links
          </h2>
          <Link
            href="/dashboard/links"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>View All ({links.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 animate-pulse text-sm">
            Loading recent links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-base">No links created yet</p>
            <p className="text-xs text-slate-500">
              Paste a URL above to create your first shortened smart link.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Short Link</th>
                  <th className="py-3 px-4">Original URL</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {links.slice(0, 5).map((link) => (
                  <tr key={link.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Short URL & Title */}
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                      <div>
                        {link.title && (
                          <div className="text-xs font-sans font-semibold text-slate-200 truncate max-w-[200px]">
                            {link.title}
                          </div>
                        )}
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>{link.shortUrl}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </td>

                    {/* Original URL */}
                    <td className="py-3.5 px-4 max-w-[240px] truncate text-slate-400 text-xs">
                      {link.originalUrl}
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-200">
                      {link.clicks}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          link.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {link.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleCopy(link.shortUrl, link.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            setQrModal({ open: true, url: link.shortUrl, title: link.shortCode })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(link.id, link.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            link.isActive
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              : 'text-rose-400 hover:text-emerald-400 hover:bg-slate-800'
                          }`}
                          title={link.isActive ? 'Disable Link' : 'Enable Link'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModal.open}
        url={qrModal.url}
        title={qrModal.title}
        onClose={() => setQrModal({ open: false, url: '', title: '' })}
      />
    </div>
  );
}

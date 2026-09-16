'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  Power,
  ExternalLink,
  BarChart3,
  Calendar,
  X,
  Plus,
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

export default function LinksManagementPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all'); // all, active, inactive
  const [sort, setSort] = useState('newest'); // newest, oldest, clicks

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Modal
  const [qrModal, setQrModal] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  // Edit Modal
  const [editModal, setEditModal] = useState<{
    open: boolean;
    link: LinkItem | null;
    title: string;
    customAlias: string;
    expiresAt: string;
    error: string | null;
    saving: boolean;
  }>({
    open: false,
    link: null,
    title: '',
    customAlias: '',
    expiresAt: '',
    error: null,
    saving: false,
  });

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status, sort }).toString();
      const res = await fetch(`/api/links?${query}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLinks]);

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
    if (!confirm('Are you sure you want to delete this short link?')) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (link: LinkItem) => {
    setEditModal({
      open: true,
      link,
      title: link.title || '',
      customAlias: link.shortCode,
      expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : '',
      error: null,
      saving: false,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.link) return;

    setEditModal((prev) => ({ ...prev, saving: true, error: null }));

    try {
      const res = await fetch(`/api/links/${editModal.link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editModal.title.trim() || undefined,
          customAlias: editModal.customAlias.trim() || undefined,
          expiresAt: editModal.expiresAt.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditModal((prev) => ({
          ...prev,
          saving: false,
          error: data.error || 'Failed to update link.',
        }));
      } else {
        setEditModal((prev) => ({ ...prev, open: false, saving: false }));
        fetchLinks();
      }
    } catch {
      setEditModal((prev) => ({
        ...prev,
        saving: false,
        error: 'An unexpected error occurred.',
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
          Link Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search, filter, edit, and organize all your short links in one place.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, short code, or URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-200 dark:text-slate-200 text-slate-900 text-xs font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-200 dark:text-slate-200 text-slate-900 text-xs font-medium focus:outline-none"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="clicks">Sort by Clicks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Links List Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-500 animate-pulse text-sm">
            Fetching links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="font-semibold text-lg">No matching links found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 dark:bg-slate-950/60 bg-slate-100 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Title & Short URL</th>
                  <th className="py-3.5 px-4">Original Destination</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-center">Clicks</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium">
                      <div>
                        <div className="font-semibold text-slate-100 dark:text-slate-100 text-slate-900">
                          {link.title || link.shortCode}
                        </div>
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-blue-400 hover:underline flex items-center space-x-1 mt-0.5"
                        >
                          <span>{link.shortUrl}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-[220px] truncate text-slate-400 text-xs">
                      {link.originalUrl}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(link.createdAt)}
                      {link.expiresAt && (
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          Exp: {formatDate(link.expiresAt)}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-100">
                      {link.clicks}
                    </td>

                    <td className="py-4 px-4 text-center">
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

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleCopy(link.shortUrl, link.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(link)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(link.id, link.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
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
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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

      {/* Edit Link Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-100">Edit Link Details</h3>
              <button
                onClick={() => setEditModal((prev) => ({ ...prev, open: false }))}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editModal.error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {editModal.error}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Link Title / Note</label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. My Portfolio Website"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Custom Alias</label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                  <span className="text-xs font-mono text-slate-400 pr-2 border-r border-slate-800">
                    linkora.app/
                  </span>
                  <input
                    type="text"
                    value={editModal.customAlias}
                    onChange={(e) =>
                      setEditModal((prev) => ({ ...prev, customAlias: e.target.value }))
                    }
                    className="w-full pl-2 bg-transparent text-sm text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={editModal.expiresAt}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, expiresAt: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {editModal.saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

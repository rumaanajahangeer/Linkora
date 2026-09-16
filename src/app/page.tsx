'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Link2,
  Sparkles,
  Copy,
  Check,
  Share2,
  QrCode,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Sliders,
  History,
  ExternalLink,
} from 'lucide-react';
import { LandingNavbar } from '@/components/LandingNavbar';
import { HeroVideo } from '@/components/HeroVideo';
import { Footer } from '@/components/Footer';
import { QRCodeModal } from '@/components/QRCodeModal';

interface ShortenedResult {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
}

export default function LandingPage() {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAliasInput, setShowAliasInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      setError('Please enter a long URL to shorten.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: longUrl.trim(),
          customAlias: customAlias.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to shorten URL. Please try again.');
      } else {
        setResult(data);
        setLongUrl('');
        setCustomAlias('');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Linkora Short Link',
          url: result.shortUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#000000] text-white selection:bg-blue-500 selection:text-white">
      <LandingNavbar />

      <section className="relative w-full min-h-screen overflow-hidden bg-[#000000] text-white">
        <HeroVideo />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute top-[-20%] left-[20%] h-[600px] w-[600px] bg-blue-900/20 blur-[120px] mix-blend-screen" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[20%] h-[500px] w-[500px] bg-indigo-900/20 blur-[120px] mix-blend-screen" />

        <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-col items-center space-y-12 px-4 text-center sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-instrument text-xl font-medium tracking-wide text-blue-400 sm:text-2xl uppercase"
          >
            Smart links. Simply shared.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text font-instrument text-5xl font-semibold leading-[1.0] tracking-tighter text-transparent sm:text-7xl lg:text-[88px]"
          >
            Shorten Links. Share Faster. Track Everything.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-2xl font-instrument text-lg leading-[1.65] text-white/80 sm:text-[20px]"
          >
            Create short, clean, and shareable links in seconds. Manage your links, generate QR codes, and track clicks from one simple workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-6 sm:flex-row"
          >
            <a
              href="#shorten"
              className="group flex items-center rounded-full bg-white py-2.5 pl-6 pr-3 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="font-instrument text-lg font-medium" style={{ color: '#0a0400' }}>
                Shorten a URL
              </span>
              <span className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#3054ff] transition-colors group-hover:bg-[#2040e0]">
                <ArrowRight className="h-5 w-5 text-white" />
              </span>
            </a>
            <a
              href="#features"
              className="group flex items-center rounded-lg px-4 py-2 font-instrument text-white/70 backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-white"
            >
              Explore Features
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>

          <div id="shorten" className="w-full max-w-3xl pb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-100 font-instrument">
              Shorten Any URL
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
              Paste your long link below to instantly generate a short, shareable URL with optional custom alias.
            </p>
          <form
            onSubmit={handleShorten}
            className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-2xl shadow-blue-950/20 space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="Paste long URL (e.g. https://github.com/linkora/project)"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <span>Shortening...</span>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Optional Custom Alias Toggle */}
            <div className="flex items-center justify-between px-1 pt-1 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setShowAliasInput(!showAliasInput)}
                className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAliasInput ? 'Hide Custom Alias' : '+ Add Custom Alias (Optional)'}</span>
              </button>
              <span className="hidden sm:inline text-slate-500 font-mono">linkora.app/custom-alias</span>
            </div>

            {showAliasInput && (
              <div className="pt-2 animate-fadeIn">
                <div className="flex items-center rounded-xl bg-slate-950 dark:bg-slate-950 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-300 px-3 py-2">
                  <span className="text-xs font-mono text-slate-400 pr-2 border-r border-slate-800 dark:border-slate-800 border-slate-300">
                    linkora.app/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-link"
                    className="w-full pl-3 bg-transparent text-sm text-slate-100 dark:text-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {/* Success Card Result */}
          {result && (
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/30 shadow-2xl text-left animate-fadeIn relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <Check className="w-4 h-4" />
                  <span>Shortened Link Ready</span>
                </div>
                <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                  {result.originalUrl}
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg sm:text-xl font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-2 transition-colors select-all"
                  title="Click to open link directly"
                >
                  <span>{result.shortUrl}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-blue-400" />
                </a>

                <div className="flex items-center space-x-2">
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-500/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Link</span>
                  </a>

                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium text-xs border border-blue-500/30 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Preview of Dashboard */}
        <div id="analytics" className="w-full max-w-5xl mt-16 sm:mt-24 p-2.5 sm:p-4 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-slate-800 dark:border-slate-800 border-slate-200 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 p-4 sm:p-6 text-left">
            {/* Top Stats Strip */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 font-mono pl-2">
                  linkora.app/dashboard/analytics
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Live Data Stream
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Total Links</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">128</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Total Clicks</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">14,290</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Active Links</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">124</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Clicks Today</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">+482</p>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-44 w-full bg-gradient-to-b from-blue-500/10 to-transparent rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Click Performance (Past 7 Days)</span>
                <span className="text-blue-400 font-mono">+34.2% vs last week</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-24 pt-4">
                {[35, 60, 45, 80, 70, 95, 110].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-sm group-hover:brightness-125 transition-all"
                    />
                    <span className="text-[10px] text-slate-500">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900">
            Everything you need to build smart links.
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Powerful feature set designed for modern creators, developers, and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Instant URL Shortening</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate ultra-fast, clean short links in a single click with zero waiting time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Custom Short Links</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Brand your links with recognizable custom aliases like <code className="text-indigo-400">linkora.app/my-tool</code>.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Click Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track total clicks, geographic referrers, browser breakdown, and device types over time.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">QR Code Generator</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatically generate vector-quality QR codes for every short link and download as PNG.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Link History & Expiration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Organize your link portfolio, set auto-expiration dates, and enable or disable links anytime.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Secure Redirecting</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              High-availability HTTP 307 redirects with SSL encryption and full domain isolation.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-950/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            How Linkora Works in 4 Steps
          </h2>
          <p className="mt-4 text-slate-400">
            Simple, streamlined link shortener workflow for individuals and teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold text-lg text-slate-100 mb-2">Paste your long URL</h4>
            <p className="text-xs text-slate-400">Copy any website address or long query string.</p>
          </div>

          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold text-lg text-slate-100 mb-2">Create short link</h4>
            <p className="text-xs text-slate-400">Add an optional custom alias or let us generate one.</p>
          </div>

          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold text-lg text-slate-100 mb-2">Share it anywhere</h4>
            <p className="text-xs text-slate-400">Copy link, download QR code, or share via Web Share API.</p>
          </div>

          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold text-lg text-slate-100 mb-2">Track clicks</h4>
            <p className="text-xs text-slate-400">Monitor real-time visitor stats and referrers on your dashboard.</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 overflow-hidden text-center flex flex-col items-center">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 max-w-2xl leading-tight">
            Ready to simplify your links?
          </h2>
          <p className="mt-4 text-slate-300 max-w-lg text-base sm:text-lg">
            Create short links, generate QR codes, and track real-time click analytics from one simple workspace.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#shorten"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Create Your First Link</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* QR Code Modal for Shortened Result */}
      {result && (
        <QRCodeModal
          url={result.shortUrl}
          title={result.shortCode}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}

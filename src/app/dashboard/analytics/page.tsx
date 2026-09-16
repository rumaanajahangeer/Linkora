'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Monitor,
  Globe,
  Compass,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { formatDateTime } from '@/lib/utils';

interface AnalyticsData {
  totalClicks: number;
  todayClicks: number;
  clicksOverTime: { date: string; clicks: number }[];
  deviceBreakdown: { name: string; count: number }[];
  browserBreakdown: { name: string; count: number }[];
  referrerBreakdown: { name: string; count: number }[];
  recentClicks: {
    id: string;
    clickedAt: string;
    deviceType: string;
    browser: string;
    referrer: string;
  }[];
  linkTitle: string;
}

interface UserLink {
  id: string;
  title: string | null;
  shortCode: string;
}

const COLORS = ['#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function AnalyticsPage() {
  const [userLinks, setUserLinks] = useState<UserLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string>('all');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch available links for filter dropdown
  useEffect(() => {
    fetch('/api/links')
      .then((res) => res.json())
      .then((resData) => {
        setUserLinks(resData.links || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${selectedLinkId}/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedLinkId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Link Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 dark:text-slate-100 text-slate-900 tracking-tight">
            Click Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time traffic insight, device distributions, and referral sources.
          </p>
        </div>

        {/* Link Filter Dropdown */}
        <div className="flex items-center space-x-2 bg-black border border-slate-800 rounded-xl px-3 py-2 shadow-sm">
          <Filter className="w-4 h-4 text-blue-400" />
          <select
            value={selectedLinkId}
            onChange={(e) => setSelectedLinkId(e.target.value)}
            className="bg-black text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
              All Links Combined
            </option>
            {userLinks.map((link) => (
              <option
                key={link.id}
                value={link.id}
                className="bg-black text-white"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
              >
                {link.title || link.shortCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
          Aggregating click metrics...
        </div>
      ) : !data || data.totalClicks === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-200">No Clicks Recorded Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Share your shortened links to start gathering detailed visitor analytics and device insights.
          </p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Clicks ({data.linkTitle})
                </span>
                <p className="text-4xl font-extrabold text-blue-400 mt-2">
                  {data.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <MousePointerClick className="w-8 h-8" />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Today&apos;s Clicks
                </span>
                <p className="text-4xl font-extrabold text-emerald-400 mt-2">
                  +{data.todayClicks}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Main Click Trend Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 text-slate-900">
                Click Performance Over Time (Past 7 Days)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Daily Traffic</span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.clicksOverTime}>
                  <defs>
                    <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff"
                    tick={{ fill: '#ffffff' }}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff"
                    tick={{ fill: '#ffffff' }}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#clickGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Types */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>Device Breakdown</span>
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {data.deviceBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {data.deviceBreakdown.map((item, idx) => (
                  <div key={item.name} className="flex justify-between text-xs text-slate-300">
                    <span className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </span>
                    <span className="font-semibold">{item.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Types */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Browser Breakdown</span>
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.browserBreakdown}>
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff"
                      tick={{ fill: '#ffffff' }}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#ffffff" tick={{ fill: '#ffffff' }} fontSize={11} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#ffffff' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {data.browserBreakdown.map((item) => (
                  <div key={item.name} className="flex justify-between text-xs text-slate-300">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Top Referrers</span>
              </h4>
              <div className="space-y-3 pt-2">
                {data.referrerBreakdown.map((item) => {
                  const percentage = Math.round((item.count / data.totalClicks) * 100) || 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono text-slate-400">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Click Activity Log */}
          <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 bg-white border border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100">Recent Click Activity Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Browser</th>
                    <th className="py-3 px-4">Referrer Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.recentClicks.map((click) => (
                    <tr key={click.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatDateTime(click.clickedAt)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">{click.deviceType}</td>
                      <td className="py-3 px-4 text-slate-300">{click.browser}</td>
                      <td className="py-3 px-4 text-blue-400 font-mono">{click.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

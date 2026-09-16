import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    let linkIds: string[] = [];
    let linkTitle = 'All Links';

    if (id === 'all') {
      const userLinks = await prisma.link.findMany({
        where: { userId: session.userId },
        select: { id: true },
      });
      linkIds = userLinks.map((l) => l.id);
    } else {
      const link = await prisma.link.findUnique({
        where: { id },
      });

      if (!link || link.userId !== session.userId) {
        return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
      }
      linkIds = [link.id];
      linkTitle = link.title || link.shortCode;
    }

    if (linkIds.length === 0) {
      return NextResponse.json({
        totalClicks: 0,
        todayClicks: 0,
        clicksOverTime: [],
        deviceBreakdown: [],
        browserBreakdown: [],
        referrerBreakdown: [],
        recentClicks: [],
        linkTitle,
      });
    }

    // Fetch click events
    const clickEvents = await prisma.clickEvent.findMany({
      where: {
        linkId: { in: linkIds },
      },
      orderBy: { clickedAt: 'desc' },
      take: 1000,
    });

    const totalClicks = clickEvents.length;

    // Today's clicks
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayClicks = clickEvents.filter(
      (e) => new Date(e.clickedAt) >= startOfToday
    ).length;

    // Clicks over time (last 7 or 14 days)
    const daysMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
    }

    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const referrerMap: Record<string, number> = {};

    clickEvents.forEach((event) => {
      const dateKey = new Date(event.clickedAt).toISOString().split('T')[0];
      if (daysMap[dateKey] !== undefined) {
        daysMap[dateKey]++;
      }

      const device = event.deviceType || 'Desktop';
      deviceMap[device] = (deviceMap[device] || 0) + 1;

      const browser = event.browser || 'Other';
      browserMap[browser] = (browserMap[browser] || 0) + 1;

      const ref = event.referrer || 'Direct / None';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });

    const clicksOverTime = Object.keys(daysMap).map((dateStr) => {
      const d = new Date(dateStr);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: label,
        clicks: daysMap[dateStr],
      };
    });

    const deviceBreakdown = Object.entries(deviceMap).map(([name, count]) => ({
      name,
      count,
    }));

    const browserBreakdown = Object.entries(browserMap).map(([name, count]) => ({
      name,
      count,
    }));

    const referrerBreakdown = Object.entries(referrerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentClicks = clickEvents.slice(0, 15).map((e) => ({
      id: e.id,
      clickedAt: e.clickedAt,
      deviceType: e.deviceType || 'Desktop',
      browser: e.browser || 'Other',
      referrer: e.referrer || 'Direct',
    }));

    return NextResponse.json({
      totalClicks,
      todayClicks,
      clicksOverTime,
      deviceBreakdown,
      browserBreakdown,
      referrerBreakdown,
      recentClicks,
      linkTitle,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics.' },
      { status: 500 }
    );
  }
}

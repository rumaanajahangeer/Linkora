import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const RESERVED = new Set([
  'api',
  'dashboard',
  'login',
  'signup',
  '404',
  '500',
  'terms',
  'privacy',
  'settings',
  'links',
  'analytics',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const shortCode = decodeURIComponent(params.shortCode || '').trim();

  if (!shortCode || RESERVED.has(shortCode.toLowerCase())) {
    return NextResponse.redirect(new URL('/404?reason=not_found', req.url));
  }

  try {
    const link =
      (await prisma.link.findUnique({ where: { shortCode } })) ||
      (await prisma.link.findUnique({ where: { shortCode: shortCode.toLowerCase() } }));

    if (!link) {
      return NextResponse.redirect(new URL('/404?reason=not_found', req.url));
    }

    if (!link.isActive) {
      return NextResponse.redirect(new URL('/404?reason=inactive', req.url));
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/404?reason=expired', req.url));
    }

    const ua = req.headers.get('user-agent');
    const ref = req.headers.get('referer');
    const { deviceType, browser, referrer } = parseAnalytics(ua, ref);

    await Promise.all([
      prisma.clickEvent.create({
        data: {
          linkId: link.id,
          userAgent: ua ? ua.slice(0, 255) : null,
          referrer,
          deviceType,
          browser,
        },
      }),
      prisma.link.update({
        where: { id: link.id },
        data: {
          clicks: { increment: 1 },
        },
      }),
    ]);

    const targetUrl = /^https?:\/\//i.test(link.originalUrl)
      ? link.originalUrl
      : `https://${link.originalUrl}`;

    return NextResponse.redirect(targetUrl, 307);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/404?reason=error', req.url));
  }
}

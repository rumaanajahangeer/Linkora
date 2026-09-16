import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isValidUrl, normalizeUrl, generateShortCode, validateCustomAlias, buildShortUrl } from '@/lib/utils';
import { z } from 'zod';

const CreateLinkSchema = z.object({
  originalUrl: z.string().min(1, 'Original URL is required.'),
  customAlias: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { customAlias, title, expiresAt } = result.data;
    const rawUrl = result.data.originalUrl;

    const normalized = normalizeUrl(rawUrl);
    if (!isValidUrl(normalized)) {
      return NextResponse.json(
        { error: 'Please enter a valid HTTP or HTTPS URL.' },
        { status: 400 }
      );
    }

    const session = await getSession();
    const userId = session?.userId || null;

    let shortCode = '';

    if (customAlias && customAlias.trim() !== '') {
      const aliasCheck = validateCustomAlias(customAlias);
      if (!aliasCheck.valid) {
        return NextResponse.json(
          { error: aliasCheck.error },
          { status: 400 }
        );
      }

      const cleanAlias = customAlias.trim().toLowerCase();
      const existing = await prisma.link.findUnique({
        where: { shortCode: cleanAlias },
      });

      if (existing) {
        return NextResponse.json(
          { error: `The alias "${cleanAlias}" is already in use. Please try another.` },
          { status: 400 }
        );
      }
      shortCode = cleanAlias;
    } else {
      // Generate unique shortcode
      let attempts = 0;
      let unique = false;
      while (!unique && attempts < 10) {
        attempts++;
        const candidate = generateShortCode(6);
        const existing = await prisma.link.findUnique({
          where: { shortCode: candidate },
        });
        if (!existing) {
          shortCode = candidate;
          unique = true;
        }
      }
      if (!shortCode) {
        shortCode = generateShortCode(8);
      }
    }

    let parsedExpiresAt: Date | null = null;
    if (expiresAt && expiresAt.trim() !== '') {
      const d = new Date(expiresAt);
      if (!isNaN(d.getTime())) {
        parsedExpiresAt = d;
      }
    }

    const link = await prisma.link.create({
      data: {
        userId,
        originalUrl: normalized,
        shortCode,
        title: title && title.trim() !== '' ? title.trim() : null,
        expiresAt: parsedExpiresAt,
      },
    });

    const shortUrl = buildShortUrl(link.shortCode, req);

    return NextResponse.json({
      ...link,
      shortUrl,
    });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json(
      { error: 'Failed to shorten URL. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, inactive
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, clicks

    const whereClause: any = {
      userId: session.userId,
    };

    if (search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { originalUrl: { contains: q } },
        { shortCode: { contains: q } },
        { title: { contains: q } },
      ];
    }

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'clicks') {
      orderBy = { clicks: 'desc' };
    }

    const links = await prisma.link.findMany({
      where: whereClause,
      orderBy,
    });

    const formattedLinks = links.map((link) => ({
      ...link,
      shortUrl: buildShortUrl(link.shortCode, req),
    }));

    return NextResponse.json({ links: formattedLinks });
  } catch (error) {
    console.error('Get links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links.' },
      { status: 500 }
    );
  }
}

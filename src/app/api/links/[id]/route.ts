import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateCustomAlias, buildShortUrl } from '@/lib/utils';
import { z } from 'zod';

const UpdateLinkSchema = z.object({
  title: z.string().optional().nullable(),
  customAlias: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const link = await prisma.link.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { clickEvents: true },
        },
      },
    });

    if (!link || link.userId !== session.userId) {
      return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
    }

    return NextResponse.json({
      ...link,
      shortUrl: buildShortUrl(link.shortCode, req),
    });
  } catch (error) {
    console.error('Get single link error:', error);
    return NextResponse.json({ error: 'Failed to fetch link.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingLink = await prisma.link.findUnique({
      where: { id: params.id },
    });

    if (!existingLink || existingLink.userId !== session.userId) {
      return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
    }

    const body = await req.json();
    const result = UpdateLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, customAlias, isActive, expiresAt } = result.data;
    const updateData: any = {};

    if (title !== undefined) {
      updateData.title = title && title.trim() !== '' ? title.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (expiresAt !== undefined) {
      if (!expiresAt || expiresAt.trim() === '') {
        updateData.expiresAt = null;
      } else {
        const d = new Date(expiresAt);
        updateData.expiresAt = !isNaN(d.getTime()) ? d : null;
      }
    }

    if (customAlias !== undefined && customAlias !== null && customAlias.trim() !== '') {
      const cleanAlias = customAlias.trim().toLowerCase();
      if (cleanAlias !== existingLink.shortCode) {
        const aliasCheck = validateCustomAlias(cleanAlias);
        if (!aliasCheck.valid) {
          return NextResponse.json(
            { error: aliasCheck.error },
            { status: 400 }
          );
        }

        const taken = await prisma.link.findUnique({
          where: { shortCode: cleanAlias },
        });

        if (taken) {
          return NextResponse.json(
            { error: `The alias "${cleanAlias}" is already taken.` },
            { status: 400 }
          );
        }
        updateData.shortCode = cleanAlias;
      }
    }

    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updatedLink,
      shortUrl: buildShortUrl(updatedLink.shortCode, req),
    });
  } catch (error) {
    console.error('Update link error:', error);
    return NextResponse.json(
      { error: 'Failed to update link.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingLink = await prisma.link.findUnique({
      where: { id: params.id },
    });

    if (!existingLink || existingLink.userId !== session.userId) {
      return NextResponse.json({ error: 'Link not found.' }, { status: 404 });
    }

    await prisma.link.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete link error:', error);
    return NextResponse.json(
      { error: 'Failed to delete link.' },
      { status: 500 }
    );
  }
}

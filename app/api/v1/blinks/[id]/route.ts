import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { updateBlinkOnChain, deleteBlinkFromChain } from '@/lib/actions/blink-operations';

const updateBlinkSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  blinkType: z.enum(['STANDARD', 'NFT', 'DONATION', 'GIFT', 'PAYMENT', 'POLL']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { success } = await rateLimit(request.ip ?? 'anonymous');
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blink = await prisma.blink.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        collection: true,
        attributes: true,
      },
    });

    if (!blink) {
      return NextResponse.json({ error: 'Blink not found' }, { status: 404 });
    }

    if (blink.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(blink);
  } catch (error) {
    console.error('Error fetching blink:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { success } = await rateLimit(request.ip ?? 'anonymous');
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = updateBlinkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { name, description, imageUrl, blinkType } = validationResult.data;

    const blink = await prisma.blink.findUnique({
      where: { id: params.id },
    });

    if (!blink) {
      return NextResponse.json({ error: 'Blink not found' }, { status: 404 });
    }

    if (blink.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update blink on-chain
    await updateBlinkOnChain(blink.mintAddress, name, description, imageUrl, blinkType);

    // Update blink in database
    const updatedBlink = await prisma.blink.update({
      where: { id: params.id },
      data: {
        name,
        description,
        imageUrl,
        blinkType,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        collection: true,
        attributes: true,
      },
    });

    return NextResponse.json(updatedBlink);
  } catch (error) {
    console.error('Error updating blink:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { success } = await rateLimit(request.ip ?? 'anonymous');
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blink = await prisma.blink.findUnique({
      where: { id: params.id },
    });

    if (!blink) {
      return NextResponse.json({ error: 'Blink not found' }, { status: 404 });
    }

    if (blink.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete blink from blockchain
    await deleteBlinkFromChain(blink.mintAddress);

    // Delete blink from database
    await prisma.blink.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Blink deleted successfully' });
  } catch (error) {
    console.error('Error deleting blink:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


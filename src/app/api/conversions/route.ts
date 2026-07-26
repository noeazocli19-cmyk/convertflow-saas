import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate via session cookie
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json(
        { error: 'Session expirée' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const toolType = searchParams.get('toolType');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (toolType) where.toolType = toolType;

    const [conversions, total] = await Promise.all([
      db.conversion.findMany({
        where,
        include: {
          files: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.conversion.count({ where }),
    ]);

    return NextResponse.json(
      {
        conversions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Conversions fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversions' },
      { status: 500 }
    );
  }
}

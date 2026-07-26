import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/auth/session - Check current session
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Find the session
    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      // Session expired or invalid, clean up
      if (session) {
        await db.session.delete({ where: { id: session.id } });
      }
      const response = NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
      response.cookies.delete('session-token');
      return response;
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = session.user;

    return NextResponse.json(
      { authenticated: true, user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}

// DELETE /api/auth/session - Logout
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (sessionToken) {
      // Delete the session from database
      await db.session.deleteMany({
        where: { sessionToken },
      });
    }

    const response = NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.delete('session-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}

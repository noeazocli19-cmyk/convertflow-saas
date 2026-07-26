import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total conversions count
    const totalConversions = await db.conversion.count({
      where: { userId },
    });

    // Get conversions today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const conversionsToday = await db.conversion.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    });

    // Get completed conversions count (for success rate)
    const completedConversions = await db.conversion.count({
      where: { userId, status: 'completed' },
    });

    // Get failed conversions count
    const failedConversions = await db.conversion.count({
      where: { userId, status: 'failed' },
    });

    // Calculate success rate
    const finishedConversions = completedConversions + failedConversions;
    const successRate = finishedConversions > 0
      ? Math.round((completedConversions / finishedConversions) * 1000) / 10
      : 0;

    // Get storage info from user record
    const storageUsed = session.user.storageUsed;
    const storageLimit = session.user.storageLimit;

    // Get total file size processed
    const totalSizeResult = await db.conversion.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    });
    const totalFileSize = totalSizeResult._sum.fileSize || 0;

    // Get recent conversions (last 5)
    const recentConversions = await db.conversion.findMany({
      where: { userId },
      include: { files: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAllConversions = await db.conversion.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    });

    // Group by day
    const activityByDay: Record<string, number> = {};
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    // Initialize all 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      activityByDay[dayName] = 0;
    }

    // Count conversions per day
    recentAllConversions.forEach((conv) => {
      const dayName = dayNames[conv.createdAt.getDay()];
      if (activityByDay[dayName] !== undefined) {
        activityByDay[dayName]++;
      }
    });

    const activityData = Object.entries(activityByDay).map(([day, count]) => ({
      day,
      conversions: count,
    }));

    // Get format distribution
    const allUserConversions = await db.conversion.findMany({
      where: { userId },
      select: { toolType: true },
    });

    const formatDistribution: Record<string, number> = { pdf: 0, image: 0, video: 0, audio: 0, convert: 0 };
    allUserConversions.forEach((conv) => {
      const type = conv.toolType || 'convert';
      if (formatDistribution[type] !== undefined) {
        formatDistribution[type]++;
      } else {
        formatDistribution.convert++;
      }
    });

    // Get recent activity items (last 5 conversions)
    const activityItems = recentConversions.map((conv) => ({
      id: conv.id,
      inputFormat: conv.inputFormat,
      outputFormat: conv.outputFormat,
      toolType: conv.toolType,
      status: conv.status,
      createdAt: conv.createdAt.toISOString(),
      files: conv.files.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        fileSize: f.fileSize,
        status: f.status,
      })),
    }));

    return NextResponse.json({
      stats: {
        totalConversions,
        conversionsToday,
        totalFileSize,
        storageUsed,
        storageLimit,
        successRate,
        completedConversions,
        failedConversions,
      },
      activityData,
      formatDistribution,
      recentConversions: recentConversions.map((conv) => ({
        id: conv.id,
        inputFormat: conv.inputFormat,
        outputFormat: conv.outputFormat,
        fileSize: conv.fileSize,
        outputSize: conv.outputSize,
        status: conv.status,
        toolType: conv.toolType,
        createdAt: conv.createdAt.toISOString(),
        files: conv.files.map((f) => ({
          id: f.id,
          originalName: f.originalName,
          fileSize: f.fileSize,
          status: f.status,
        })),
      })),
      activityItems,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

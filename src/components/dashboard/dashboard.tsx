'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUp,
  Activity,
  HardDrive,
  CheckCircle,
  FileText,
  Image as ImageIconLucide,
  Video,
  Music,
  Download,
  Plus,
  FileStack,
  ImageIcon,
  History,
  Clock,
  TrendingUp,
  Zap,
  Sparkles,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ---- Types ----

interface DashboardStats {
  totalConversions: number;
  conversionsToday: number;
  totalFileSize: number;
  storageUsed: number;
  storageLimit: number;
  successRate: number;
  completedConversions: number;
  failedConversions: number;
}

interface RecentFile {
  id: string;
  originalName: string;
  fileSize: number;
  status: string;
}

interface RecentConversion {
  id: string;
  inputFormat: string;
  outputFormat: string;
  fileSize: number;
  outputSize: number;
  status: string;
  toolType: string;
  createdAt: string;
  files: RecentFile[];
}

interface DashboardData {
  stats: DashboardStats;
  activityData: { day: string; conversions: number }[];
  formatDistribution: Record<string, number>;
  recentConversions: RecentConversion[];
  activityItems: RecentConversion[];
}

// ---- Chart Configs ----

const activityChartConfig = {
  conversions: {
    label: 'Conversions',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const formatChartConfig = {
  pdf: { label: 'PDF', color: '#2563EB' },
  image: { label: 'Image', color: '#06B6D4' },
  video: { label: 'Vidéo', color: '#8B5CF6' },
  audio: { label: 'Audio', color: '#F59E0B' },
  convert: { label: 'Autre', color: '#10B981' },
} satisfies ChartConfig;

// ---- Helpers ----

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(format: string) {
  const f = format.toUpperCase();
  if (['PDF'].includes(f)) return <FileText className="size-4 text-red-500" />;
  if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG', 'BMP'].includes(f))
    return <ImageIconLucide className="size-4 text-chart-2" />;
  if (['MP4', 'AVI', 'MOV', 'MKV', 'WMV'].includes(f))
    return <Video className="size-4 text-chart-3" />;
  if (['MP3', 'WAV', 'OGG', 'FLAC', 'AAC'].includes(f))
    return <Music className="size-4 text-chart-4" />;
  return <FileStack className="size-4 text-muted-foreground" />;
}

function getToolTypeIcon(toolType: string) {
  switch (toolType) {
    case 'pdf':
      return <FileText className="size-4 text-chart-1" />;
    case 'image':
      return <ImageIcon className="size-4 text-chart-2" />;
    case 'video':
      return <Video className="size-4 text-chart-3" />;
    case 'audio':
      return <Music className="size-4 text-chart-4" />;
    default:
      return <Zap className="size-4 text-chart-1" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle className="size-3" />
          Terminé
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800">
          <Activity className="size-3 animate-pulse" />
          En cours
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800">
          Échoué
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ---- Animation Variants ----

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---- Welcome / Empty State for New Users ----

function WelcomeState({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        className="size-20 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-lg"
      >
        <Sparkles className="size-10 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Bienvenue sur ConvertFlow !</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Vous n&apos;avez pas encore effectué de conversion. Commencez dès maintenant 
        en convertissant votre premier fichier !
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onStart}
          size="lg"
          className="gradient-brand text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="size-5" />
          Première conversion
        </Button>
      </div>

      {/* Quick feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
        {[
          {
            icon: <FileText className="size-5" />,
            title: 'Outils PDF',
            desc: 'Fusionner, compresser, diviser',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            icon: <ImageIcon className="size-5" />,
            title: 'Outils Image',
            desc: 'Redimensionner, compresser, convertir',
            color: 'text-chart-2',
            bg: 'bg-chart-2/10',
          },
          {
            icon: <Video className="size-5" />,
            title: 'Outils Vidéo',
            desc: 'Convertir, compresser, extraire',
            color: 'text-chart-3',
            bg: 'bg-chart-3/10',
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
          >
            <Card className="glass-card hover:shadow-md transition-shadow cursor-pointer" onClick={onStart}>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className={`size-10 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Component ----

export function Dashboard() {
  const { setCurrentView } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ALL useMemo hooks must be called before any early returns
  const isNewUser = useMemo(() => {
    return data ? data.stats.totalConversions === 0 : false;
  }, [data]);

  const statsCards = useMemo(() => {
    if (!data) return [];
    const { stats } = data;
    return [
      {
        title: 'Conversions totales',
        value: stats.totalConversions.toLocaleString('fr-FR'),
        icon: <TrendingUp className="size-5" />,
        trend: null,
        gradient: 'from-chart-1/10 to-chart-1/5',
      },
      {
        title: "Fichiers convertis aujourd'hui",
        value: stats.conversionsToday.toLocaleString('fr-FR'),
        icon: <Activity className="size-5" />,
        trend: null,
        gradient: 'from-chart-2/10 to-chart-2/5',
      },
      {
        title: 'Stockage utilisé',
        value: `${formatFileSize(stats.storageUsed)} / ${formatFileSize(stats.storageLimit)}`,
        icon: <HardDrive className="size-5" />,
        progress: Math.min(100, Math.round((stats.storageUsed / stats.storageLimit) * 100)),
        gradient: 'from-chart-4/10 to-chart-4/5',
      },
      {
        title: 'Taux de réussite',
        value: `${stats.successRate}%`,
        icon: <CheckCircle className="size-5" />,
        trend: null,
        gradient: 'from-chart-5/10 to-chart-5/5',
      },
    ];
  }, [data]);

  const formatChartData = useMemo(() => {
    if (!data) return [];
    const total = Object.values(data.formatDistribution).reduce((sum, v) => sum + v, 0);
    if (total === 0) {
      return [
        { name: 'PDF', value: 0, fill: 'var(--color-pdf)' },
        { name: 'Image', value: 0, fill: 'var(--color-image)' },
        { name: 'Vidéo', value: 0, fill: 'var(--color-video)' },
        { name: 'Audio', value: 0, fill: 'var(--color-audio)' },
        { name: 'Autre', value: 0, fill: 'var(--color-convert)' },
      ];
    }
    return [
      { name: 'PDF', value: data.formatDistribution.pdf || 0, fill: 'var(--color-pdf)' },
      { name: 'Image', value: data.formatDistribution.image || 0, fill: 'var(--color-image)' },
      { name: 'Vidéo', value: data.formatDistribution.video || 0, fill: 'var(--color-video)' },
      { name: 'Audio', value: data.formatDistribution.audio || 0, fill: 'var(--color-audio)' },
      { name: 'Autre', value: data.formatDistribution.convert || 0, fill: 'var(--color-convert)' },
    ].filter((d) => d.value > 0);
  }, [data]);

  const realActivityItems = useMemo(() => {
    if (!data) return [];
    return data.activityItems.slice(0, 5).map((item) => {
      const actionMap: Record<string, string> = {
        pdf: 'A converti (PDF)',
        image: 'A converti (Image)',
        video: 'A converti (Vidéo)',
        audio: 'A converti (Audio)',
        convert: 'A converti',
      };
      return {
        id: item.id,
        action: actionMap[item.toolType] || 'A converti',
        detail: `${item.inputFormat} → ${item.outputFormat}`,
        time: new Date(item.createdAt),
        icon: getToolTypeIcon(item.toolType),
      };
    });
  }, [data]);

  // NOW we can do early returns after all hooks

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-brand animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Activity className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error || 'Erreur inconnue'}</p>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Show welcome state for brand new users
  if (isNewUser) {
    return <WelcomeState onStart={() => setCurrentView('convert')} />;
  }

  const { stats, activityData, recentConversions } = data;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                      <ArrowUp className="size-3" />
                      {stat.trend}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
                {stat.progress !== undefined && (
                  <div className="mt-3 space-y-1">
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Line/Area Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activité de conversion</CardTitle>
              <CardDescription className="text-xs">7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={activityChartConfig} className="h-[260px] w-full">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-conversions)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-conversions)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stroke="var(--color-conversions)"
                    fill="url(#fillConversions)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formats Pie/Donut Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Formats populaires</CardTitle>
              <CardDescription className="text-xs">Répartition par type de fichier</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {formatChartData.length > 0 ? (
                <ChartContainer config={formatChartConfig} className="h-[260px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie
                      data={formatChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {formatChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FolderOpen className="size-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune donnée de format</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Conversions Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Conversions récentes</CardTitle>
                <CardDescription className="text-xs">Vos dernières conversions de fichiers</CardDescription>
              </div>
              {recentConversions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('history')}
                  className="text-brand hover:text-brand-dark"
                >
                  Voir tout
                  <ArrowUp className="size-3 rotate-45" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentConversions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileStack className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune conversion pour le moment</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setCurrentView('convert')}
                >
                  <Plus className="size-3.5" />
                  Commencer
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier</TableHead>
                    <TableHead className="hidden sm:table-cell">Format</TableHead>
                    <TableHead className="hidden md:table-cell">Taille</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConversions.map((conv) => (
                    <TableRow key={conv.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                            {getFileIcon(conv.inputFormat)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[160px]">
                              {conv.files.length > 0
                                ? conv.files[0].originalName
                                : `${conv.inputFormat} → ${conv.outputFormat}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {conv.inputFormat}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {conv.outputFormat}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {formatFileSize(conv.fileSize)}
                      </TableCell>
                      <TableCell>{getStatusBadge(conv.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true, locale: fr })}
                      </TableCell>
                      <TableCell>
                        {conv.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="size-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actions rapides</CardTitle>
              <CardDescription className="text-xs">Accédez rapidement aux outils</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-brand/5 hover:border-brand/30 transition-all"
                  onClick={() => setCurrentView('convert')}
                >
                  <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Plus className="size-5" />
                  </div>
                  <span className="text-xs font-medium">Nouvelle conversion</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-red-500/5 hover:border-red-500/30 transition-all"
                  onClick={() => {
                    setCurrentView('tools');
                  }}
                >
                  <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <FileText className="size-5" />
                  </div>
                  <span className="text-xs font-medium">Outils PDF</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-chart-2/5 hover:border-chart-2/30 transition-all"
                  onClick={() => {
                    setCurrentView('tools');
                  }}
                >
                  <div className="size-10 rounded-xl bg-chart-2/10 flex items-center justify-center text-chart-2">
                    <ImageIcon className="size-5" />
                  </div>
                  <span className="text-xs font-medium">Outils Image</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-chart-3/5 hover:border-chart-3/30 transition-all"
                  onClick={() => setCurrentView('history')}
                >
                  <div className="size-10 rounded-xl bg-chart-3/10 flex items-center justify-center text-chart-3">
                    <History className="size-5" />
                  </div>
                  <span className="text-xs font-medium">Historique complet</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activité récente</CardTitle>
              <CardDescription className="text-xs">Vos dernières actions</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {realActivityItems.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune activité récente</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[220px]">
                  <div className="space-y-1">
                    {realActivityItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{item.action}</span>{' '}
                            <span className="text-muted-foreground">{item.detail}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            {formatDistanceToNow(item.time, { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 
export default Dashboard;

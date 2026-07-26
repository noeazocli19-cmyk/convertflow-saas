'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Download,
  Trash2,
  FileText,
  Image as ImageIconLucide,
  Video,
  Music,
  FileStack,
  SlidersHorizontal,
  ArrowUpDown,
  FolderOpen,
  Plus,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';

// ---- Types ----

interface ConversionFile {
  id: string;
  originalName: string;
  fileSize: number;
  status: string;
}

interface HistoryConversion {
  id: string;
  inputFormat: string;
  outputFormat: string;
  fileSize: number;
  outputSize: number;
  status: string;
  toolType: string;
  createdAt: string;
  files: ConversionFile[];
}

interface ConversionsResponse {
  conversions: HistoryConversion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Helpers ----

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(format: string) {
  const f = format.toUpperCase();
  if (['PDF', 'DOCX', 'DOC', 'TXT', 'XLSX', 'XLS', 'PPTX', 'PPT'].includes(f))
    return <FileText className="size-4 text-red-500" />;
  if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG', 'BMP'].includes(f))
    return <ImageIconLucide className="size-4 text-chart-2" />;
  if (['MP4', 'AVI', 'MOV', 'MKV', 'WMV'].includes(f))
    return <Video className="size-4 text-chart-3" />;
  if (['MP3', 'WAV', 'OGG', 'FLAC', 'AAC'].includes(f))
    return <Music className="size-4 text-chart-4" />;
  return <FileStack className="size-4 text-muted-foreground" />;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
          Terminé
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800 text-[10px]">
          En cours
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800 text-[10px]">
          Échoué
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 text-[10px]">
          En attente
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

type SortField = 'createdAt' | 'fileSize';
type SortDir = 'asc' | 'desc';

// ---- Component ----

export function ConversionHistory() {
  const { setCurrentView, user } = useAppStore();
  const [conversions, setConversions] = useState<HistoryConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const perPage = 8;

  const fetchConversions = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        userId: user.id,
        page: page.toString(),
        limit: perPage.toString(),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (formatFilter !== 'all') params.set('toolType', formatFilter);

      const res = await fetch(`/api/conversions?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data: ConversionsResponse = await res.json();
      setConversions(data.conversions);
      setTotalItems(data.pagination.total);
    } catch (err) {
      console.error('Conversions fetch error:', err);
      setError('Impossible de charger les conversions');
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, statusFilter, formatFilter]);

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  // Client-side search filter (since API doesn't support text search)
  const filtered = useMemo(() => {
    let results = [...conversions];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.files.some((f) => f.originalName.toLowerCase().includes(q)) ||
          c.inputFormat.toLowerCase().includes(q) ||
          c.outputFormat.toLowerCase().includes(q)
      );
    }

    // Client-side sort
    results.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'fileSize') {
        cmp = a.fileSize - b.fileSize;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [conversions, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    // In a real app, call API to delete selected
    setSelectedIds(new Set());
  };

  const handleBulkDownload = () => {
    setSelectedIds(new Set());
  };

  // Loading state
  if (loading && conversions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass-card">
          <CardContent className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 text-brand animate-spin" />
              <p className="text-sm text-muted-foreground">Chargement de l&apos;historique...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass-card">
          <CardContent className="py-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <FileStack className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchConversions}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Historique des conversions</CardTitle>
              <CardDescription className="text-xs">
                {totalItems} conversion{totalItems !== 1 ? 's' : ''} au total
              </CardDescription>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedIds.size} sélectionné{selectedIds.size !== 1 ? 's' : ''}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                  className="text-chart-5"
                >
                  <Download className="size-3.5" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou format..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={formatFilter}
              onValueChange={(v) => {
                setFormatFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SlidersHorizontal className="size-4" />
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="convert">Convert</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty state for no conversions at all */}
          {totalItems === 0 && !search && statusFilter === 'all' && formatFilter === 'all' ? (
            <div className="py-12 text-center">
              <FolderOpen className="size-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-1">Aucune conversion</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vous n&apos;avez pas encore effectué de conversion de fichier.
              </p>
              <Button
                onClick={() => setCurrentView('convert')}
                className="gradient-brand text-white"
              >
                <Plus className="size-4" />
                Commencer votre première conversion
              </Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-lg border overflow-hidden">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>
                          <button
                            type="button"
                            onClick={() => toggleSort('createdAt')}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            Fichier
                            <ArrowUpDown className="size-3" />
                          </button>
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">Format</TableHead>
                        <TableHead className="hidden md:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort('fileSize')}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            Taille
                            <ArrowUpDown className="size-3" />
                          </button>
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort('createdAt')}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            Date
                            <ArrowUpDown className="size-3" />
                          </button>
                        </TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <Search className="size-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Aucune conversion trouvée avec ces filtres</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((conv) => (
                          <TableRow key={conv.id} className="group">
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(conv.id)}
                                onCheckedChange={() => toggleSelect(conv.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  {getFileIcon(conv.inputFormat)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate max-w-[180px]">
                                    {conv.files.length > 0
                                      ? conv.files[0].originalName
                                      : `${conv.inputFormat} → ${conv.outputFormat}`}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground sm:hidden">
                                    {conv.inputFormat} → {conv.outputFormat}
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
                              <div>
                                <div>{formatFileSize(conv.fileSize)}</div>
                                {conv.outputSize > 0 && (
                                  <div className="text-[10px]">
                                    → {formatFileSize(conv.outputSize)}
                                  </div>
                                )}
                              </div>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 
export default ConversionHistory;

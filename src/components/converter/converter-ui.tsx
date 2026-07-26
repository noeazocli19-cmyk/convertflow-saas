'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  FileText,
  Music,
  Film,
  Archive,
  BookOpen,
  Code2,
  ArrowRight,
  Download,
  DownloadCloud,
  QrCode,
  Share2,
  Settings2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { FileUploader } from './file-uploader';
import type { ConversionFileItem, ToolCategory } from '@/types';

// ============================================================
// Format definitions
// ============================================================
interface FormatOption {
  id: string;
  label: string;
  category: ToolCategory;
  popular?: boolean;
  icon?: React.ReactNode;
}

const CATEGORY_TABS: { id: ToolCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'image', label: 'Images', icon: <ImageIcon className="size-4" /> },
  { id: 'pdf', label: 'Documents', icon: <FileText className="size-4" /> },
  { id: 'audio', label: 'Audio', icon: <Music className="size-4" /> },
  { id: 'video', label: 'Vidéos', icon: <Film className="size-4" /> },
  { id: 'archive', label: 'Archives', icon: <Archive className="size-4" /> },
  { id: 'ebook', label: 'eBooks', icon: <BookOpen className="size-4" /> },
  { id: 'developer', label: 'Développeurs', icon: <Code2 className="size-4" /> },
];

const FORMAT_MAP: Record<ToolCategory, FormatOption[]> = {
  image: [
    { id: 'png', label: 'PNG', category: 'image', popular: true },
    { id: 'jpg', label: 'JPG', category: 'image', popular: true },
    { id: 'webp', label: 'WebP', category: 'image', popular: true },
    { id: 'avif', label: 'AVIF', category: 'image' },
    { id: 'gif', label: 'GIF', category: 'image' },
    { id: 'tiff', label: 'TIFF', category: 'image' },
    { id: 'bmp', label: 'BMP', category: 'image' },
    { id: 'ico', label: 'ICO', category: 'image' },
    { id: 'svg', label: 'SVG', category: 'image' },
  ],
  pdf: [
    { id: 'pdf', label: 'PDF', category: 'pdf', popular: true },
    { id: 'docx', label: 'DOCX', category: 'pdf' },
    { id: 'txt', label: 'TXT', category: 'pdf' },
    { id: 'rtf', label: 'RTF', category: 'pdf' },
    { id: 'odt', label: 'ODT', category: 'pdf' },
    { id: 'html', label: 'HTML', category: 'pdf' },
    { id: 'md', label: 'Markdown', category: 'pdf' },
  ],
  audio: [
    { id: 'mp3', label: 'MP3', category: 'audio', popular: true },
    { id: 'wav', label: 'WAV', category: 'audio', popular: true },
    { id: 'aac', label: 'AAC', category: 'audio' },
    { id: 'flac', label: 'FLAC', category: 'audio' },
    { id: 'ogg', label: 'OGG', category: 'audio' },
    { id: 'wma', label: 'WMA', category: 'audio' },
    { id: 'm4a', label: 'M4A', category: 'audio' },
  ],
  video: [
    { id: 'mp4', label: 'MP4', category: 'video', popular: true },
    { id: 'avi', label: 'AVI', category: 'video' },
    { id: 'mkv', label: 'MKV', category: 'video' },
    { id: 'mov', label: 'MOV', category: 'video' },
    { id: 'webm', label: 'WebM', category: 'video' },
    { id: 'gif', label: 'GIF', category: 'video' },
  ],
  archive: [
    { id: 'zip', label: 'ZIP', category: 'archive', popular: true },
    { id: 'rar', label: 'RAR', category: 'archive' },
    { id: '7z', label: '7Z', category: 'archive' },
    { id: 'tar', label: 'TAR', category: 'archive' },
    { id: 'gz', label: 'GZ', category: 'archive' },
  ],
  ebook: [
    { id: 'epub', label: 'EPUB', category: 'ebook', popular: true },
    { id: 'mobi', label: 'MOBI', category: 'ebook' },
    { id: 'pdf', label: 'PDF', category: 'ebook' },
    { id: 'azw3', label: 'AZW3', category: 'ebook' },
  ],
  developer: [
    { id: 'json', label: 'JSON', category: 'developer', popular: true },
    { id: 'xml', label: 'XML', category: 'developer' },
    { id: 'yaml', label: 'YAML', category: 'developer' },
    { id: 'csv', label: 'CSV', category: 'developer' },
    { id: 'sql', label: 'SQL', category: 'developer' },
  ],
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function detectCategory(mimeType: string): ToolCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar'))
    return 'archive';
  if (mimeType.includes('epub') || mimeType.includes('mobi')) return 'ebook';
  return 'pdf';
}

// ============================================================
// Main ConverterUI Component
// ============================================================
export function ConverterUI() {
  const { activeCategory, setActiveCategory, addConversion, updateConversion } = useAppStore();

  const [files, setFiles] = useState<ConversionFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(80);
  const [completedFiles, setCompletedFiles] = useState<
    Map<string, { url: string; size: number }>
  >(new Map());
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');

  // Auto-detect category from first uploaded file
  const detectedCategory = useMemo(() => {
    if (files.length === 0) return activeCategory;
    return detectCategory(files[0].file.type);
  }, [files, activeCategory]);

  const currentCategory = files.length > 0 ? detectedCategory : activeCategory;
  const availableFormats = FORMAT_MAP[currentCategory] || FORMAT_MAP.image;

  // Filter out the source format from available output formats
  const sourceExtension = files.length > 0
    ? files[0].file.name.split('.').pop()?.toLowerCase()
    : null;

  const filteredFormats = availableFormats.filter(
    (f) => f.id !== sourceExtension
  );

  const handleConvert = useCallback(async () => {
    if (!targetFormat || files.length === 0) return;

    setIsConverting(true);
    setProgress(0);

    const jobId = crypto.randomUUID();
    addConversion({
      id: jobId,
      inputFormat: sourceExtension || 'unknown',
      outputFormat: targetFormat,
      status: 'processing',
      progress: 0,
      files,
      createdAt: new Date(),
      fileSize: files.reduce((s, f) => s + f.fileSize, 0),
    });

    const newCompleted = new Map(completedFiles);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('format', targetFormat);
      formData.append('quality', quality.toString());

      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Conversion failed');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        newCompleted.set(fileItem.id, { url, size: blob.size });
        setCompletedFiles(new Map(newCompleted));

        const pct = Math.round(((i + 1) / files.length) * 100);
        setProgress(pct);
        updateConversion(jobId, { progress: pct });
      } catch {
        // Mark as failed silently for now
      }
    }

    updateConversion(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      outputSize: Array.from(newCompleted.values()).reduce((s, v) => s + v.size, 0),
    });

    setIsConverting(false);
  }, [targetFormat, files, quality, sourceExtension, addConversion, updateConversion, completedFiles]);

  const handleDownload = useCallback(
    (fileItem: ConversionFileItem) => {
      const result = completedFiles.get(fileItem.id);
      if (!result) return;

      const a = document.createElement('a');
      a.href = result.url;
      const baseName = fileItem.originalName.replace(/\.[^.]+$/, '');
      a.download = `${baseName}.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [completedFiles, targetFormat]
  );

  const handleDownloadAll = useCallback(async () => {
    for (const fileItem of files) {
      handleDownload(fileItem);
      await new Promise((r) => setTimeout(r, 200));
    }
  }, [files, handleDownload]);

  const handleQRCode = useCallback(
    async (fileItem: ConversionFileItem) => {
      const result = completedFiles.get(fileItem.id);
      if (!result) return;

      try {
        const QRCode = (await import('qrcode')).default;
        const dataUrl = await QRCode.toDataURL(result.url, {
          width: 256,
          margin: 2,
        });
        setQrData(dataUrl);
        setShowQR(true);
      } catch {
        // QR generation failed
      }
    },
    [completedFiles]
  );

  const handleShare = useCallback(
    async (fileItem: ConversionFileItem) => {
      const result = completedFiles.get(fileItem.id);
      if (!result) return;

      if (navigator.share) {
        try {
          const response = await fetch(result.url);
          const blob = await response.blob();
          const baseName = fileItem.originalName.replace(/\.[^.]+$/, '');
          const file = new File([blob], `${baseName}.${targetFormat}`, { type: blob.type });
          await navigator.share({ files: [file], title: `ConvertFlow - ${baseName}.${targetFormat}` });
        } catch {
          // Share cancelled
        }
      }
    },
    [completedFiles, targetFormat]
  );

  const totalOriginalSize = files.reduce((s, f) => s + f.fileSize, 0);
  const totalOutputSize = Array.from(completedFiles.values()).reduce(
    (s, v) => s + v.size,
    0
  );
  const savings =
    totalOriginalSize > 0 && totalOutputSize > 0
      ? Math.round((1 - totalOutputSize / totalOriginalSize) * 100)
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ====== Left: Format Selection ====== */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Format de sortie</h3>

          <Tabs
            value={currentCategory}
            onValueChange={(v) => {
              setActiveCategory(v as ToolCategory);
              setTargetFormat(null);
            }}
          >
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">
              {CATEGORY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 data-[state=active]:gradient-brand data-[state=active]:text-white rounded-lg"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-2 pr-3">
              <AnimatePresence>
                {filteredFormats.map((fmt) => (
                  <motion.button
                    key={fmt.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTargetFormat(fmt.id)}
                    className={cn(
                      'glass-card rounded-xl p-3 text-center transition-all cursor-pointer',
                      'hover:ring-2 hover:ring-primary/30',
                      targetFormat === fmt.id &&
                        'ring-2 ring-primary bg-primary/10 shadow-md'
                    )}
                  >
                    <p className="text-sm font-bold">{fmt.label}</p>
                    {fmt.popular && (
                      <Badge className="mt-1 text-[9px] px-1 py-0 bg-primary/15 text-primary border-primary/20">
                        Populaire
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ====== Center: Upload & Pipeline ====== */}
      <div className="lg:col-span-5 space-y-4">
        {/* File Uploader */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Fichiers source
          </h3>
          <FileUploader
            files={files}
            onFilesChange={setFiles}
            maxFileSize={100}
            maxFiles={20}
          />
        </div>

        {/* Conversion Pipeline */}
        {files.length > 0 && targetFormat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4 space-y-4"
          >
            {/* Pipeline Visual */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {sourceExtension}
                </span>
              </div>

              <ArrowRight className="size-4 text-primary shrink-0" />

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                <span className="text-xs font-bold uppercase text-primary">
                  {targetFormat}
                </span>
              </div>
            </div>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Settings2 className="size-3.5" />
              <span>Paramètres de qualité</span>
              {showSettings ? (
                <ChevronUp className="size-3 ml-auto" />
              ) : (
                <ChevronDown className="size-3 ml-auto" />
              )}
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 py-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">
                          Compression
                        </label>
                        <span className="text-xs text-primary font-bold">
                          {quality}%
                        </span>
                      </div>
                      <Slider
                        value={[quality]}
                        onValueChange={([v]) => setQuality(v)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Convert Button */}
            <Button
              onClick={handleConvert}
              disabled={isConverting || files.length === 0 || !targetFormat}
              className="w-full gradient-brand text-white font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              size="lg"
            >
              {isConverting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Conversion en cours...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Convertir en {targetFormat.toUpperCase()}
                </>
              )}
            </Button>

            {/* Progress */}
            {isConverting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress}% — {files.length} fichier{files.length > 1 ? 's' : ''}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ====== Right: Preview & Download ====== */}
      <div className="lg:col-span-4 space-y-4">
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Résultat & Téléchargement
          </h3>

          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <DownloadCloud className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Importez des fichiers et convertissez-les pour voir les résultats ici
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3 pr-3">
                {files.map((fileItem) => {
                  const result = completedFiles.get(fileItem.id);
                  const isDone = !!result;

                  return (
                    <motion.div
                      key={fileItem.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        {/* Preview */}
                        <div className="size-10 rounded-lg bg-muted/60 flex items-center justify-center overflow-hidden shrink-0">
                          {fileItem.preview ? (
                            <img
                              src={fileItem.preview}
                              alt={fileItem.originalName}
                              className="size-full object-cover"
                            />
                          ) : (
                            <FileText className="size-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {fileItem.originalName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {formatFileSize(fileItem.fileSize)}
                            </span>
                            {isDone && result.size > 0 && (
                              <>
                                <ArrowRight className="size-2.5 text-muted-foreground" />
                                <span className="text-[10px] text-primary font-medium">
                                  {formatFileSize(result.size)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        ) : isConverting ? (
                          <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                        ) : (
                          <AlertCircle className="size-4 text-muted-foreground shrink-0" />
                        )}
                      </div>

                      {/* Actions */}
                      {isDone && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-[11px] flex-1 gradient-brand text-white"
                            onClick={() => handleDownload(fileItem)}
                          >
                            <Download className="size-3" />
                            Télécharger
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleQRCode(fileItem)}
                          >
                            <QrCode className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleShare(fileItem)}
                          >
                            <Share2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Batch download & savings */}
          {completedFiles.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2 border-t border-border/50"
            >
              <Button
                onClick={handleDownloadAll}
                className="w-full gradient-brand text-white font-semibold h-10 rounded-xl"
              >
                <DownloadCloud className="size-4" />
                Tout télécharger ({completedFiles.size} fichier{completedFiles.size > 1 ? 's' : ''})
              </Button>

              {savings !== null && (
                <div className="flex items-center justify-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    {formatFileSize(totalOriginalSize)}
                  </span>
                  <ArrowRight className="size-3 text-primary" />
                  <span className="font-medium text-foreground">
                    {formatFileSize(totalOutputSize)}
                  </span>
                  {savings > 0 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      -{savings}%
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                      +{Math.abs(savings)}%
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code - Téléchargement mobile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrData && (
              <img
                src={qrData}
                alt="QR Code for download"
                className="size-48 rounded-lg border"
              />
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Scannez ce QR code pour télécharger le fichier sur votre appareil mobile
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

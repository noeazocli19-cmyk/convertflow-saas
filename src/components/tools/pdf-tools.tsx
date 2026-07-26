'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Merge,
  Split,
  FileDown,
  Unlock,
  Lock,
  Droplets,
  PenTool,
  Hash,
  Scissors,
  Trash2,
  RotateCw,
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { PDFTool } from '@/types';

const PDF_TOOLS: (PDFTool & { icon: React.ReactNode })[] = [
  {
    id: 'pdf-merge',
    name: 'Fusionner PDF',
    description: 'Combinez plusieurs PDF en un seul document',
    icon: <Merge className="size-5" />,
    action: 'merge',
  },
  {
    id: 'pdf-split',
    name: 'Diviser PDF',
    description: 'Extrayez des pages spécifiques d\'un PDF',
    icon: <Split className="size-5" />,
    action: 'split',
  },
  {
    id: 'pdf-compress',
    name: 'Compresser PDF',
    description: 'Réduisez la taille de votre fichier PDF',
    icon: <FileDown className="size-5" />,
    action: 'compress',
  },
  {
    id: 'pdf-unlock',
    name: 'Déverrouiller PDF',
    description: 'Supprimez le mot de passe d\'un PDF',
    icon: <Unlock className="size-5" />,
    action: 'unlock',
  },
  {
    id: 'pdf-protect',
    name: 'Protéger PDF',
    description: 'Ajoutez un mot de passe à votre PDF',
    icon: <Lock className="size-5" />,
    action: 'protect',
  },
  {
    id: 'pdf-watermark',
    name: 'Filigrane',
    description: 'Ajoutez un filigrane texte sur chaque page',
    icon: <Droplets className="size-5" />,
    action: 'watermark',
  },
  {
    id: 'pdf-sign',
    name: 'Signature',
    description: 'Ajoutez une signature sur votre document',
    icon: <PenTool className="size-5" />,
    action: 'sign',
  },
  {
    id: 'pdf-number',
    name: 'Numéroter',
    description: 'Ajoutez des numéros de page automatiques',
    icon: <Hash className="size-5" />,
    action: 'number',
  },
  {
    id: 'pdf-extract',
    name: 'Extraire pages',
    description: 'Extrayez des pages spécifiques du document',
    icon: <Scissors className="size-5" />,
    action: 'extract',
  },
  {
    id: 'pdf-delete',
    name: 'Supprimer pages',
    description: 'Retirez des pages indésirables du PDF',
    icon: <Trash2 className="size-5" />,
    action: 'delete',
  },
  {
    id: 'pdf-rotate',
    name: 'Rotation',
    description: 'Pivoter les pages de votre PDF',
    icon: <RotateCw className="size-5" />,
    action: 'rotate',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface PDFToolActionProps {
  tool: PDFTool & { icon: React.ReactNode };
  onClose: () => void;
}

function PDFToolAction({ tool, onClose }: PDFToolActionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIEL');
  const [pageRange, setPageRange] = useState('1');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles).filter(
        (f) => f.type === 'application/pdf'
      );
      // For merge, allow multiple; for others, only the first
      if (tool.action === 'merge') {
        setFiles((prev) => [...prev, ...arr]);
      } else {
        setFiles(arr.slice(0, 1));
      }
    },
    [tool.action]
  );

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('action', tool.action);
    formData.append('watermarkText', watermarkText);
    formData.append('pageRange', pageRange);

    try {
      const res = await fetch('/api/convert/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  }, [files, tool.action, watermarkText, pageRange]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `result-${tool.action}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl, tool.action]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-2xl p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl gradient-brand flex items-center justify-center text-white">
            {tool.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Upload Zone */}
      {!resultUrl && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.multiple = tool.action === 'merge';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFiles(target.files);
              };
              input.click();
            }}
            className={cn(
              'drop-zone rounded-xl cursor-pointer flex flex-col items-center justify-center py-8 px-4 transition-all',
              'bg-muted/30 hover:bg-muted/50',
              isDragOver && 'active'
            )}
          >
            <Upload className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {tool.action === 'merge'
                ? 'Glissez vos PDF ici'
                : 'Glissez votre PDF ici'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 glass-card rounded-lg p-2"
                >
                  <FileText className="size-4 text-red-500 shrink-0" />
                  <span className="text-sm truncate flex-1">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(f.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Extra Options */}
          {tool.action === 'watermark' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Texte du filigrane</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="CONFIDENTIEL"
              />
            </div>
          )}

          {(tool.action === 'split' ||
            tool.action === 'extract' ||
            tool.action === 'delete') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Pages (ex: 1-3, 5, 7-9)
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="1-3, 5"
              />
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={isProcessing || files.length === 0}
            className="w-full gradient-brand text-white font-semibold h-11 rounded-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>Exécuter</>
            )}
          </Button>
        </>
      )}

      {/* Result */}
      {resultUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="size-6 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Traitement terminé !
              </p>
              <p className="text-xs text-muted-foreground">
                Taille du résultat : {formatFileSize(resultSize)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1 gradient-brand text-white font-semibold h-10 rounded-xl"
            >
              <Download className="size-4" />
              Télécharger
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResultUrl(null);
                setFiles([]);
                setResultSize(0);
              }}
              className="rounded-xl"
            >
              Nouveau
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function PDFTools() {
  const { setActiveTool, activeTool } = useAppStore();
  const [selectedTool, setSelectedTool] = useState<
    (PDFTool & { icon: React.ReactNode }) | null
  >(null);

  const handleToolClick = (tool: PDFTool & { icon: React.ReactNode }) => {
    setSelectedTool(tool);
    setActiveTool(tool.id);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {selectedTool ? (
          <PDFToolAction
            key={selectedTool.id}
            tool={selectedTool}
            onClose={() => {
              setSelectedTool(null);
              setActiveTool(null);
            }}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {PDF_TOOLS.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToolClick(tool)}
                className={cn(
                  'glass-card rounded-xl p-4 text-left transition-all cursor-pointer',
                  'hover:ring-2 hover:ring-primary/30 hover:shadow-lg',
                  activeTool === tool.id && 'ring-2 ring-primary shadow-lg'
                )}
              >
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {tool.icon}
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {tool.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tool.description}
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

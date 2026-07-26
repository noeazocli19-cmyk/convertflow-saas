'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileDown,
  Maximize2,
  Crop,
  RotateCw,
  Eraser,
  Droplets,
  Zap,
  Globe,
  ImagePlay,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Download,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { ImageTool } from '@/types';

const IMAGE_TOOLS: (ImageTool & { icon: React.ReactNode })[] = [
  {
    id: 'img-compress',
    name: 'Compression',
    description: 'Réduisez la taille de vos images sans perte visible',
    icon: <FileDown className="size-5" />,
    action: 'compress',
  },
  {
    id: 'img-resize',
    name: 'Redimensionnement',
    description: 'Modifiez les dimensions de votre image',
    icon: <Maximize2 className="size-5" />,
    action: 'resize',
  },
  {
    id: 'img-crop',
    name: 'Rognage',
    description: 'Découpez votre image aux dimensions souhaitées',
    icon: <Crop className="size-5" />,
    action: 'crop',
  },
  {
    id: 'img-rotate',
    name: 'Rotation',
    description: 'Pivoter votre image à n\'importe quel angle',
    icon: <RotateCw className="size-5" />,
    action: 'rotate',
  },
  {
    id: 'img-bg-remove',
    name: 'Suppression arrière-plan',
    description: 'Supprimez l\'arrière-plan automatiquement',
    icon: <Eraser className="size-5" />,
    action: 'bg-remove',
  },
  {
    id: 'img-watermark',
    name: 'Filigrane',
    description: 'Ajoutez un filigrane texte ou image',
    icon: <Droplets className="size-5" />,
    action: 'watermark',
  },
  {
    id: 'img-optimize',
    name: 'Optimisation',
    description: 'Optimisez pour le web avec un chargement rapide',
    icon: <Zap className="size-5" />,
    action: 'optimize',
  },
  {
    id: 'img-webp',
    name: 'Conversion WebP',
    description: 'Convertissez en WebP pour des images plus légères',
    icon: <Globe className="size-5" />,
    action: 'webp',
  },
  {
    id: 'img-avif',
    name: 'Conversion AVIF',
    description: 'Convertissez en AVIF pour une compression maximale',
    icon: <ImagePlay className="size-5" />,
    action: 'avif',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface ImageToolActionProps {
  tool: ImageTool & { icon: React.ReactNode };
  onClose: () => void;
}

function ImageToolAction({ tool, onClose }: ImageToolActionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [watermarkText, setWatermarkText] = useState('© ConvertFlow');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((newFile: File) => {
    if (!newFile.type.startsWith('image/')) return;
    setFile(newFile);

    // Create preview
    const url = URL.createObjectURL(newFile);
    setPreview(url);

    // Get dimensions
    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);

    // Determine target format based on tool action
    let targetFormat = file.type.split('/')[1] || 'png';
    if (tool.action === 'webp') targetFormat = 'webp';
    if (tool.action === 'avif') targetFormat = 'avif';
    if (tool.action === 'optimize') targetFormat = 'webp';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', targetFormat);
    formData.append('quality', quality.toString());
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    formData.append('action', tool.action);
    formData.append('watermarkText', watermarkText);

    try {
      const res = await fetch('/api/convert', {
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
  }, [file, tool.action, quality, width, height, watermarkText]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    let ext = 'png';
    if (tool.action === 'webp') ext = 'webp';
    if (tool.action === 'avif') ext = 'avif';
    if (tool.action === 'optimize') ext = 'webp';
    a.download = `${baseName}-${tool.action}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl, file, tool.action]);

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
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files?.[0]) handleFile(target.files[0]);
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
              Glissez votre image ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir
            </p>
          </div>

          {/* Image Preview & Info */}
          {file && preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={preview}
                    alt={file.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {width} x {height}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={() => {
                    setFile(null);
                    if (preview) URL.revokeObjectURL(preview);
                    setPreview(null);
                  }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              {/* Settings */}
              <div className="space-y-3 p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Settings2 className="size-3.5" />
                  Paramètres
                </div>

                {/* Quality slider for compress/optimize/webp/avif */}
                {['compress', 'optimize', 'webp', 'avif'].includes(tool.action) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Qualité</label>
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
                )}

                {/* Resize width/height */}
                {tool.action === 'resize' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Largeur (px)</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Hauteur (px)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Watermark text */}
                {tool.action === 'watermark' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Texte du filigrane</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="© ConvertFlow"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={isProcessing || !file}
            className="w-full gradient-brand text-white font-semibold h-11 rounded-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                {tool.icon}
                {tool.name}
              </>
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
          {/* Preview */}
          <div className="rounded-xl overflow-hidden bg-muted/30 border flex items-center justify-center max-h-64">
            <img
              src={resultUrl}
              alt="Converted result"
              className="max-h-64 object-contain"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Conversion terminée !
              </p>
              <p className="text-xs text-muted-foreground">
                {file && (
                  <>
                    {formatFileSize(file.size)} → {formatFileSize(resultSize)}
                    {file.size > 0 && resultSize > 0 && (
                      <span
                        className={cn(
                          'ml-2 font-medium',
                          resultSize < file.size
                            ? 'text-emerald-600'
                            : 'text-orange-500'
                        )}
                      >
                        {resultSize < file.size ? '-' : '+'}
                        {Math.abs(
                          Math.round((1 - resultSize / file.size) * 100)
                        )}
                        %
                      </span>
                    )}
                  </>
                )}
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
                setFile(null);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
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

export function ImageTools() {
  const { setActiveTool, activeTool } = useAppStore();
  const [selectedTool, setSelectedTool] = useState<
    (ImageTool & { icon: React.ReactNode }) | null
  >(null);

  const handleToolClick = (tool: ImageTool & { icon: React.ReactNode }) => {
    setSelectedTool(tool);
    setActiveTool(tool.id);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {selectedTool ? (
          <ImageToolAction
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
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {IMAGE_TOOLS.map((tool, index) => (
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
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
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

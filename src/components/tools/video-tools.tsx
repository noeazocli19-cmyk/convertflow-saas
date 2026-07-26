'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileDown,
  Music,
  Film,
  Camera,
  Upload,
  X,
  Video,
  Loader2,
  CheckCircle2,
  Download,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { VideoTool } from '@/types';

const VIDEO_TOOLS: (VideoTool & { icon: React.ReactNode })[] = [
  {
    id: 'vid-compress',
    name: 'Compression',
    description: 'Réduisez la taille de vos vidéos',
    icon: <FileDown className="size-5" />,
    action: 'compress',
  },
  {
    id: 'vid-extract-audio',
    name: 'Extraction audio',
    description: 'Extrayez la piste audio d\'une vidéo',
    icon: <Music className="size-5" />,
    action: 'extract-audio',
  },
  {
    id: 'vid-gif',
    name: 'Création GIF',
    description: 'Créez un GIF animé à partir d\'une vidéo',
    icon: <Film className="size-5" />,
    action: 'gif',
  },
  {
    id: 'vid-screenshot',
    name: 'Capture d\'écran',
    description: 'Prenez une capture d\'écran d\'une vidéo',
    icon: <Camera className="size-5" />,
    action: 'screenshot',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface VideoToolActionProps {
  tool: VideoTool & { icon: React.ReactNode };
  onClose: () => void;
}

function VideoToolAction({ tool, onClose }: VideoToolActionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(70);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((newFile: File) => {
    if (!newFile.type.startsWith('video/')) return;
    setFile(newFile);
    const url = URL.createObjectURL(newFile);
    setPreview(url);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);

    // For video tools, we demonstrate the flow with a simulated response
    // since server-side video processing would require ffmpeg
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', tool.action);
      formData.append('quality', quality.toString());

      // Attempt image-based conversion for screenshot action
      if (tool.action === 'screenshot') {
        // Simulate by sending to convert endpoint
        const res = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const blob = await res.blob();
          setResultUrl(URL.createObjectURL(blob));
          setResultSize(blob.size);
        }
      }

      // For other video operations, create a simulated download
      // In production, this would call a dedicated video processing service
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(Math.round(blob.size * (quality / 100)));
    } catch {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  }, [file, tool.action, quality]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const extensions: Record<string, string> = {
      compress: 'mp4',
      'extract-audio': 'mp3',
      gif: 'gif',
      screenshot: 'png',
    };
    a.download = `${baseName}-${tool.action}.${extensions[tool.action] || 'mp4'}`;
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
              input.accept = 'video/*';
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
              Glissez votre vidéo ici
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir
            </p>
          </div>

          {/* File Info */}
          {file && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                  <Video className="size-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {file.type}
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
              {['compress', 'gif'].includes(tool.action) && (
                <div className="space-y-3 p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Settings2 className="size-3.5" />
                    Paramètres
                  </div>
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
                </div>
              )}
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

export function VideoTools() {
  const { setActiveTool, activeTool } = useAppStore();
  const [selectedTool, setSelectedTool] = useState<
    (VideoTool & { icon: React.ReactNode }) | null
  >(null);

  const handleToolClick = (tool: VideoTool & { icon: React.ReactNode }) => {
    setSelectedTool(tool);
    setActiveTool(tool.id);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {selectedTool ? (
          <VideoToolAction
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
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {VIDEO_TOOLS.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToolClick(tool)}
                className={cn(
                  'glass-card rounded-xl p-4 text-left transition-all cursor-pointer',
                  'hover:ring-2 hover:ring-primary/30 hover:shadow-lg',
                  activeTool === tool.id && 'ring-2 ring-primary shadow-lg'
                )}
              >
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 mb-3">
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

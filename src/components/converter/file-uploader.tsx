'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  BookOpen,
  Code2,
  File,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConversionFileItem } from '@/types';

interface FileUploaderProps {
  files: ConversionFileItem[];
  onFilesChange: (files: ConversionFileItem[]) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  accept?: string;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="size-5 text-emerald-500" />,
  pdf: <FileText className="size-5 text-red-500" />,
  document: <FileText className="size-5 text-blue-500" />,
  video: <Film className="size-5 text-purple-500" />,
  audio: <Music className="size-5 text-orange-500" />,
  archive: <Archive className="size-5 text-yellow-600" />,
  ebook: <BookOpen className="size-5 text-pink-500" />,
  developer: <Code2 className="size-5 text-cyan-500" />,
  default: <File className="size-5 text-muted-foreground" />,
};

function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z'))
    return 'archive';
  if (mimeType.includes('epub') || mimeType.includes('mobi')) return 'ebook';
  if (
    mimeType.includes('json') ||
    mimeType.includes('xml') ||
    mimeType.includes('yaml') ||
    mimeType.includes('javascript') ||
    mimeType.includes('typescript')
  )
    return 'developer';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text'))
    return 'document';
  return 'default';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function SortableFileItem({
  item,
  onRemove,
}: {
  item: ConversionFileItem;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = getFileCategory(item.file.type);
  const icon = FILE_TYPE_ICONS[category] || FILE_TYPE_ICONS.default;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'glass-card flex items-center gap-3 rounded-xl p-3 transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary/30 z-10'
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Preview */}
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {item.preview ? (
          <img
            src={item.preview}
            alt={item.originalName}
            className="size-full object-cover"
          />
        ) : (
          icon
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.originalName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(item.fileSize)}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.file.type.split('/').pop()?.toUpperCase() || 'FILE'}
          </Badge>
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0">
        {item.status === 'processing' && (
          <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
        {item.status === 'completed' && (
          <span className="text-xs text-emerald-500 font-medium">Done</span>
        )}
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.id)}
      >
        <X className="size-3.5" />
      </Button>
    </motion.div>
  );
}

export function FileUploader({
  files,
  onFilesChange,
  maxFileSize = 100,
  maxFiles = 20,
  accept,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const items: ConversionFileItem[] = [];

      for (const file of fileArray) {
        if (files.length + items.length >= maxFiles) break;
        if (file.size > maxFileSize * 1024 * 1024) continue;

        const item: ConversionFileItem = {
          id: crypto.randomUUID(),
          file,
          originalName: file.name,
          fileName: file.name,
          fileSize: file.size,
          status: 'pending',
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          item.preview = URL.createObjectURL(file);
        }

        items.push(item);
      }

      onFilesChange([...files, ...items]);
    },
    [files, onFilesChange, maxFiles, maxFileSize]
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = files.findIndex((f) => f.id === active.id);
        const newIndex = files.findIndex((f) => f.id === over.id);
        onFilesChange(arrayMove(files, oldIndex, newIndex));
      }
    },
    [files, onFilesChange]
  );

  const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'drop-zone rounded-2xl cursor-pointer transition-all duration-300',
          'flex flex-col items-center justify-center py-12 px-6',
          'bg-muted/30 hover:bg-muted/50',
          isDragOver && 'active scale-[1.01]'
        )}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <motion.div
          animate={isDragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'size-16 rounded-2xl flex items-center justify-center mb-4',
            'gradient-brand'
          )}
        >
          <Upload className="size-8 text-white" />
        </motion.div>

        <h3 className="text-lg font-semibold mb-1">
          {isDragOver ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          ou <span className="text-primary font-medium underline underline-offset-2">parcourir</span> pour sélectionner
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Max {maxFileSize} MB par fichier</span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span>Jusqu&apos;à {maxFiles} fichiers</span>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(totalSize)} au total
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={() => {
                    files.forEach((f) => {
                      if (f.preview) URL.revokeObjectURL(f.preview);
                    });
                    onFilesChange([]);
                  }}
                >
                  Tout supprimer
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={files.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {files.map((item) => (
                      <SortableFileItem
                        key={item.id}
                        item={item}
                        onRemove={removeFile}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

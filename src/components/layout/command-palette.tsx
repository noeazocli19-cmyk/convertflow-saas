'use client';

import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/store/app-store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileDown,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  BookOpen,
  Code2,
  LayoutDashboard,
  Clock,
  Wrench,
  Settings,
  Sun,
  Moon,
  Globe,
  PaintBucket,
  Merge,
  Split,
  Lock,
  Unlock,
  Crop,
  RotateCw,
  Scissors,
  Volume2,
  Headphones,
} from 'lucide-react';
import type { AppView } from '@/types';

// ============================================================
// Conversion Formats Data
// ============================================================
const conversionFormats = [
  // PDF
  { label: 'PDF → Word', input: 'pdf', output: 'docx', category: 'pdf', icon: FileText },
  { label: 'Word → PDF', input: 'docx', output: 'pdf', category: 'pdf', icon: FileDown },
  { label: 'PDF → Excel', input: 'pdf', output: 'xlsx', category: 'pdf', icon: FileText },
  { label: 'Excel → PDF', input: 'xlsx', output: 'pdf', category: 'pdf', icon: FileDown },
  { label: 'PDF → PowerPoint', input: 'pdf', output: 'pptx', category: 'pdf', icon: FileText },
  { label: 'PDF → Image (PNG)', input: 'pdf', output: 'png', category: 'pdf', icon: Image },
  { label: 'Image → PDF', input: 'jpg', output: 'pdf', category: 'pdf', icon: FileDown },
  // Image
  { label: 'PNG → JPG', input: 'png', output: 'jpg', category: 'image', icon: Image },
  { label: 'JPG → PNG', input: 'jpg', output: 'png', category: 'image', icon: Image },
  { label: 'WEBP → PNG', input: 'webp', output: 'png', category: 'image', icon: Image },
  { label: 'SVG → PNG', input: 'svg', output: 'png', category: 'image', icon: Image },
  { label: 'HEIC → JPG', input: 'heic', output: 'jpg', category: 'image', icon: Image },
  { label: 'BMP → PNG', input: 'bmp', output: 'png', category: 'image', icon: Image },
  // Video
  { label: 'MP4 → WEBM', input: 'mp4', output: 'webm', category: 'video', icon: Video },
  { label: 'MP4 → AVI', input: 'mp4', output: 'avi', category: 'video', icon: Video },
  { label: 'MOV → MP4', input: 'mov', output: 'mp4', category: 'video', icon: Video },
  { label: 'AVI → MP4', input: 'avi', output: 'mp4', category: 'video', icon: Video },
  { label: 'MKV → MP4', input: 'mkv', output: 'mp4', category: 'video', icon: Video },
  // Audio
  { label: 'MP3 → WAV', input: 'mp3', output: 'wav', category: 'audio', icon: Music },
  { label: 'WAV → MP3', input: 'wav', output: 'mp3', category: 'audio', icon: Music },
  { label: 'FLAC → MP3', input: 'flac', output: 'mp3', category: 'audio', icon: Music },
  { label: 'AAC → MP3', input: 'aac', output: 'mp3', category: 'audio', icon: Music },
  // Archive
  { label: 'ZIP → RAR', input: 'zip', output: 'rar', category: 'archive', icon: Archive },
  { label: '7Z → ZIP', input: '7z', output: 'zip', category: 'archive', icon: Archive },
  // Ebook
  { label: 'EPUB → PDF', input: 'epub', output: 'pdf', category: 'ebook', icon: BookOpen },
  { label: 'MOBI → EPUB', input: 'mobi', output: 'epub', category: 'ebook', icon: BookOpen },
  // Developer
  { label: 'JSON → YAML', input: 'json', output: 'yaml', category: 'developer', icon: Code2 },
  { label: 'CSV → JSON', input: 'csv', output: 'json', category: 'developer', icon: Code2 },
];

// ============================================================
// Tools Data
// ============================================================
const tools = [
  // PDF Tools
  { label: 'Fusionner PDF', category: 'PDF', icon: Merge, toolId: 'merge-pdf' },
  { label: 'Diviser PDF', category: 'PDF', icon: Split, toolId: 'split-pdf' },
  { label: 'Compresser PDF', category: 'PDF', icon: Archive, toolId: 'compress-pdf' },
  { label: 'Protéger PDF', category: 'PDF', icon: Lock, toolId: 'protect-pdf' },
  { label: 'Déprotéger PDF', category: 'PDF', icon: Unlock, toolId: 'unlock-pdf' },
  { label: 'Filigrane PDF', category: 'PDF', icon: PaintBucket, toolId: 'watermark-pdf' },
  // Image Tools
  { label: 'Compresser Image', category: 'Image', icon: Archive, toolId: 'compress-image' },
  { label: 'Redimensionner Image', category: 'Image', icon: Crop, toolId: 'resize-image' },
  { label: 'Rotation Image', category: 'Image', icon: RotateCw, toolId: 'rotate-image' },
  { label: 'Rogner Image', category: 'Image', icon: Scissors, toolId: 'crop-image' },
  // Video Tools
  { label: 'Compresser Vidéo', category: 'Vidéo', icon: Archive, toolId: 'compress-video' },
  { label: 'Couper Vidéo', category: 'Vidéo', icon: Scissors, toolId: 'trim-video' },
  // Audio Tools
  { label: 'Couper Audio', category: 'Audio', icon: Scissors, toolId: 'trim-audio' },
  { label: 'Ajuster Volume', category: 'Audio', icon: Volume2, toolId: 'adjust-volume' },
];

// ============================================================
// Navigation Items
// ============================================================
const navigationItems = [
  { label: 'Dashboard', view: 'dashboard' as AppView, icon: LayoutDashboard },
  { label: 'Convertir', view: 'convert' as AppView, icon: FileDown },
  { label: 'Outils', view: 'tools' as AppView, icon: Wrench },
  { label: 'Historique', view: 'history' as AppView, icon: Clock },
  { label: 'Paramètres', view: 'settings' as AppView, icon: Settings },
];

// ============================================================
// Category Labels
// ============================================================
const categoryLabels: Record<string, string> = {
  pdf: 'PDF',
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
  archive: 'Archive',
  ebook: 'E-book',
  developer: 'Développeur',
};

// ============================================================
// Command Palette Component
// ============================================================
export function CommandPalette() {
  const { theme, setTheme } = useTheme();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentView,
    setActiveCategory,
    setActiveTool,
    language,
    setLanguage,
    isAuthenticated,
  } = useAppStore();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    },
    [isCommandPaletteOpen, setCommandPaletteOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle conversion format selection
  const handleFormatSelect = (format: (typeof conversionFormats)[0]) => {
    const categoryMap: Record<string, 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'ebook' | 'developer'> = {
      pdf: 'pdf',
      image: 'image',
      video: 'video',
      audio: 'audio',
      archive: 'archive',
      ebook: 'ebook',
      developer: 'developer',
    };
    setActiveCategory(categoryMap[format.category] || 'pdf');
    setCurrentView('convert');
    setCommandPaletteOpen(false);
  };

  // Handle tool selection
  const handleToolSelect = (tool: (typeof tools)[0]) => {
    setActiveTool(tool.toolId);
    setCurrentView('tools');
    setCommandPaletteOpen(false);
  };

  // Handle navigation
  const handleNavigation = (view: AppView) => {
    setCurrentView(view);
    setCommandPaletteOpen(false);
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setCommandPaletteOpen(false);
  };

  // Handle language toggle
  const handleLanguageToggle = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
    setCommandPaletteOpen(false);
  };

  // Group conversion formats by category
  const formatsByCategory = conversionFormats.reduce(
    (acc, format) => {
      if (!acc[format.category]) acc[format.category] = [];
      acc[format.category].push(format);
      return acc;
    },
    {} as Record<string, typeof conversionFormats>
  );

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title="Commande Palette"
      description="Recherchez un outil, un format ou une action..."
    >
      <CommandInput placeholder="Rechercher un outil, format, ou action..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        {/* Navigation */}
        {isAuthenticated && (
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => handleNavigation(item.view)}
                className="cursor-pointer"
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Conversion Formats grouped by category */}
        {Object.entries(formatsByCategory).map(([category, formats]) => (
          <CommandGroup key={category} heading={`Conversions ${categoryLabels[category] || category}`}>
            {formats.map((format) => (
              <CommandItem
                key={`${format.input}-${format.output}`}
                onSelect={() => handleFormatSelect(format)}
                className="cursor-pointer"
              >
                <format.icon className="size-4" />
                <span>{format.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  .{format.input} → .{format.output}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* Tools grouped by category */}
        <CommandGroup heading="Outils">
          {tools.map((tool) => (
            <CommandItem
              key={tool.toolId}
              onSelect={() => handleToolSelect(tool)}
              className="cursor-pointer"
            >
              <tool.icon className="size-4" />
              <span>{tool.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{tool.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleThemeToggle} className="cursor-pointer">
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
          </CommandItem>
          <CommandItem onSelect={handleLanguageToggle} className="cursor-pointer">
            <Globe className="size-4" />
            <span>{language === 'fr' ? 'Switch to English' : 'Passer en Français'}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;

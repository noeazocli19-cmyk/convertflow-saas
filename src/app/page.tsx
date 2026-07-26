'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Components - Static imports (no recharts)
import LandingPage from '@/components/landing/landing-page';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CommandPalette } from '@/components/layout/command-palette';
import { AuthModal } from '@/components/auth/auth-modal';
import { ConverterUI } from '@/components/converter/converter-ui';
import { PDFTools } from '@/components/tools/pdf-tools';
import { ImageTools } from '@/components/tools/image-tools';
import { VideoTools } from '@/components/tools/video-tools';

// Components - Dynamic imports (contain recharts, need ssr: false)
const Dashboard = dynamic(() => import('@/components/dashboard/dashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 rounded-xl gradient-brand flex items-center justify-center animate-pulse">
        <Loader2 className="size-4 text-white animate-spin" />
      </div>
    </div>
  ),
});
const ConversionHistory = dynamic(() => import('@/components/dashboard/conversion-history'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 rounded-xl gradient-brand flex items-center justify-center animate-pulse">
        <Loader2 className="size-4 text-white animate-spin" />
      </div>
    </div>
  ),
});

// UI
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  FileText,
  Sparkles,
  Video,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import type { ToolCategory } from '@/types';

// ============================================================
// Tools View
// ============================================================
function ToolsView() {
  const { activeCategory, setActiveCategory } = useAppStore();
  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ToolCategory)}>
        <TabsList className="bg-muted/60 p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="pdf" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <FileText className="size-4" />
            <span className="hidden sm:inline">Outils PDF</span>
            <span className="sm:hidden">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Outils Image</span>
            <span className="sm:hidden">Image</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <Video className="size-4" />
            <span className="hidden sm:inline">Outils Vidéo</span>
            <span className="sm:hidden">Vidéo</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pdf" className="mt-6"><PDFTools /></TabsContent>
        <TabsContent value="image" className="mt-6"><ImageTools /></TabsContent>
        <TabsContent value="video" className="mt-6"><VideoTools /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Settings View
// ============================================================
function SettingsView() {
  const { language, setLanguage } = useAppStore();
  const { theme, setTheme } = useTheme();
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">Paramètres</h2>
        <p className="text-muted-foreground text-sm">Gérez vos préférences et la configuration de votre compte.</p>
      </div>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Apparence</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Thème</p>
            <p className="text-xs text-muted-foreground">Choisissez le thème de l&apos;interface</p>
          </div>
          <div className="flex gap-2">
            {[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }, { value: 'system', label: 'Système' }].map((t) => (
              <Button key={t.value} variant={theme === t.value ? 'default' : 'outline'} size="sm" onClick={() => setTheme(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Langue</p>
            <p className="text-xs text-muted-foreground">Langue de l&apos;interface</p>
          </div>
          <div className="flex gap-2">
            <Button variant={language === 'fr' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('fr')}>🇫🇷 Français</Button>
            <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>🇬🇧 English</Button>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Compte</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Plan actuel</p>
            <p className="text-xs text-muted-foreground">Gratuit - 100 MB de stockage</p>
          </div>
          <Button size="sm" className="gradient-brand text-white">Passer à Pro <ArrowRight className="size-3.5" /></Button>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6 space-y-4 border-destructive/20">
        <h3 className="font-semibold text-lg text-destructive">Zone dangereuse</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Supprimer le compte</p>
            <p className="text-xs text-muted-foreground">Cette action est irréversible</p>
          </div>
          <Button variant="destructive" size="sm">Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// App Shell
// ============================================================
function AppShell() {
  const { currentView, authModalOpen, setAuthModalOpen, authModalTab } = useAppStore();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-16">
        <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'convert' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Convertir vos fichiers</h2>
                <p className="text-muted-foreground text-sm">Importez vos fichiers, choisissez le format de sortie et lancez la conversion.</p>
              </div>
              <ConverterUI />
            </div>
          )}
          {currentView === 'tools' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Outils spécialisés</h2>
                <p className="text-muted-foreground text-sm">Des outils puissants pour manipuler vos fichiers PDF, images et vidéos.</p>
              </div>
              <ToolsView />
            </div>
          )}
          {currentView === 'history' && <ConversionHistory />}
          {currentView === 'settings' && <SettingsView />}
        </motion.div>
      </main>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultTab={authModalTab} />
      <CommandPalette />
    </div>
  );
}

// ============================================================
// Landing Layout
// ============================================================
function LandingLayout() {
  const { authModalOpen, setAuthModalOpen, authModalTab } = useAppStore();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1"><LandingPage /></div>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultTab={authModalTab} />
      <CommandPalette />
    </div>
  );
}

// ============================================================
// Loading Screen
// ============================================================
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-xl gradient-brand flex items-center justify-center animate-pulse-glow">
          <Loader2 className="size-6 text-white animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function Home() {
  const { currentView, isAuthenticated, isLoadingSession, checkSession } = useAppStore();
  useEffect(() => { checkSession(); }, [checkSession]);
  if (isLoadingSession) return <LoadingScreen />;
  if (isAuthenticated || ['dashboard', 'convert', 'history', 'settings', 'tools'].includes(currentView)) return <AppShell />;
  return <LandingLayout />;
}
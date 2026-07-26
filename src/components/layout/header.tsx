'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Sun,
  Moon,
  Menu,
  Search,
  Bell,
  LogOut,
  Settings,
  User,
  FileDown,
  Wrench,
  Clock,
  LayoutDashboard,
  Globe,
} from 'lucide-react';

// ============================================================
// useHasMounted Hook - avoids setting state in effect
// ============================================================
function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// ============================================================
// Logo Component
// ============================================================
function ConvertFlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <button
      onClick={() => {
        const store = useAppStore.getState();
        store.setCurrentView(store.isAuthenticated ? 'dashboard' : 'landing');
      }}
      className="flex items-center gap-2 group"
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl gradient-brand shadow-md group-hover:shadow-lg transition-shadow">
        <FileDown className="w-5 h-5 text-white" />
      </div>
      {!compact && (
        <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
          ConvertFlow
        </span>
      )}
    </button>
  );
}

// ============================================================
// Main Header Component
// ============================================================
export function Header() {
  const { theme, setTheme } = useTheme();
  const {
    currentView,
    setCurrentView,
    isAuthenticated,
    user,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    isMobileMenuOpen,
    setMobileMenuOpen,
    language,
    setLanguage,
    notifications,
    markNotificationRead,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);
  const mounted = useHasMounted();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================================================
  // Landing (Unauthenticated) Navigation
  // ============================================================
  const landingLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Outils', href: '#tools' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  // ============================================================
  // Authenticated Navigation
  // ============================================================
  const authLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as const },
    { label: 'Convertir', icon: FileDown, view: 'convert' as const },
    { label: 'Outils', icon: Wrench, view: 'tools' as const },
    { label: 'Historique', icon: Clock, view: 'history' as const },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-md' : 'glass'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <ConvertFlowLogo />

          {/* Desktop: Unauthenticated Navigation */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {landingLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop: Authenticated Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {authLinks.map((link) => (
                <Button
                  key={link.label}
                  variant={currentView === link.view ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(link.view)}
                  className="gap-2"
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Button>
              ))}
            </nav>
          )}

          {/* Desktop: Right Section */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search (Authenticated) */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="gap-2 text-muted-foreground"
              >
                <Search className="size-4" />
                <span className="text-xs">
                  {mounted && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  )}
                </span>
              </Button>
            )}

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="text-muted-foreground hover:text-foreground"
              aria-label={language === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              <Globe className="size-4" />
              <span className="sr-only">
                {language === 'fr' ? 'Switch to English' : 'Passer en français'}
              </span>
            </Button>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            )}

            {/* Notification Bell (Authenticated) */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px] gradient-brand border-0">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Aucune notification
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium text-sm">{notification.title}</span>
                            {!notification.read && (
                              <span className="ml-auto size-2 rounded-full bg-brand shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {notification.message}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Unauthenticated: Login & CTA */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useAppStore.getState().openAuthModal('login')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Se connecter
                </Button>
                <Button
                  size="sm"
                  className="gradient-brand text-white border-0 shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => useAppStore.getState().openAuthModal('register')}
                >
                  Commencer gratuitement
                </Button>
              </div>
            )}

            {/* Authenticated: User Dropdown */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Avatar className="size-8">
                      <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="gradient-brand text-white text-xs">
                        {user.name
                          ? user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('settings')} className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      Paramètres
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      useAppStore.getState().logout();
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile: Hamburger Menu */}
          <div className="md:hidden flex items-center gap-1">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandPaletteOpen(true)}
                className="text-muted-foreground"
              >
                <Search className="size-4" />
              </Button>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <ConvertFlowLogo compact />
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile: Unauthenticated */}
                {!isAuthenticated && (
                  <div className="flex flex-col p-4 gap-2">
                    {landingLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                      >
                        {link.label}
                      </a>
                    ))}
                    <div className="border-t my-2" />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        useAppStore.getState().openAuthModal('login');
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      Se connecter
                    </Button>
                    <Button
                      className="gradient-brand text-white border-0"
                      onClick={() => {
                        useAppStore.getState().openAuthModal('register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Commencer gratuitement
                    </Button>
                  </div>
                )}

                {/* Mobile: Authenticated */}
                {isAuthenticated && (
                  <div className="flex flex-col p-4 gap-1">
                    {/* User info */}
                    {user && (
                      <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-accent/50">
                        <Avatar className="size-10">
                          <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                          <AvatarFallback className="gradient-brand text-white text-sm">
                            {user.name
                              ? user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name || 'Utilisateur'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    )}

                    {authLinks.map((link) => (
                      <Button
                        key={link.label}
                        variant={currentView === link.view ? 'secondary' : 'ghost'}
                        className="justify-start gap-3"
                        onClick={() => {
                          setCurrentView(link.view);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Button>
                    ))}

                    <div className="border-t my-2" />

                    <Button
                      variant="ghost"
                      className="justify-start gap-3"
                      onClick={() => {
                        setCurrentView('settings');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="size-4" />
                      Paramètres
                    </Button>

                    <Button
                      variant="ghost"
                      className="justify-start gap-3 text-destructive hover:text-destructive"
                      onClick={() => {
                        useAppStore.getState().logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="size-4" />
                      Déconnexion
                    </Button>
                  </div>
                )}

                {/* Mobile: Bottom Controls */}
                <div className="mt-auto p-4 border-t flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                    className="gap-2 text-muted-foreground"
                  >
                    <Globe className="size-4" />
                    {language === 'fr' ? 'EN' : 'FR'}
                  </Button>
                  {mounted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="gap-2 text-muted-foreground"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="size-4" />
                          Clair
                        </>
                      ) : (
                        <>
                          <Moon className="size-4" />
                          Sombre
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

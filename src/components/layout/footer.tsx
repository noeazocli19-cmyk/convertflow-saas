'use client';

import { useAppStore } from '@/store/app-store';
import { useTheme } from 'next-themes';
import { FileDown, Twitter, Github, Linkedin, Youtube, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// ============================================================
// Footer Link Columns
// ============================================================
const footerColumns = [
  {
    title: 'Produit',
    links: [
      { label: 'Convertisseur', href: '#converter' },
      { label: 'Outils PDF', href: '#pdf-tools' },
      { label: 'Outils Image', href: '#image-tools' },
      { label: 'Outils Vidéo', href: '#video-tools' },
      { label: 'API', href: '#api' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Carrières', href: '#careers' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Support', href: '#support' },
      { label: 'Statut', href: '#status' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '#privacy' },
      { label: 'CGU', href: '#terms' },
      { label: 'Cookies', href: '#cookies' },
      { label: 'Mentions légales', href: '#legal' },
    ],
  },
];

// ============================================================
// Social Links
// ============================================================
const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/convertflow', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/convertflow', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/convertflow', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@convertflow', label: 'YouTube' },
];

// ============================================================
// Footer Component
// ============================================================
export function Footer() {
  const { language, setLanguage, isAuthenticated } = useAppStore();

  return (
    <footer className="mt-auto border-t bg-muted/30">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-brand shadow-md">
                <FileDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                ConvertFlow
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Convertissez, compressez et optimisez tous vos fichiers en quelques secondes. 
              Support de 200+ formats avec une qualité professionnelle.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/50 hover:bg-accent text-muted-foreground hover:text-brand transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} ConvertFlow.</span>
              <span>All rights reserved.</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="gap-2 text-muted-foreground hover:text-foreground h-7 text-xs"
              >
                <Globe className="size-3.5" />
                {language === 'fr' ? 'English' : 'Français'}
              </Button>

              {/* Made with love */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Made with</span>
                <Heart className="size-3 text-red-500 fill-red-500" />
                <span>by ConvertFlow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

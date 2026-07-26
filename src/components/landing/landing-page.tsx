'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Layers,
  Shield,
  Sparkles,
  Files,
  Award,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  BookOpen,
  Code2,
  Upload,
  Settings,
  Download,
  Star,
  ArrowRight,
  Check,
  Mail,
  ChevronRight,
  File,
  FileImage,
  FileAudio,
  FileVideo,
  FileArchive,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useAppStore } from '@/store/app-store';

// Register GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================
// Animated Counter Component
// ============================================================
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const motionValue = useMotionValue(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const unsubscribe = motionValue.on('change', (v) => setCount(Math.floor(v)));
    animate(motionValue, target, { duration: 2, ease: 'easeOut' });
    return () => unsubscribe();
  }, [isInView, target, motionValue]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================
// Section Wrapper with GSAP ScrollTrigger
// ============================================================
function SectionWrapper({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const el = sectionRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  );
}

// ============================================================
// Hero Floating Icons
// ============================================================
const floatingIcons = [
  { Icon: FileText, x: '10%', y: '20%', delay: 0, size: 28 },
  { Icon: Image, x: '85%', y: '15%', delay: 0.3, size: 32 },
  { Icon: Music, x: '75%', y: '70%', delay: 0.6, size: 26 },
  { Icon: Video, x: '15%', y: '75%', delay: 0.9, size: 30 },
  { Icon: Archive, x: '50%', y: '10%', delay: 1.2, size: 24 },
  { Icon: Code2, x: '90%', y: '45%', delay: 0.5, size: 26 },
  { Icon: FileImage, x: '5%', y: '50%', delay: 0.8, size: 22 },
  { Icon: BookOpen, x: '40%', y: '80%', delay: 1.0, size: 24 },
];

// ============================================================
// Features Data
// ============================================================
const features = [
  {
    icon: Zap,
    title: 'Conversion ultra-rapide',
    description: 'Convertissez vos fichiers en quelques secondes grâce à notre moteur de traitement optimisé et nos serveurs haute performance.',
  },
  {
    icon: Layers,
    title: '200+ formats supportés',
    description: 'Images, PDF, audio, vidéo, archives, eBooks et plus encore. Nous supportons tous les formats dont vous avez besoin.',
  },
  {
    icon: Shield,
    title: 'Sécurité maximale',
    description: 'Vos fichiers sont chiffrés de bout en bout et supprimés automatiquement après conversion. Votre vie privée est notre priorité.',
  },
  {
    icon: Sparkles,
    title: 'Interface intuitive',
    description: "Une interface moderne et simple d'utilisation. Glissez-déposez vos fichiers et laissez ConvertFlow faire le reste.",
  },
  {
    icon: Files,
    title: 'Traitement par lots',
    description: 'Convertissez plusieurs fichiers simultanément. Gagnez du temps avec notre traitement par lots intelligent.',
  },
  {
    icon: Award,
    title: 'Qualité préservée',
    description: 'Nos algorithmes avancés garantissent une qualité optimale lors de chaque conversion, sans perte de données.',
  },
];

// ============================================================
// Tool Categories Data
// ============================================================
const toolCategories = [
  { icon: Image, name: 'Convertisseur d\'images', count: 45, category: 'image' as const, color: 'from-pink-500 to-rose-500' },
  { icon: FileText, name: 'Convertisseur PDF', count: 38, category: 'pdf' as const, color: 'from-red-500 to-orange-500' },
  { icon: Music, name: 'Convertisseur audio', count: 32, category: 'audio' as const, color: 'from-green-500 to-emerald-500' },
  { icon: Video, name: 'Convertisseur vidéo', count: 28, category: 'video' as const, color: 'from-purple-500 to-violet-500' },
  { icon: Archive, name: 'Convertisseur d\'archives', count: 18, category: 'archive' as const, color: 'from-amber-500 to-yellow-500' },
  { icon: BookOpen, name: 'Convertisseur eBooks', count: 15, category: 'ebook' as const, color: 'from-teal-500 to-cyan-500' },
  { icon: Code2, name: 'Outils développeur', count: 24, category: 'developer' as const, color: 'from-sky-500 to-blue-500' },
];

// ============================================================
// Testimonials Data
// ============================================================
const testimonials = [
  {
    name: 'Marie Dupont',
    role: 'Designer Graphique',
    company: 'Studio Créatif',
    initials: 'MD',
    color: 'bg-pink-500',
    rating: 5,
    text: 'ConvertFlow a transformé mon flux de travail. Je convertis des dizaines d\'images par jour en un clin d\'œil. L\'interface est magnifique et le résultat toujours impeccable.',
  },
  {
    name: 'Thomas Laurent',
    role: 'Développeur Full-Stack',
    company: 'TechVision',
    initials: 'TL',
    color: 'bg-violet-500',
    rating: 5,
    text: 'Les outils développeur sont incroyables. Conversion de JSON, XML, CSV... tout fonctionne parfaitement. C\'est devenu un outil indispensable dans mon quotidien.',
  },
  {
    name: 'Sophie Martin',
    role: 'Chef de Projet',
    company: 'Digital Agency',
    initials: 'SM',
    color: 'bg-emerald-500',
    rating: 5,
    text: 'Le traitement par lots nous fait gagner des heures chaque semaine. La qualité des conversions PDF est la meilleure que j\'ai vue sur le marché.',
  },
  {
    name: 'Alexandre Chen',
    role: 'Monteur Vidéo',
    company: 'Prod Studio',
    initials: 'AC',
    color: 'bg-amber-500',
    rating: 5,
    text: 'Enfin un outil qui gère correctement la conversion vidéo sans perte de qualité. L\'upload est rapide et les formats supportés sont exhaustifs.',
  },
];

// ============================================================
// FAQ Data
// ============================================================
const faqItems = [
  {
    question: 'ConvertFlow est-il gratuit ?',
    answer: 'Oui ! ConvertFlow offre un plan gratuit généreux qui permet jusqu\'à 25 conversions par jour. Pour des besoins plus importants, nos plans Pro et Enterprise offrent des conversions illimitées, un traitement par lots avancé et un support prioritaire.',
  },
  {
    question: 'Mes fichiers sont-ils en sécurité ?',
    answer: 'Absolument. Nous utilisons un chiffrement SSL/TLS de bout en bout. Vos fichiers sont supprimés automatiquement de nos serveurs dans les 24 heures suivant la conversion. Nous ne partageons jamais vos données avec des tiers.',
  },
  {
    question: 'Quels formats de fichiers sont supportés ?',
    answer: 'ConvertFlow supporte plus de 200 formats de fichiers, incluant les images (PNG, JPG, WEBP, SVG, GIF...), les documents PDF, l\'audio (MP3, WAV, OGG, FLAC...), la vidéo (MP4, AVI, MOV, WEBM...), les archives (ZIP, RAR, 7Z...) et les eBooks (EPUB, MOBI...).',
  },
  {
    question: 'Quelle est la taille maximale des fichiers ?',
    answer: 'Le plan gratuit accepte des fichiers jusqu\'à 100 Mo. Les plans Pro et Enterprise permettent respectivement des fichiers jusqu\'à 2 Go et 10 Go. Le traitement par lots est disponible pour tous les plans.',
  },
  {
    question: 'Puis-je utiliser ConvertFlow pour mon entreprise ?',
    answer: 'Bien sûr ! Notre plan Enterprise est conçu pour les équipes et les entreprises. Il inclut un API dédiée, une gestion des utilisateurs, des conversions prioritaires, un SLA garanti et un support technique 24/7.',
  },
  {
    question: 'Comment fonctionne le traitement par lots ?',
    answer: 'Le traitement par lots vous permet de convertir plusieurs fichiers simultanément. Glissez-déposez simplement vos fichiers, choisissez le format de sortie, et ConvertFlow s\'occupe du reste. Vous pouvez convertir jusqu\'à 50 fichiers à la fois avec le plan Pro.',
  },
];

// ============================================================
// Main Landing Page Component
// ============================================================
export default function LandingPage() {
  const { setCurrentView, setActiveCategory } = useAppStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // GSAP Parallax for hero
  useEffect(() => {
    if (!heroRef.current) return;
    const heroEl = heroRef.current;
    gsap.to(heroEl.querySelectorAll('.parallax-element'), {
      y: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === heroEl) st.kill();
      });
    };
  }, []);

  const handleToolClick = (category: string) => {
    setActiveCategory(category as 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'ebook' | 'developer');
    setCurrentView('convert');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden gradient-hero grid-pattern"
      >
        {/* Floating animated icons */}
        {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            className="parallax-element absolute pointer-events-none text-primary/10"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -15, 0],
            }}
            transition={{
              opacity: { duration: 0.5, delay },
              scale: { duration: 0.5, delay },
              y: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Icon size={size} />
          </motion.div>
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl parallax-element" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl parallax-element" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-32 sm:pb-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="size-3.5 mr-1.5" />
                Nouveau : Conversion par lots disponible
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              Convertissez, compressez et{' '}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                optimisez
              </span>{' '}
              tous vos fichiers en quelques secondes
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              ConvertFlow est la plateforme tout-en-un pour convertir vos fichiers en toute simplicité.
              Rapide, sécurisé et gratuit pour les conversions de base.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <Button
                size="lg"
                className="gradient-brand text-white h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                onClick={() => setCurrentView('convert')}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium"
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Voir les outils
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="size-4 text-green-500" />
                <span>Chiffrement SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="size-4 text-amber-500" />
                <span>Conversion rapide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-4 text-primary" />
                <span>Aucune inscription requise</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les fonctionnalités qui font de ConvertFlow la meilleure plateforme de conversion de fichiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card h-full rounded-2xl border-0 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <CardContent className="p-6 pt-6">
                    <div className="size-12 rounded-xl gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="size-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* ALL TOOLS SECTION */}
      {/* ============================================================ */}
      <SectionWrapper id="tools" className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Nos outils</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Tous vos outils de conversion
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explorez notre gamme complète d'outils organisés par catégorie pour trouver exactement ce dont vous avez besoin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {toolCategories.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  className="glass-card rounded-2xl border-0 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleToolClick(tool.category)}
                >
                  <CardContent className="p-5 pt-5 flex items-start gap-4">
                    <div className={`size-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className="size-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">
                        {tool.name}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">
                        {tool.count} formats
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 ml-auto shrink-0 mt-1" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Comment ça marche</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Simple comme 1-2-3
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Convertissez vos fichiers en seulement trois étapes simples.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: 1,
                  icon: Upload,
                  title: 'Téléchargez votre fichier',
                  description: 'Glissez-déposez ou sélectionnez le fichier que vous souhaitez convertir. Nous supportons plus de 200 formats.',
                },
                {
                  step: 2,
                  icon: Settings,
                  title: 'Choisissez le format',
                  description: 'Sélectionnez le format de sortie souhaité parmi notre liste complète. Ajustez les paramètres si nécessaire.',
                },
                {
                  step: 3,
                  icon: Download,
                  title: 'Téléchargez le résultat',
                  description: 'Votre fichier converti est prêt en quelques secondes. Téléchargez-le directement ou partagez-le.',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="relative inline-flex mb-6">
                    <div className="size-20 rounded-full gradient-brand flex items-center justify-center shadow-lg shadow-primary/25 relative z-10">
                      <item.icon className="size-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 size-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-20">
                      <span className="text-xs font-bold text-primary">{item.step}</span>
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* WHY CHOOSE CONVERTFLOW SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pourquoi ConvertFlow</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Le meilleur choix pour vos conversions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Comparez et voyez pourquoi des milliers d'utilisateurs choisissent ConvertFlow.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Comparison cards */}
              {[
                {
                  competitor: 'CloudConvert',
                  highlight: 'Plus rapide',
                  stat: '3x',
                  statLabel: 'plus rapide',
                  description: 'Notre moteur de conversion optimisé offre des vitesses jusqu\'à 3 fois supérieures à CloudConvert, sans compromettre la qualité.',
                  advantages: ['Conversion simultanée', 'Interface moderne', 'Pas de file d\'attente'],
                },
                {
                  competitor: 'TinyWow',
                  highlight: 'Plus moderne',
                  stat: '200+',
                  statLabel: 'formats supportés',
                  description: 'Contrairement à TinyWow, ConvertFlow offre une interface moderne, un support complet et des mises à jour régulières.',
                  advantages: ['Design premium', 'API complète', 'Support réactif'],
                },
                {
                  competitor: 'iLovePDF',
                  highlight: 'Plus complet',
                  stat: '7',
                  statLabel: 'catégories d\'outils',
                  description: 'iLovePDF se limite aux PDF. ConvertFlow couvre les images, audio, vidéo, archives, eBooks et outils développeur.',
                  advantages: ['Multi-format', 'Tout-en-un', 'Traitement par lots'],
                },
                {
                  competitor: 'Autres solutions',
                  highlight: 'Gratuit',
                  stat: '25',
                  statLabel: 'conversions/jour gratuites',
                  description: 'Contrairement à beaucoup d\'outils qui limitent drastiquement leur version gratuite, ConvertFlow offre 25 conversions quotidiennes gratuites.',
                  advantages: ['Sans inscription', 'Aucune limite de taille', 'Qualité maximale'],
                },
              ].map((item, index) => (
                <motion.div
                  key={item.competitor}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="glass-card rounded-2xl border-0 h-full hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300">
                    <CardContent className="p-6 pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="gradient-brand text-white border-0">{item.highlight}</Badge>
                        <span className="text-sm text-muted-foreground">vs {item.competitor}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-primary">{item.stat}</span>
                        <span className="text-sm text-muted-foreground">{item.statLabel}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <ul className="space-y-2">
                        {item.advantages.map((adv) => (
                          <li key={adv} className="flex items-center gap-2 text-sm">
                            <Check className="size-4 text-green-500 shrink-0" />
                            <span className="text-foreground">{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* STATISTICS SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 sm:p-12 lg:p-16">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Des chiffres qui parlent
                </h2>
                <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto">
                  Rejoignez notre communauté d'utilisateurs satisfaits à travers le monde.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { value: 2, suffix: 'M+', label: 'Conversions réalisées', prefix: '' },
                  { value: 200, suffix: '+', label: 'Formats supportés', prefix: '' },
                  { value: 99, suffix: '.9%', label: 'Disponibilité', prefix: '' },
                  { value: 150, suffix: 'K+', label: 'Utilisateurs actifs', prefix: '' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                    </div>
                    <p className="text-blue-100 text-sm sm:text-base">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Témoignages</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ce que nos utilisateurs disent
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez pourquoi des milliers d'utilisateurs font confiance à ConvertFlow.
            </p>
          </div>

          {/* Desktop: Carousel, Mobile: stacked cards */}
          <div className="hidden md:block max-w-5xl mx-auto">
            <Carousel
              opts={{ align: 'start', loop: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/2">
                    <Card className="glass-card rounded-2xl border-0 h-full">
                      <CardContent className="p-6 pt-6">
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {/* Quote */}
                        <p className="text-foreground text-sm leading-relaxed mb-6">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>
                        {/* Author */}
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}>
                            {testimonial.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                            <p className="text-muted-foreground text-xs">{testimonial.role}, {testimonial.company}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-2rem]" />
              <CarouselNext className="right-[-2rem]" />
            </Carousel>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="glass-card rounded-2xl border-0">
                  <CardContent className="p-6 pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed mb-6">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                        <p className="text-muted-foreground text-xs">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* FAQ SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Trouvez les réponses aux questions les plus courantes.
            </p>
          </div>

          <Card className="glass-card rounded-2xl border-0">
            <CardContent className="p-6 pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-foreground font-medium hover:text-primary transition-colors">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* NEWSLETTER SECTION */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-card rounded-3xl border-0 max-w-2xl mx-auto overflow-hidden relative">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 gradient-brand" />

            <CardContent className="p-8 sm:p-12 pt-8 sm:pt-12 text-center">
              <div className="size-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6">
                <Mail className="size-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Restez informé des dernières mises à jour
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Inscrivez-vous à notre newsletter pour recevoir les nouveautés, astuces et offres exclusives.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-green-600 font-medium"
                >
                  <Check className="size-5" />
                  <span>Merci pour votre inscription !</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-11 bg-background/50 border-border/50 focus:border-primary"
                  />
                  <Button
                    type="submit"
                    className="gradient-brand text-white h-11 px-6 font-medium shadow-lg shadow-primary/25"
                  >
                    S'inscrire
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </form>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Pas de spam. Désinscription en un clic.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* ============================================================ */}
      {/* BOTTOM CTA */}
      {/* ============================================================ */}
      <SectionWrapper className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Prêt à convertir vos fichiers ?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Rejoignez plus de 150 000 utilisateurs qui font confiance à ConvertFlow pour leurs conversions quotidiennes.
            </p>
            <Button
              size="lg"
              className="gradient-brand text-white h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all"
              onClick={() => setCurrentView('convert')}
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}

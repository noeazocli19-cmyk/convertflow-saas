'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
  Loader2,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: AuthTab;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Faible', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
  return { score, label: 'Fort', color: 'bg-emerald-500' };
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync tab when defaultTab changes (e.g. when switching from login to register)
  useEffect(() => {
    setActiveTab(defaultTab);
    setError('');
  }, [defaultTab]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setError('');
    }
  }, [open]);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { setUser, setCurrentView } = useAppStore();

  const passwordStrength = getPasswordStrength(registerPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      setUser(data.user);
      setCurrentView('dashboard');
      onOpenChange(false);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptTerms) {
      setError('Veuillez accepter les conditions');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur d'inscription");
        return;
      }

      setUser(data.user);
      setCurrentView('dashboard');
      onOpenChange(false);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail) {
      setError('Veuillez entrer votre email');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setForgotSent(true);
    setIsLoading(false);
  };

  const resetForm = () => {
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
    setAcceptTerms(false);
    setForgotEmail('');
    setForgotSent(false);
  };

  const switchTab = (tab: AuthTab) => {
    resetForm();
    setActiveTab(tab);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden glass-card border-0">
        <div className="absolute inset-0 gradient-brand opacity-5 pointer-events-none" />
        <div className="relative z-10 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                ConvertFlow
              </span>
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {activeTab === 'login' && 'Connectez-vous à votre compte'}
              {activeTab === 'register' && 'Créez votre compte gratuitement'}
              {activeTab === 'forgot' && 'Réinitialisez votre mot de passe'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {/* LOGIN TAB */}
            {activeTab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                    <X className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <button
                      type="button"
                      onClick={() => switchTab('forgot')}
                      className="text-xs text-brand hover:text-brand-dark transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-brand text-white hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continuer avec
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {}}
                  >
                    <Chrome className="size-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {}}
                  >
                    <Github className="size-4" />
                    GitHub
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className="text-brand font-medium hover:text-brand-dark transition-colors"
                  >
                    Inscrivez-vous
                  </button>
                </p>
              </motion.form>
            )}

            {/* REGISTER TAB */}
            {activeTab === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                    <X className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-name">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {registerPassword && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= passwordStrength.score
                                ? passwordStrength.color
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Force :{' '}
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {passwordStrength.label}
                        </Badge>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== registerPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="size-3" />
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                  {confirmPassword && confirmPassword === registerPassword && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <Check className="size-3" />
                      Les mots de passe correspondent
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    J&apos;accepte les{' '}
                    <span className="text-brand hover:text-brand-dark cursor-pointer">
                      conditions d&apos;utilisation
                    </span>{' '}
                    et la{' '}
                    <span className="text-brand hover:text-brand-dark cursor-pointer">
                      politique de confidentialité
                    </span>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-brand text-white hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Créer un compte
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-brand font-medium hover:text-brand-dark transition-colors"
                  >
                    Connectez-vous
                  </button>
                </p>
              </motion.form>
            )}

            {/* FORGOT PASSWORD TAB */}
            {activeTab === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                {!forgotSent ? (
                  <>
                    {error && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                        <X className="size-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Entrez votre adresse email et nous vous enverrons un lien pour
                      réinitialiser votre mot de passe.
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="vous@exemple.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-brand text-white hover:opacity-90 transition-opacity"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          Envoyer le lien
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="mx-auto size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="size-8 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-lg">Email envoyé !</h3>
                    <p className="text-sm text-muted-foreground">
                      Vérifiez votre boîte de réception et suivez les instructions
                      pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="flex items-center gap-1 text-sm text-brand hover:text-brand-dark transition-colors mx-auto"
                >
                  <ArrowLeft className="size-3" />
                  Retour à la connexion
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

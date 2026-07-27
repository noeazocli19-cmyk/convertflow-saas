import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
 import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConvertFlow - Convertissez, compressez et optimisez tous vos fichiers",
  description:
    "Convertissez, compressez et optimisez tous vos fichiers en quelques secondes. Support de 200+ formats : images, documents, audio, vidéo, archives et plus.",
  keywords: [
    "conversion fichiers",
    "convertir PDF",
    "convertir image",
    "compresser",
    "optimiser",
    "CloudConvert",
    "iLovePDF",
    "ConvertFlow",
  ],
  authors: [{ name: "ConvertFlow" }],
  icons: {
    icon: "/image.png",
  },
  openGraph: {
    title: "ConvertFlow - Convertissez tous vos fichiers",
    description:
      "Convertissez, compressez et optimisez tous vos fichiers en quelques secondes.",
    siteName: "ConvertFlow",
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertFlow - Convertissez tous vos fichiers",
    description:
      "Convertissez, compressez et optimisez tous vos fichiers en quelques secondes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

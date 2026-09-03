import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/shared/QueryProvider";
import "../styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PromptOptimizer — Optimiza tus Prompts con IA",
    template: "%s | PromptOptimizer",
  },
  description:
    "Transforma tus ideas en prompts estructurados y de alta calidad para cualquier herramienta de IA.",
  keywords: [
    "prompts",
    "inteligencia artificial",
    "prompt engineering",
    "ChatGPT",
    "Claude",
    "Gemini",
  ],
  authors: [{ name: "PromptOptimizer" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "PromptOptimizer",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${dmSans.variable} ${syne.variable} dark`}
        suppressHydrationWarning
      >
        <body
          className="min-h-screen bg-background font-sans antialiased"
          suppressHydrationWarning
        >
          <div id="clerk-captcha" />
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(255 16% 8%)",
                  border: "1px solid hsl(255 10% 16%)",
                  color: "hsl(0 0% 96%)",
                },
              }}
            />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

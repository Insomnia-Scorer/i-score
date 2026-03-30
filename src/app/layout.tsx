// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
/**
 * 💡 究極のルートレイアウト (背景一任版)
 * 1. 修正: body タグから `bg-background` クラスを削除。
 * これにより、globals.css で定義した background-image と完全に同期します。
 */
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "i-Score | Baseball Tactical Hub",
  description: "Next-gen baseball scoring and analytics platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          // 💡 ここにあった bg-background を削除し、CSSに完全に委ねます
          "min-h-screen font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: "rounded-2xl border-border bg-background/80 backdrop-blur-md font-bold shadow-none",
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

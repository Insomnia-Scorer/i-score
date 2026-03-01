// src/app/layout.tsx
import * as React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// 💡 ズームの禁止（ダブルタップで拡大されるのを防ぐ）とテーマカラーの設定
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#09090b" },
	],
};

// 💡 PWA（ホーム画面に追加）用の設定を追記
export const metadata: Metadata = {
	title: "i-Score",
	description: "次世代野球スコア記録アプリ",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "i-Score",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			{/* 💡 ページ読み込み時の「色のチラつき(FOUC)」を完璧に防ぐ魔法のスクリプト */}
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							try {
								var theme = localStorage.getItem('i-score-color-theme');
								if (theme && theme !== 'default') {
									document.documentElement.classList.add(theme);
								}
							} catch (e) {}
						`,
					}}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange>
					<Header />
					<main className="flex-1 flex flex-col">
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
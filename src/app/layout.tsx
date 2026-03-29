import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
/**
 * 💡 究極のルートレイアウト
 * 1. 重要: globals.css をインポートすることで Tailwind CSS を有効化。
 * 2. 意匠: フォントを "Inter" に統一し、アンチエイリアス (antialiased) を適用。
 * 3. 構造: <html> および <body> タグを定義。背景色を bg-background で初期化。
 * 4. 応答性: Viewport 設定によりモバイル端末での拡大縮小挙動を最適化。
 */
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner"; // 通知ライブラリ

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "i-Score | Baseball Tactical Hub",
	description: "Next-gen baseball scoring and analytics platform.",
	manifest: "/manifest.json",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#000000",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head>
				{/* モバイルウェブアプリとしての挙動を最適化 */}
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
			</head>
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased selection:bg-primary/20",
					inter.variable
				)}
			>
				{/* 全画面共通の通知コンポーネント (影なしデザインに同期) */}
				<Toaster
					position="top-center"
					toastOptions={{
						className: "rounded-2xl border-border bg-background/80 backdrop-blur-md font-bold shadow-none",
					}}
				/>

				{/* メインコンテンツ */}
				{children}
			</body>
		</html>
	);
}
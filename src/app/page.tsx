"use client";
// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Users, BarChart3, ChevronRight } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-slate-950 text-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                            野球の「今」を、<br />
                            <span className="text-primary italic">次世代</span>の形に。
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            i-Score は、直感的な操作で野球のスコアを記録・分析できる最新のプラットフォームです。草野球から本格的なリーグまで、あらゆる試合をデータ化。
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full" asChild>
                                <Link href="/signup">
                                    今すぐ始める <ChevronRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full bg-transparent border-slate-700 text-white hover:bg-slate-900" asChild>
                                <Link href="/login">ログイン</Link>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
            </section>

            {/* Features Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                <Trophy className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">リアルタイム記録</h3>
                            <p className="text-muted-foreground">スマホ一台で、一球一打をプロ級の精度で記録。直感的なインターフェースで迷いません。</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">詳細なデータ分析</h3>
                            <p className="text-muted-foreground">打率、防御率はもちろん、打球方向やカウント別の傾向も自動で視覚化します。</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold">チームで共有</h3>
                            <p className="text-muted-foreground">チームメイトとリアルタイムでデータを同期。試合の振り返りもスムーズに行えます。</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

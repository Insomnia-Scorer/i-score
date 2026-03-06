// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Edit2, Trash2, ChevronLeft, Shield } from "lucide-react";

// 💡 選手の型定義
interface Player {
    id: string;
    name: string;
    uniformNumber: string;
    position: string;
    batsThrows: string;
}

export default function RosterPage() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [teamName, setTeamName] = useState("チーム");

    // 💡 ひとまずダミーデータで美しいUIを確認できるようにしています！
    // 実際のAPIが繋がるまでの「お試し表示用」です
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setPlayers([
                { id: "1", name: "大谷 翔平", uniformNumber: "17", position: "投手 / 指名打者", batsThrows: "右投左打" },
                { id: "2", name: "山本 由伸", uniformNumber: "18", position: "投手", batsThrows: "右投右打" },
                { id: "3", name: "ダルビッシュ 有", uniformNumber: "11", position: "投手", batsThrows: "右投右打" },
                { id: "4", name: "村上 宗隆", uniformNumber: "55", position: "内野手", batsThrows: "右投左打" },
            ]);
            setIsLoading(false);
        }, 800); // スケルトンローディングを見せるための意図的な遅延
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            {/* ヘッダー部分 */}
            <div className="bg-muted/30 border-b border-border/50 sticky top-0 z-20 backdrop-blur-xl">
                <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-9 w-9 rounded-full hover:bg-muted">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" /> 選手名簿 (ロースター)
                            </h1>
                        </div>
                    </div>
                    <Button size="sm" className="font-bold rounded-full shadow-sm">
                        <Plus className="h-4 w-4 mr-1" /> 追加
                    </Button>
                </div>
            </div>

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
                
                {isLoading ? (
                    // 💡 スケルトンローディング（待ち時間をゼロに感じさせる魔法）
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-2xl w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {players.map((player) => (
                            // 🎴 ここが究極の「プロ野球カード」UIです！
                            <Card 
                                key={player.id} 
                                className="relative overflow-hidden group border-border/60 bg-gradient-to-br from-background via-background to-muted/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer rounded-2xl"
                            >
                                {/* 💡 背景の巨大な背番号（透かし効果） */}
                                <div className="absolute -bottom-8 -right-4 text-[130px] font-black italic text-foreground/5 group-hover:text-primary/10 transition-colors select-none z-0 tracking-tighter leading-none">
                                    {player.uniformNumber}
                                </div>
                                
                                {/* 💡 カード左側のアクセントライン */}
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors z-10" />

                                <CardContent className="p-6 relative z-10 flex flex-col h-full pl-8">
                                    <div className="flex justify-between items-start mb-4">
                                        {/* 左上の丸い背番号バッジ */}
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                                            {player.uniformNumber}
                                        </div>
                                        {/* 右上のポジションバッジ */}
                                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-muted text-muted-foreground tracking-widest border border-border/50 shadow-sm">
                                            {player.position}
                                        </span>
                                    </div>
                                    
                                    {/* 選手名と投打 */}
                                    <h3 className="text-2xl font-black tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                                        {player.name}
                                    </h3>
                                    <p className="text-sm font-bold text-muted-foreground/80 mb-4">
                                        {player.batsThrows}
                                    </p>

                                    {/* ホバー時のみ現れる編集・削除ボタン */}
                                    <div className="mt-auto pt-4 border-t border-border/30 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

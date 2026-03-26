"use client";

import { useState } from "react";
// 💡 エラー修正: プロジェクト標準のエイリアスパス (@/) を使用してインポートを確実に解決
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Circle,
    X,
    RotateCcw,
    UserCog,
    ChevronRight,
    History,
    AlertCircle,
    Loader2
} from "lucide-react";
import { FieldModal } from "./FieldModal";
import { SubstitutionModal } from "./SubstitutionModal";
import { toast } from "sonner";

/**
 * ⚾️ コントロールパネル・コンポーネント
 * 投球（ボール・ストライク）や交代、インプレイの判定を行います。
 * 型安全プロトコルに基づき、Contextからのデータを安全に取り扱います。
 */
export function ControlPanel() {
    // ScoreContext からステートと操作メソッドを取得
    const { state, recordPitch, recordInPlay, changeInning, isLoading } = useScore();

    // モーダルと処理状態の管理
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 💡 1球ごとの処理（投球）
    const handlePitch = async (type: "ball" | "strike" | "foul" | "swinging_strike") => {
        if (!state.batterId || !state.pitcherId) {
            toast.error("打者と投手を選択してください");
            setIsSubModalOpen(true);
            return;
        }

        setIsProcessing(true);
        try {
            await recordPitch(type);
        } catch (error) {
            console.error("Pitch recording failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // 💡 イニング終了（チェンジ）処理
    const handleInningChange = () => {
        // 3アウトに達していない場合の確認
        if (state.outs < 3) {
            if (!window.confirm("3アウトになっていませんが、チェンジ（攻守交代）しますか？")) {
                return;
            }
        }
        changeInning();
    };

    return (
        <div className="space-y-4">
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. メイン投球操作エリア（特大ボタン）
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* ストライクボタン */}
                <Button
                    onClick={() => handlePitch("strike")}
                    disabled={isProcessing || isLoading}
                    className="h-24 sm:h-32 rounded-[32px] flex flex-col gap-2 bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                >
                    <X className="h-8 w-8" strokeWidth={3} />
                    <span className="text-xl font-black italic">STRIKE</span>
                </Button>

                {/* ボールボタン */}
                <Button
                    onClick={() => handlePitch("ball")}
                    disabled={isProcessing || isLoading}
                    className="h-24 sm:h-32 rounded-[32px] flex flex-col gap-2 bg-green-500 hover:bg-green-600 text-black shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                    <Circle className="h-8 w-8" strokeWidth={3} />
                    <span className="text-xl font-black italic">BALL</span>
                </Button>

                {/* ファウルボタン */}
                <Button
                    onClick={() => handlePitch("foul")}
                    disabled={isProcessing || isLoading}
                    variant="outline"
                    className="h-24 sm:h-32 rounded-[32px] flex flex-col gap-2 border-zinc-300 dark:border-zinc-800 font-black text-xl transition-all active:scale-95 bg-card"
                >
                    <RotateCcw className="h-8 w-8 text-zinc-400" />
                    FOUL
                </Button>

                {/* インプレイ（打球発生）ボタン */}
                <Button
                    onClick={() => setIsFieldModalOpen(true)}
                    disabled={isProcessing || isLoading}
                    className="h-24 sm:h-32 rounded-[32px] flex flex-col gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    <ChevronRight className="h-8 w-8" strokeWidth={3} />
                    <span className="text-xl font-black italic underline decoration-2">IN PLAY</span>
                </Button>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. サブアクション（選手交代・チェンジ）
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="rounded-[24px] border-zinc-200 dark:border-zinc-800 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-2 flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSubModalOpen(true)}
                            className="flex-1 h-14 rounded-[18px] font-black gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            <UserCog className="h-5 w-5" /> 選手交代
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleInningChange}
                            className="flex-1 h-14 rounded-[18px] font-black gap-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                            <History className="h-5 w-5" /> チェンジ
                        </Button>
                    </CardContent>
                </Card>

                {/* 💡 現在の打席状況ミニ表示 */}
                <div className="flex items-center gap-3 px-5 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Batter</p>
                        <p className="font-black text-sm truncate text-foreground">
                            {state.batterId ? `ID: ${state.batterId.substring(0, 8)}` : "未選択"}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1 text-right">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pitch Count</p>
                        <p className="font-black text-sm text-foreground">
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin ml-auto" /> : `${state.pitchCount} 球`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. 各種モーダル（結果入力・メンバー変更）
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 💡 エラー修正: 
          1. プロパティ名を定義に合わせて 'open' と 'onOpenChange' に修正
          2. コールバック引数の型を明示的に指定
      */}
            <FieldModal
                open={isFieldModalOpen}
                onOpenChange={setIsFieldModalOpen}
                onResult={(result: string, rbi: number, advances: any[]) => {
                    recordInPlay(result, rbi, advances);
                    setIsFieldModalOpen(false);
                    toast.success(`打席結果: ${result} を記録しました`);
                }}
            />

            <SubstitutionModal
                open={isSubModalOpen}
                onOpenChange={setIsSubModalOpen}
            />

            {/* 💡 バッター未選択時の警告表示 */}
            {!state.batterId && !isLoading && (
                <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-xs font-black leading-tight">
                        次のバッターが設定されていません。「選手交代」から選択してください。
                    </p>
                </div>
            )}
        </div>
    );
}
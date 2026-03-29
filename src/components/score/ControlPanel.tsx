// src/components/score/ControlPanel.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScore } from "@/contexts/ScoreContext";
/**
 * 💡 究極の操作パネル・コンポーネント
 * 1. 意匠: カプセル型 (rounded-full) のボタンを主軸に、触り心地の良さを追求。
 * 2. 整理: メインアクション（BSO）を上段に、補助アクション（交代・終了）を下段に配置。
 * 3. 規則: 影なし。border-border/40。透過背景の活用。
 */
import { Button } from "@/components/ui/button";
import {
  Circle,
  X,
  RotateCcw,
  UserCog,
  History,
  Flag,
  ChevronRight,
  Loader2
} from "lucide-react";
import { FieldModal } from "./FieldModal";
import { SubstitutionModal } from "./SubstitutionModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const router = useRouter();
  const { state, recordPitch, recordInPlay, changeInning, isLoading, finishMatch } = useScore();

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePitch = async (type: "ball" | "strike" | "foul" | "swinging_strike") => {
    if (!state.batterId || !state.pitcherId) {
      toast.error("打者と投手を選択してください");
      setIsSubModalOpen(true);
      return;
    }
    setIsProcessing(true);
    try { await recordPitch(type); } finally { setIsProcessing(false); }
  };

  return (
    <div className="space-y-6">

      {/* メイン投球ボタン: 直感的な2x2グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          onClick={() => handlePitch("strike")}
          disabled={isProcessing}
          className="h-28 rounded-[40px] bg-yellow-500 hover:bg-yellow-600 text-black border-none shadow-none flex flex-col gap-2 transition-all active:scale-95"
        >
          <X className="h-8 w-8 stroke-[3.5px]" />
          <span className="text-lg font-black italic tracking-tighter">STRIKE</span>
        </Button>
        <Button
          onClick={() => handlePitch("ball")}
          disabled={isProcessing}
          className="h-28 rounded-[40px] bg-green-500 hover:bg-green-600 text-black border-none shadow-none flex flex-col gap-2 transition-all active:scale-95"
        >
          <Circle className="h-8 w-8 stroke-[3.5px]" />
          <span className="text-lg font-black italic tracking-tighter">BALL</span>
        </Button>
        <Button
          onClick={() => handlePitch("foul")}
          variant="outline"
          className="h-28 rounded-[40px] border-border/60 bg-muted/20 hover:bg-muted/40 text-foreground shadow-none flex flex-col gap-2 transition-all active:scale-95"
        >
          <RotateCcw className="h-8 w-8 opacity-40" />
          <span className="text-lg font-black italic tracking-tighter">FOUL</span>
        </Button>
        <Button
          onClick={() => setIsFieldModalOpen(true)}
          className="h-28 rounded-[40px] bg-primary text-primary-foreground border-none shadow-none flex flex-col gap-2 transition-all active:scale-95 ring-4 ring-primary/10"
        >
          <ChevronRight className="h-8 w-8 stroke-[3.5px]" />
          <span className="text-lg font-black italic tracking-tighter">IN PLAY</span>
        </Button>
      </div>

      {/* 補助アクション: 整理整頓されたカプセル型メニュー */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setIsSubModalOpen(true)}
          className="flex-1 h-14 rounded-full border-border/40 bg-card/40 backdrop-blur-md font-black gap-2 hover:bg-muted/50"
        >
          <UserCog className="h-5 w-5 text-primary" /> 選手交代
        </Button>
        <Button
          variant="outline"
          onClick={() => changeInning()}
          className="flex-1 h-14 rounded-full border-border/40 bg-card/40 backdrop-blur-md font-black gap-2 hover:bg-muted/50"
        >
          <History className="h-5 w-5 text-primary" /> チェンジ
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (window.confirm("試合を終了しますか？")) {
              await finishMatch();
              router.push(`/matches/result?id=${state.matchId}`);
            }
          }}
          className="flex-1 h-14 rounded-full border-red-500/20 bg-red-500/5 text-red-500 font-black gap-2 hover:bg-red-500 hover:text-white transition-all"
        >
          <Flag className="h-5 w-5" /> 試合終了
        </Button>
      </div>

      {/* 選手・投球数インテルカード */}
      <div className="flex items-center gap-4 p-5 rounded-[40px] bg-muted/10 border border-border/20 backdrop-blur-sm">
        <div className="flex-1">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Current Batter</p>
          <p className="font-black text-lg italic text-foreground px-2 truncate leading-tight">
            {state.batterId ? `ID: ${state.batterId.substring(0, 8)}` : "SELECT PLAYER"}
          </p>
        </div>
        <div className="h-10 w-px bg-border/20" />
        <div className="text-right">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2">Pitch Count</p>
          <p className="font-black text-2xl italic text-primary tabular-nums px-2">
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin ml-auto" /> : state.pitchCount}
          </p>
        </div>
      </div>

      {/* モーダル群 */}
      <FieldModal
        open={isFieldModalOpen}
        onOpenChange={setIsFieldModalOpen}
        onResult={(result, rbi, advances) => {
          recordInPlay(result, rbi, advances);
          setIsFieldModalOpen(false);
          toast.success("プレイを記録しました");
        }}
      />
      <SubstitutionModal open={isSubModalOpen} onOpenChange={setIsSubModalOpen} />
    </div>
  );
}
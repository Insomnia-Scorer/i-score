// src/components/score/FieldModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// 💡 型安全プロトコル: インターフェースを最新のスコアリング仕様に更新
export interface FieldModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // 💡 onSelect から onResult に変更し、引数を拡張
    onResult: (result: string, rbi: number, advances: any[]) => void;
}

export function FieldModal({ open, onOpenChange, onResult }: FieldModalProps) {
    const [selectedPos, setSelectedPos] = useState<string | null>(null);
    const [rbi, setRbi] = useState(0);

    const positions = [
        { id: "1", label: "投", color: "bg-zinc-500" },
        { id: "2", label: "捕", color: "bg-zinc-500" },
        { id: "3", label: "一", color: "bg-orange-500" },
        { id: "4", label: "二", color: "bg-orange-500" },
        { id: "5", label: "三", color: "bg-orange-500" },
        { id: "6", label: "遊", color: "bg-orange-500" },
        { id: "7", label: "左", color: "bg-emerald-500" },
        { id: "8", label: "中", color: "bg-emerald-500" },
        { id: "9", label: "右", color: "bg-emerald-500" },
    ];

    const results = [
        { id: "1B", label: "単打", rbi: 0 },
        { id: "2B", label: "二塁打", rbi: 0 },
        { id: "3B", label: "三塁打", rbi: 0 },
        { id: "HR", label: "本塁打", rbi: 1 },
        { id: "GO", label: "ゴロ", rbi: 0 },
        { id: "FO", label: "飛球", rbi: 0 },
        { id: "E", label: "失策", rbi: 0 },
    ];

    const handleConfirm = () => {
        if (!selectedPos) return;
        // 💡 advancesは将来的に詳細な走塁モーダルで選択させますが、一旦空配列で返します
        onResult(`${selectedPos}-${selectedPos === "HR" ? "HR" : "Hit"}`, rbi, []);
        setSelectedPos(null);
        setRbi(0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[32px] max-w-sm sm:max-w-md border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic tracking-tighter">IN PLAY RESULT</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* ポジション選択 */}
                    <div className="space-y-3">
                        <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">Select Position</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {positions.map((pos) => (
                                <Button
                                    key={pos.id}
                                    variant={selectedPos === pos.id ? "default" : "outline"}
                                    onClick={() => setSelectedPos(pos.id)}
                                    className={cn(
                                        "h-12 rounded-2xl font-black text-lg transition-all active:scale-95",
                                        selectedPos === pos.id ? pos.color : "bg-card"
                                    )}
                                >
                                    {pos.id}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* 打点入力 */}
                    <div className="space-y-3">
                        <Label className="font-black text-xs uppercase text-muted-foreground tracking-widest">RBI (打点)</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                className="h-12 w-12 rounded-full font-black text-xl"
                                onClick={() => setRbi(Math.max(0, rbi - 1))}
                            >-</Button>
                            <span className="text-3xl font-black w-12 text-center tabular-nums">{rbi}</span>
                            <Button
                                variant="outline"
                                className="h-12 w-12 rounded-full font-black text-xl"
                                onClick={() => setRbi(Math.min(4, rbi + 1))}
                            >+</Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedPos}
                        className="w-full h-14 rounded-2xl font-black text-xl bg-primary shadow-lg shadow-primary/20"
                    >
                        記録を確定
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
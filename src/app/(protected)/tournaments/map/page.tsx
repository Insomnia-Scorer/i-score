// src/app/(protected)/tournaments/map/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Trophy, Calendar, MapPin, ChevronRight,
    Loader2, Target, Users2, Activity,
    TrendingUp, Sword, Flame, Zap,
    ArrowLeft, Plus, Pencil, Trash2,
    UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Tournament {
    id: string;
    name: string;
    season: string;
    organizer: string | null;
    bracketUrl: string | null;
    timeLimit: string | null;
    coldGameRule: string | null;
    tiebreakerRule: string | null;
    startDate: string | null;
    endDate: string | null;
    createdAt: number;
}

interface TournamentFormData {
    name: string;
    season: string;
    organizer: string;
    startDate: string;
    endDate: string;
    timeLimit: string;
    coldGameRule: string;
    tiebreakerRule: string;
    bracketUrl: string;
}

const EMPTY_FORM: TournamentFormData = {
    name: "",
    season: String(new Date().getFullYear()),
    organizer: "",
    startDate: "",
    endDate: "",
    timeLimit: "",
    coldGameRule: "",
    tiebreakerRule: "",
    bracketUrl: "",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 大会ステータス判定
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getTournamentStatus(t: Tournament): "ongoing" | "upcoming" | "finished" {
    const today = new Date().toISOString().split("T")[0];
    if (t.startDate && t.endDate) {
        if (today < t.startDate) return "upcoming";
        if (today > t.endDate) return "finished";
        return "ongoing";
    }
    if (t.startDate && today >= t.startDate) return "ongoing";
    return "upcoming";
}

function getPeriodLabel(t: Tournament): string {
    const fmt = (d: string) => {
        const [y, m] = d.split("-");
        return `${y}年${Number(m)}月`;
    };
    if (t.startDate && t.endDate) return `${fmt(t.startDate)} 〜 ${fmt(t.endDate)}`;
    if (t.startDate) return `${fmt(t.startDate)} 〜`;
    return `${t.season}年度`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 大会フォームコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TournamentFormProps {
    initial?: TournamentFormData;
    onSubmit: (data: TournamentFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    submitLabel: string;
}

function TournamentForm({ initial = EMPTY_FORM, onSubmit, onCancel, isSubmitting, submitLabel }: TournamentFormProps) {
    const [form, setForm] = useState<TournamentFormData>(initial);
    const set = (key: keyof TournamentFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }} className="space-y-4 pt-1">
            {/* 大会名 */}
            <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">大会名 *</Label>
                <Input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="第○○回 春季市民野球大会"
                    required
                    className="h-11 rounded-[var(--radius-xl)] font-bold"
                />
            </div>

            {/* シーズン & 主催者 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">年度 *</Label>
                    <Input
                        value={form.season}
                        onChange={set("season")}
                        placeholder="2026"
                        required maxLength={4}
                        className="h-11 rounded-[var(--radius-xl)] font-bold text-center"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">主催</Label>
                    <Input
                        value={form.organizer}
                        onChange={set("organizer")}
                        placeholder="○○連盟"
                        className="h-11 rounded-[var(--radius-xl)] font-bold"
                    />
                </div>
            </div>

            {/* 期間 */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">開始日</Label>
                    <Input
                        type="date"
                        value={form.startDate}
                        onChange={set("startDate")}
                        className="h-11 rounded-[var(--radius-xl)] font-bold"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">終了日</Label>
                    <Input
                        type="date"
                        value={form.endDate}
                        onChange={set("endDate")}
                        className="h-11 rounded-[var(--radius-xl)] font-bold"
                    />
                </div>
            </div>

            {/* 試合規定（折りたたみ的に下に配置） */}
            <div className="space-y-3 pt-1 border-t border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">試合規定（任意）</p>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">制限時間</Label>
                    <Input
                        value={form.timeLimit}
                        onChange={set("timeLimit")}
                        placeholder="例: 1時間30分 (新しいイニングに入らない)"
                        className="h-10 rounded-[var(--radius-xl)] text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">コールド規定</Label>
                    <Input
                        value={form.coldGameRule}
                        onChange={set("coldGameRule")}
                        placeholder="例: 3回10点、5回7点差"
                        className="h-10 rounded-[var(--radius-xl)] text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">タイブレーク</Label>
                    <Input
                        value={form.tiebreakerRule}
                        onChange={set("tiebreakerRule")}
                        placeholder="例: 1アウト満塁から"
                        className="h-10 rounded-[var(--radius-xl)] text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">組み合わせ表URL</Label>
                    <Input
                        value={form.bracketUrl}
                        onChange={set("bracketUrl")}
                        placeholder="https://..."
                        type="url"
                        className="h-10 rounded-[var(--radius-xl)] text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">
                    キャンセル
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
                </Button>
            </div>
        </form>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 大会カード
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TournamentCardProps {
    t: Tournament;
    onEdit: (t: Tournament) => void;
    onDelete: (t: Tournament) => void;
}

function TournamentCard({ t, onEdit, onDelete }: TournamentCardProps) {
    const status = getTournamentStatus(t);
    const period = getPeriodLabel(t);

    const statusConfig = {
        ongoing:  { label: "参戦中",  icon: <Activity className="h-5 w-5 animate-pulse" />, accent: "bg-primary text-primary-foreground" },
        upcoming: { label: "待機中",  icon: <Calendar className="h-5 w-5 opacity-50" />,    accent: "bg-muted/60 text-muted-foreground" },
        finished: { label: "終了",    icon: <Trophy className="h-5 w-5 opacity-40" />,       accent: "bg-muted/40 text-muted-foreground" },
    };
    const sc = statusConfig[status];

    return (
        <Card className={cn(
            "bg-card border-border rounded-[var(--radius-2xl)] overflow-hidden",
            "transition-all duration-300 hover:border-primary/30 shadow-none",
            status === "ongoing" && "ring-1 ring-primary/20",
        )}>
            <CardContent className="p-0">
                <div className="flex items-stretch">

                    {/* 左ステータスバー */}
                    <div className={cn(
                        "w-16 shrink-0 flex flex-col items-center justify-center gap-1.5 py-4",
                        sc.accent,
                    )}>
                        {sc.icon}
                        <span className="text-[8px] font-black tracking-widest uppercase leading-none" style={{ writingMode: "vertical-rl" }}>
                            {sc.label}
                        </span>
                    </div>

                    {/* 中央：大会情報 */}
                    <div className="flex-1 px-5 py-4 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-black px-2 py-0.5 rounded-md">
                                {t.season}年度
                            </Badge>
                            {t.organizer && (
                                <span className="text-[10px] font-bold text-muted-foreground">{t.organizer}</span>
                            )}
                        </div>

                        <h3 className="text-base font-black tracking-tight text-card-foreground leading-snug line-clamp-2">
                            {t.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{period}
                            </span>
                            {t.timeLimit && (
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                    <Target className="h-3 w-3" />{t.timeLimit}
                                </span>
                            )}
                        </div>

                        {/* オプション情報 */}
                        {(t.coldGameRule || t.tiebreakerRule) && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {t.coldGameRule && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                                        コールド: {t.coldGameRule}
                                    </span>
                                )}
                                {t.tiebreakerRule && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                                        TB: {t.tiebreakerRule}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 右：アクション（常時表示） */}
                    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 border-l border-border/40 shrink-0 bg-muted/10">
                        <button
                            onClick={() => onEdit(t)}
                            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
                            title="編集"
                        >
                            <Pencil className="h-[15px] w-[15px]" strokeWidth={2.2} />
                        </button>
                        <button
                            onClick={() => onDelete(t)}
                            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
                            title="削除"
                        >
                            <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.2} />
                        </button>
                        {t.bracketUrl && (
                            <a
                                href={t.bracketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-card-foreground hover:bg-muted active:scale-90 transition-all"
                                title="組み合わせ表"
                            >
                                <ChevronRight className="h-[15px] w-[15px]" strokeWidth={2.5} />
                            </a>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインページ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TournamentMapContent() {
    const router = useRouter();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // モーダル管理
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Tournament | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ━━ データ取得 ━━
    const fetchTournaments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/tournaments");
            if (!res.ok) throw new Error();
            const data = await res.json() as Tournament[];
            setTournaments(Array.isArray(data) ? data : []);
        } catch {
            toast.error("大会一覧の取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

    // ━━ CRUD ━━
    const handleAdd = async (data: TournamentFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
            toast.success(`「${data.name}」を登録しました`);
            setIsAddOpen(false);
            await fetchTournaments();
        } catch {
            toast.error("登録に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (data: TournamentFormData) => {
        if (!editTarget) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tournaments/${editTarget.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
            toast.success(`「${data.name}」を更新しました`);
            setEditTarget(null);
            await fetchTournaments();
        } catch {
            toast.error("更新に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tournaments/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success(`「${deleteTarget.name}」を削除しました`);
            setDeleteTarget(null);
            await fetchTournaments();
        } catch {
            toast.error("削除に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ステータス別カウント
    const counts = { ongoing: 0, upcoming: 0, finished: 0 };
    tournaments.forEach(t => { counts[getTournamentStatus(t)]++; });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40 mx-auto" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28 animate-in fade-in duration-400">

            {/* ニュースティッカー */}
            {tournaments.length > 0 && (
                <div className="w-full bg-primary/5 border-b border-border/40 h-9 flex items-center overflow-hidden">
                    {/* 2セット並べることでループが途切れない */}
                    {[0, 1].map(i => (
                        <div key={i} className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-16 shrink-0 pr-16">
                            {tournaments.filter(t => getTournamentStatus(t) === "ongoing").map(t => (
                                <span key={t.id} className="text-[11px] font-bold text-primary flex items-center gap-2">
                                    <Flame className="h-3 w-3 shrink-0" /> 参戦中: {t.name}
                                </span>
                            ))}
                            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                                <Zap className="h-3 w-3 shrink-0" /> 登録大会数: {tournaments.length}件
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

                {/* ━━ ページヘッダー ━━ */}
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <button
                                onClick={() => router.back()}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-1">
                                <Trophy className="h-3 w-3" /> 大会管理
                            </span>
                        </div>
                        <h1 className="text-[1.7rem] font-black tracking-tight leading-none italic">
                            大会<span className="text-primary">マップ</span>
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground mt-1">
                            {tournaments.length}件登録中
                            {counts.ongoing > 0 && (
                                <span className="ml-2 text-primary font-black">● {counts.ongoing}件参戦中</span>
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        size="sm"
                        className="h-10 px-4 rounded-[var(--radius-xl)] font-black gap-2 shadow-sm shrink-0"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        大会を追加
                    </Button>
                </div>

                {/* ━━ サマリーバー ━━ */}
                <div className="grid grid-cols-3 gap-2">
                    {(["ongoing", "upcoming", "finished"] as const).map(s => {
                        const labels = { ongoing: "参戦中", upcoming: "待機中", finished: "終了" };
                        const colors = {
                            ongoing:  "border-primary/30 bg-primary/5 text-primary",
                            upcoming: "border-border bg-card text-muted-foreground",
                            finished: "border-border bg-card text-muted-foreground",
                        };
                        return (
                            <div key={s} className={cn(
                                "rounded-[var(--radius-xl)] p-3 border text-center",
                                colors[s],
                            )}>
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">{labels[s]}</p>
                                <p className="text-2xl font-black tabular-nums leading-none">{counts[s]}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ━━ 大会リスト ━━ */}
                {tournaments.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-[var(--radius-2xl)] bg-muted/50 flex items-center justify-center mx-auto">
                            <Trophy className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <p className="font-black text-base text-foreground/30 uppercase tracking-wider">大会未登録</p>
                        <p className="text-sm font-bold text-muted-foreground/50">「大会を追加」から登録しましょう</p>
                        <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-[var(--radius-xl)]">
                            <Plus className="h-4 w-4 mr-2" /> 大会を追加
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* 参戦中を先頭に、次に待機中、最後に終了 */}
                        {(["ongoing", "upcoming", "finished"] as const).map(statusGroup => {
                            const group = tournaments.filter(t => getTournamentStatus(t) === statusGroup);
                            if (group.length === 0) return null;
                            const groupLabels = { ongoing: "参戦中", upcoming: "待機中", finished: "終了した大会" };
                            return (
                                <div key={statusGroup} className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5 px-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {groupLabels[statusGroup]}
                                    </p>
                                    {group.map(t => (
                                        <TournamentCard
                                            key={t.id}
                                            t={t}
                                            onEdit={setEditTarget}
                                            onDelete={setDeleteTarget}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 格言 */}
                <div className="pt-8 pb-4 flex flex-col items-center gap-4">
                    <div className="h-8 w-px bg-gradient-to-b from-border to-transparent" />
                    <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-card/60 border border-border/40">
                        <Sword className="h-3.5 w-3.5 text-primary opacity-50" />
                        <p className="text-[10px] font-black italic text-muted-foreground tracking-[0.3em] uppercase">
                            Victory is earned in the details
                        </p>
                    </div>
                </div>

            </div>

            {/* ━━━ 大会追加モーダル ━━━ */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="rounded-[var(--radius-2xl)] max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="mb-3">
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" /> 大会を追加
                        </h2>
                    </div>
                    <TournamentForm
                        onSubmit={handleAdd}
                        onCancel={() => setIsAddOpen(false)}
                        isSubmitting={isSubmitting}
                        submitLabel="登録"
                    />
                </DialogContent>
            </Dialog>

            {/* ━━━ 大会編集モーダル ━━━ */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="rounded-[var(--radius-2xl)] max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto">
                    {editTarget && (
                        <>
                            <div className="mb-3">
                                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <Pencil className="h-4 w-4 text-primary" /> 大会を編集
                                </h2>
                                <p className="text-xs text-muted-foreground font-bold mt-0.5">{editTarget.name}</p>
                            </div>
                            <TournamentForm
                                initial={{
                                    name: editTarget.name,
                                    season: editTarget.season,
                                    organizer: editTarget.organizer ?? "",
                                    startDate: editTarget.startDate ?? "",
                                    endDate: editTarget.endDate ?? "",
                                    timeLimit: editTarget.timeLimit ?? "",
                                    coldGameRule: editTarget.coldGameRule ?? "",
                                    tiebreakerRule: editTarget.tiebreakerRule ?? "",
                                    bracketUrl: editTarget.bracketUrl ?? "",
                                }}
                                onSubmit={handleEdit}
                                onCancel={() => setEditTarget(null)}
                                isSubmitting={isSubmitting}
                                submitLabel="保存"
                            />
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ━━━ 削除確認モーダル ━━━ */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="rounded-[var(--radius-2xl)] max-w-xs w-full p-6">
                    {deleteTarget && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-black text-destructive flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" /> 大会を削除
                                </h2>
                                <p className="text-xs text-muted-foreground font-bold mt-0.5">この操作は取り消せません</p>
                            </div>
                            <div className="bg-destructive/5 border border-destructive/20 rounded-[var(--radius-xl)] p-3">
                                <p className="font-black text-sm text-card-foreground">{deleteTarget.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    ※関連する試合の大会情報も削除されます
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-[var(--radius-xl)] font-black">
                                    キャンセル
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-[var(--radius-xl)] font-black bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ニュースティッカー用アニメーション */}
            <style jsx global>{`
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

export default function TournamentMapPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        }>
            <TournamentMapContent />
        </Suspense>
    );
}

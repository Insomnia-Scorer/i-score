// src/app/(protected)/players/page.tsx
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
  Search, UserPlus, ChevronRight,
  Loader2, Activity, Pencil, Trash2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Player {
  id: string;
  name: string;
  uniformNumber: string;
  primaryPosition: string | null;
  throws: string | null;
  bats: string | null;
  isActive: number | boolean;
}

type PositionKey = "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH";

const POSITION_LABELS: Record<PositionKey, string> = {
  P: "投手", C: "捕手", "1B": "一塁", "2B": "二塁", "3B": "三塁",
  SS: "遊撃", LF: "左翼", CF: "中堅", RF: "右翼", DH: "指名打者",
};

const POSITION_CATEGORY: Record<PositionKey, "投手" | "捕手" | "内野手" | "外野手" | "DH"> = {
  P: "投手", C: "捕手",
  "1B": "内野手", "2B": "内野手", "3B": "内野手", SS: "内野手",
  LF: "外野手", CF: "外野手", RF: "外野手",
  DH: "DH",
};

const POSITION_STYLE: Record<string, string> = {
  投手: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  捕手: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  内野手: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  外野手: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

// 選手の守備カテゴリを返す
function getCategory(pos: string | null): string {
  if (!pos) return "不明";
  return POSITION_CATEGORY[pos as PositionKey] ?? "不明";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 選手フォーム（追加・編集共通）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PlayerFormData {
  name: string;
  uniformNumber: string;
  primaryPosition: string;
  throws: string;
  bats: string;
}

const EMPTY_FORM: PlayerFormData = {
  name: "", uniformNumber: "", primaryPosition: "", throws: "", bats: "",
};

interface PlayerFormProps {
  initial?: PlayerFormData;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

function PlayerForm({ initial = EMPTY_FORM, onSubmit, onCancel, isSubmitting, submitLabel }: PlayerFormProps) {
  const [form, setForm] = useState<PlayerFormData>(initial);
  const set = (key: keyof PlayerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }}
      className="space-y-4 pt-2"
    >
      <div className="grid grid-cols-2 gap-3">
        {/* 背番号 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">背番号 *</Label>
          <Input
            value={form.uniformNumber}
            onChange={set("uniformNumber")}
            placeholder="例: 1"
            required
            maxLength={3}
            className="h-12 rounded-2xl bg-muted/20 border-border font-black text-lg"
          />
        </div>
        {/* 氏名 */}
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">氏名 *</Label>
          <Input
            value={form.name}
            onChange={set("name")}
            placeholder="例: 山田 太郎"
            required
            className="h-12 rounded-2xl bg-muted/20 border-border font-bold"
          />
        </div>
      </div>

      {/* 守備位置 */}
      <div className="space-y-1.5">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">守備位置</Label>
        <select
          value={form.primaryPosition}
          onChange={set("primaryPosition")}
          className="w-full h-12 rounded-2xl bg-muted/20 border border-border px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">未設定</option>
          {(Object.keys(POSITION_LABELS) as PositionKey[]).map(k => (
            <option key={k} value={k}>{k} — {POSITION_LABELS[k]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 投 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">投</Label>
          <select
            value={form.throws}
            onChange={set("throws")}
            className="w-full h-12 rounded-2xl bg-muted/20 border border-border px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">未設定</option>
            <option value="R">右投 (R)</option>
            <option value="L">左投 (L)</option>
          </select>
        </div>
        {/* 打 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">打</Label>
          <select
            value={form.bats}
            onChange={set("bats")}
            className="w-full h-12 rounded-2xl bg-muted/20 border border-border px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">未設定</option>
            <option value="R">右打 (R)</option>
            <option value="L">左打 (L)</option>
            <option value="B">両打 (B)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-2xl font-black border-border"
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-2xl font-black shadow-md shadow-primary/10"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PlayerRosterContent() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("すべて");

  // モーダル状態
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // データ取得
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fetchPlayers = useCallback(async (tid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teams/${tid}/players`);
      if (!res.ok) throw new Error();
      const data = await res.json() as Player[];
      setPlayers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("選手一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const tid = localStorage.getItem("iScore_selectedTeamId");
    if (!tid) { setIsLoading(false); return; }
    setTeamId(tid);
    fetchPlayers(tid);
  }, [fetchPlayers]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRUD ハンドラー
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleAdd = async (data: PlayerFormData) => {
    if (!teamId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(`${data.name} 選手を登録しました`);
      setIsAddOpen(false);
      await fetchPlayers(teamId);
    } catch {
      toast.error("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: PlayerFormData) => {
    if (!teamId || !editTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(`${data.name} 選手を更新しました`);
      setEditTarget(null);
      await fetchPlayers(teamId);
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!teamId || !deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success(`${deleteTarget.name} 選手を削除しました`);
      setDeleteTarget(null);
      await fetchPlayers(teamId);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // フィルタリング
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const filtered = players.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.uniformNumber.includes(searchQuery);
    const category = getCategory(p.primaryPosition);
    const matchesFilter = filter === "すべて" || category === filter;
    return matchesSearch && matchesFilter;
  });

  const activeCount = players.filter(p => p.isActive).length;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ローディング
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/30 mx-auto" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
            Loading Roster...
          </p>
        </div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center space-y-4 opacity-40">
          <UserCircle className="h-16 w-16 mx-auto" />
          <p className="font-black text-lg">チームが選択されていません</p>
          <p className="text-sm font-bold text-muted-foreground">ダッシュボードからチームを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> 選手管理
            </p>
            <h1 className="text-3xl font-black tracking-tight">
              選手<span className="text-primary">名簿</span>
            </h1>
            <p className="text-xs text-muted-foreground font-bold">
              {players.length}名登録済み・アクティブ {activeCount}名
            </p>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-12 px-6 rounded-2xl font-black shadow-md shadow-primary/10 gap-2 w-full sm:w-auto"
          >
            <UserPlus className="h-5 w-5 stroke-[2.5px]" />
            選手を追加
          </Button>
        </div>

        {/* 検索・フィルター */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="名前・背番号で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-11 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border-border/40 font-bold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["すべて", "投手", "捕手", "内野手", "外野手"].map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
                className={cn(
                  "h-12 px-5 rounded-2xl font-black text-xs whitespace-nowrap shrink-0",
                  filter === cat
                    ? "bg-primary shadow-md shadow-primary/10"
                    : "bg-white/50 dark:bg-zinc-900/50 border-border/40"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* 選手リスト */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center space-y-3 opacity-30">
            <UserCircle className="h-14 w-14 mx-auto" />
            <p className="font-black text-lg italic uppercase tracking-tighter">
              {players.length === 0 ? "選手未登録" : "該当なし"}
            </p>
            <p className="text-sm font-bold text-muted-foreground">
              {players.length === 0
                ? "「選手を追加」ボタンから最初の選手を登録しましょう"
                : "条件を変えて再検索してください"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((player) => {
              const category = getCategory(player.primaryPosition);
              const posStyle = POSITION_STYLE[category] ?? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
              const posLabel = player.primaryPosition
                ? `${player.primaryPosition} — ${POSITION_LABELS[player.primaryPosition as PositionKey] ?? player.primaryPosition}`
                : "未設定";
              const isActive = player.isActive === 1 || player.isActive === true;

              return (
                <Card
                  key={player.id}
                  className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-border/40 rounded-[28px] overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="p-5 space-y-4">
                      {/* 上段：背番号・名前・バッジ */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          {/* 背番号 */}
                          <div className="h-14 w-14 rounded-[18px] bg-muted flex items-center justify-center text-2xl font-black italic tabular-nums text-foreground border border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 shrink-0">
                            {player.uniformNumber}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {!isActive && (
                                <Badge className="bg-zinc-500 text-white border-none text-[9px] font-black rounded-md px-1.5 py-0">
                                  非アクティブ
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors leading-none truncate">
                              {player.name}
                            </h3>
                            {/* 守備位置バッジ */}
                            <Badge
                              variant="outline"
                              className={cn("rounded-md text-[10px] font-black px-2 py-0.5 border", posStyle)}
                            >
                              {posLabel}
                            </Badge>
                          </div>
                        </div>
                        {/* 操作ボタン */}
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditTarget(player)}
                            className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(player)}
                            className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* 投打情報 */}
                      {(player.throws || player.bats) && (
                        <div className="flex gap-2">
                          {player.throws && (
                            <span className="text-[10px] font-black bg-muted/50 border border-border/50 rounded-lg px-2.5 py-1 text-muted-foreground">
                              投 {player.throws === "R" ? "右" : "左"}
                            </span>
                          )}
                          {player.bats && (
                            <span className="text-[10px] font-black bg-muted/50 border border-border/50 rounded-lg px-2.5 py-1 text-muted-foreground">
                              打 {player.bats === "R" ? "右" : player.bats === "L" ? "左" : "両"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 下段：詳細へのリンク */}
                    <button
                      onClick={() => router.push(
                        `/players/detail?teamId=${teamId}&playerName=${encodeURIComponent(player.name)}&uniformNumber=${player.uniformNumber}`
                      )}
                      className="w-full flex items-center justify-between px-5 py-3.5 border-t border-border/40 hover:bg-muted/30 transition-colors text-[11px] font-black uppercase tracking-widest text-muted-foreground group/btn"
                    >
                      詳細・成績を見る
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ━━━ 選手追加モーダル ━━━ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-[32px] border-border/50 bg-background p-6 max-w-md w-full shadow-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> 選手を追加
            </h2>
            <p className="text-xs text-muted-foreground font-bold mt-1">
              背番号と氏名は必須です
            </p>
          </div>
          <PlayerForm
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="登録する"
          />
        </DialogContent>
      </Dialog>

      {/* ━━━ 選手編集モーダル ━━━ */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="rounded-[32px] border-border/50 bg-background p-6 max-w-md w-full shadow-2xl">
          {editTarget && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary" /> 選手情報を編集
                </h2>
                <p className="text-xs text-muted-foreground font-bold mt-1">
                  #{editTarget.uniformNumber} {editTarget.name}
                </p>
              </div>
              <PlayerForm
                initial={{
                  name: editTarget.name,
                  uniformNumber: editTarget.uniformNumber,
                  primaryPosition: editTarget.primaryPosition ?? "",
                  throws: editTarget.throws ?? "",
                  bats: editTarget.bats ?? "",
                }}
                onSubmit={handleEdit}
                onCancel={() => setEditTarget(null)}
                isSubmitting={isSubmitting}
                submitLabel="保存する"
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ━━━ 削除確認モーダル ━━━ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-[32px] border-red-500/20 bg-background p-6 max-w-sm w-full shadow-2xl">
          {deleteTarget && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight text-red-500 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" /> 選手を削除
                </h2>
                <p className="text-sm font-bold text-muted-foreground">
                  この操作は取り消せません
                </p>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                <p className="font-black text-lg">#{deleteTarget.uniformNumber} {deleteTarget.name}</p>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">
                  この選手のデータを完全に削除します
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 h-12 rounded-2xl font-black"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-500/20"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除する"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlayerRoster() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    }>
      <PlayerRosterContent />
    </Suspense>
  );
}

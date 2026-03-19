// src/components/score/scoreboard.tsx
import { db } from "@/db";
import { matches, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
// 💡 Shield を追加
import { ChevronLeft, Flag, Swords, Trophy, MapPin, CalendarDays, Zap, CircleDot, User, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// 💡 モーダル用のインポートを追加
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ScoreBoardProps {
  matchId: string;
}

// 💡 守備位置の定義 (モーダル用)
const DEFENSIVE_POSITIONS = [
  { id: 1, name: "投", short: "P", cx: "50%", cy: "70%" },
  { id: 2, name: "捕", short: "C", cx: "50%", cy: "92%" },
  { id: 3, name: "一", short: "1B", cx: "78%", cy: "62%" },
  { id: 4, name: "二", short: "2B", cx: "65%", cy: "48%" },
  { id: 5, name: "三", short: "3B", cx: "22%", cy: "62%" },
  { id: 6, name: "遊", short: "SS", cx: "35%", cy: "48%" },
  { id: 7, name: "左", short: "LF", cx: "18%", cy: "28%" },
  { id: 8, name: "中", short: "CF", cx: "50%", cy: "15%" },
  { id: 9, name: "右", short: "RF", cx: "82%", cy: "28%" },
];

// 💡 一旦ダミーデータ
const currentInning = { inning: 1, top: true }; // 1回表
const runners = { 1: true, 2: false, 3: true }; // 1,3塁
const count = { ball: 1, strike: 2, out: 1 }; // 1ボール, 2ストライク, 1アウト
const batter = { name: "山田 太郎", uniformNumber: 18 };
const pitcher = { name: "佐藤 一郎", uniformNumber: 11 };

export async function ScoreBoard({ matchId }: ScoreBoardProps) {
  // 💡 HonoAPIに変更することを想定し、一旦dbから直接取得
  const matchWithTeams = await db
    .select({
      id: matches.id,
      opponent: matches.opponent,
      date: matches.date,
      location: matches.location,
      season: matches.season,
      innings: matches.innings,
      battingOrder: matches.battingOrder,
      matchType: matches.matchType,
      team: teams,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.teamId, teams.id))
    .where(eq(matches.id, matchId))
    .then((res) => res[0]);

  if (!matchWithTeams) {
    notFound();
  }

  const { team } = matchWithTeams;
  const isTop = matchWithTeams.battingOrder === "top";

  const getMatchTypeLabel = (type?: string) => {
    switch (type) {
      case "practice": return "練習試合";
      case "official": return "公式戦";
      case "tournament": return "大会";
      case "other": return "その他";
      default: return "練習試合";
    }
  };

  return <ScoreBoardContent team={team} match={matchWithTeams} isTop={isTop} />;
}

// 💡 useStateを使うため、コンテンツ部分を分離
function ScoreBoardContent({ team, match, isTop }: { team: any; match: any; isTop: boolean }) {
  // 💡 IN PLAYモーダルの開閉ステート
  const [inPlayModalOpen, setInPlayModalOpen] = useState(false);
  // 💡 選択された打球方向の守備位置ID
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  return (
    <>
      {/* 1. ヘッダー部分 */}
      <div className="mb-8 flex flex-col items-start gap-4 animate-in fade-in duration-500">
        <Button variant="ghost" asChild className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
          <Link href="/dashboard"><ChevronLeft className="h-5 w-5 mr-1" /> ダッシュボード</Link>
        </Button>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1 animate-in fade-in zoom-in duration-300">
            {match.season && (
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                <CalendarDays className="h-3.5 w-3.5 mr-1" /> {match.season}年度
              </span>
            )}
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm">
              <Trophy className="h-3.5 w-3.5 mr-1" /> {getMatchTypeLabel(match.matchType)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              {isTop ? <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" /> : <Swords className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 shrink-0" />}
              {team.name}
            </div>
            <div className="text-muted-foreground/30 font-black">vs</div>
            <div className="flex items-center gap-2">
              {!isTop ? <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 shrink-0" /> : <Swords className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />}
              {match.opponent}
            </div>
          </h1>
        </div>
      </div>

      {/* 2. ステータスパネル (打席状況) */}
      <Card className="mb-8 rounded-[32px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <CardContent className="p-5 sm:p-8 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1">
            <div className="w-full md:w-32 space-y-2.5">
              <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">イニング</label>
              <div className="h-14 sm:h-20 rounded-[20px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black">
                <span className="text-3xl sm:text-5xl">{currentInning.inning}</span>
                <span className="text-xl sm:text-3xl ml-1">{currentInning.top ? "表" : "裏"}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">ランナー</label>
              <div className="h-14 sm:h-20 rounded-[20px] bg-background border border-border/50 shadow-sm flex items-center justify-center gap-6 relative">
                {[1, 2, 3].map((base) => (
                  <div key={base} className="relative">
                    <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center shrink-0 transition-colors", runners[base] ? "bg-primary border-primary" : "bg-muted")}>
                        <Zap className={cn("h-6 w-6 sm:h-7 sm:w-7 transition-colors", runners[base] ? "text-primary-foreground" : "text-muted-foreground/30")} />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-background border border-border/50 flex items-center justify-center font-black text-xs text-muted-foreground/50 shadow-sm">{base}B</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1 space-y-2.5"><label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">ボール</label><div className="h-14 sm:h-16 rounded-[16px] bg-muted border border-border/50 shadow-sm flex items-center justify-center gap-3">{[1, 2, 3].map((idx) => (<div key={idx} className={cn("h-8 w-8 rounded-full transition-colors", idx <= count.ball ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-muted-foreground/10")} />))}</div></div>
            <div className="flex-1 space-y-2.5"><label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">ストライク</label><div className="h-14 sm:h-16 rounded-[16px] bg-muted border border-border/50 shadow-sm flex items-center justify-center gap-3">{[1, 2].map((idx) => (<div key={idx} className={cn("h-8 w-8 rounded-full transition-colors", idx <= count.strike ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-muted-foreground/10")} />))}</div></div>
            <div className="flex-1 space-y-2.5"><label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">アウト</label><div className="h-14 sm:h-16 rounded-[16px] bg-muted border border-border/50 shadow-sm flex items-center justify-center gap-3">{[1, 2].map((idx) => (<div key={idx} className={cn("h-8 w-8 rounded-full transition-colors", idx <= count.out ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-muted-foreground/10")} />))}</div></div>
          </div>
        </CardContent>
      </Card>
      
      {/* 3. バッターとピッチャーパネル */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in slide-in-from-top-4 duration-500 delay-100">
          <Card className="rounded-[24px] border border-border/50 bg-card overflow-hidden transition-all hover:border-primary/20"><CardContent className="p-5 flex items-center gap-4"><div className="h-14 w-14 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0"><User className="h-8 w-8 text-muted-foreground/30" /></div><div className="flex-1 min-w-0"><label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1 pl-0.5">バッター</label><div className="flex items-center gap-2"><div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0"><span className="font-black text-lg font-mono tracking-tighter">{batter.uniformNumber}</span></div><div className="text-xl sm:text-2xl font-black truncate">{batter.name}</div></div></div><Button variant="outline" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-muted active:scale-95"><UserPlus className="h-5 w-5" /></Button></CardContent></Card>
          <Card className="rounded-[24px] border border-border/50 bg-card overflow-hidden transition-all hover:border-red-500/20"><CardContent className="p-5 flex items-center gap-4"><div className="h-14 w-14 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0"><CircleDot className="h-8 w-8 text-muted-foreground/30" /></div><div className="flex-1 min-w-0"><label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 pl-0.5">ピッチャー</label><div className="flex items-center gap-2"><div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0"><span className="font-black text-lg font-mono tracking-tighter">{pitcher.uniformNumber}</span></div><div className="text-xl sm:text-2xl font-black truncate">{pitcher.name}</div></div></div><Button variant="outline" size="icon" className="h-11 w-11 rounded-full text-muted-foreground hover:bg-muted active:scale-95"><UserPlus className="h-5 w-5" /></Button></CardContent></Card>
      </div>

      {/* 4. アクションパネル (プレイ入力ボタン群) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/90 backdrop-blur-xl border-t border-border/50 z-40 md:pl-[300px] transition-[padding] animate-in slide-in-from-bottom-8 duration-500">
          <div className="max-w-7xl mx-auto">
              {/* メインアクション */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <Button className="h-16 sm:h-20 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex flex-col gap-0.5"><span>B</span><span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ボール</span></Button>
                  <Button className="h-16 sm:h-20 rounded-[20px] bg-amber-500 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"><span>S</span><span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">見逃し</span></Button>
                  <Button className="h-16 sm:h-20 rounded-[20px] bg-amber-500/80 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"><span>F</span><span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ファウル</span></Button>
                  
                  {/* 💡 IN PLAYボタンでモーダルを開く */}
                  <Button 
                    onClick={() => setInPlayModalOpen(true)}
                    className="h-16 sm:h-20 rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm sm:text-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex flex-col gap-0.5"
                  >
                      <span className="leading-tight mt-1">IN PLAY</span>
                      <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">打って</span>
                  </Button>
              </div>
              {/* サブアクション */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4"><Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background font-bold text-xs sm:text-sm shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">空振り</Button><Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background font-bold text-xs sm:text-sm shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">牽制</Button><Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background font-bold text-xs sm:text-sm shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">盗塁 / 暴投</Button><Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all text-red-500">アウト</Button></div>
          </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 💡 IN PLAY モーダル (打球方向と結果入力) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Dialog open={inPlayModalOpen} onOpenChange={setInPlayModalOpen}>
        <DialogContent className="max-w-xl w-[95%] rounded-[32px] border-border/50 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          
          <DialogHeader className="mb-6 relative z-10">
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20"><Swords className="h-7 w-7" /></div>
              打撃結果の入力
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 relative z-10">
            {/* ① 打球方向の選択 (巨大なフィールド図) */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">1. 打球方向を選択 (タップ)</label>
              <div className="relative aspect-[4/3] w-full rounded-[24px] bg-muted/50 border border-border/50 overflow-hidden shadow-inner flex items-center justify-center p-2">
                
                {/* 💡 SVGで野球場を描画 */}
                <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full opacity-30">
                  {/* フェアゾーン */}
                  <path d="M100 140 L20 60 Q100 -20 180 60 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  {/* 内野ダイヤモンド */}
                  <path d="M100 130 L60 90 L100 50 L140 90 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  {/* 外野ライン */}
                  <path d="M40 80 Q100 20 160 80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* 💡 守備位置ボタンを配置 */}
                {DEFENSIVE_POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos.id)}
                    style={{ left: pos.cx, top: pos.cy }}
                    className={cn(
                      "absolute h-12 w-12 rounded-full border-2 font-black text-xl shadow-lg transition-all active:scale-90 flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                      selectedPosition === pos.id
                        ? "bg-primary border-primary text-primary-foreground scale-110 rotate-[360deg] duration-500"
                        : "bg-background border-border/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {pos.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ② 打撃結果の選択 (ヒット、アウトなど) */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">2. 結果を選択 (ヒット / アウト)</label>
              <div className="grid grid-cols-2 gap-4">
                  <Button className="h-16 rounded-[16px] bg-emerald-500 hover:bg-emerald-600 font-black text-lg shadow-emerald-500/20 shadow-lg">ヒット (安打)</Button>
                  <Button variant="outline" className="h-16 rounded-[16px] border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-black text-lg shadow-sm">アウト (凡退)</Button>
              </div>
            </div>

            {/* 下部アクション */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button variant="ghost" onClick={() => setInPlayModalOpen(false)} className="rounded-[12px] font-bold">キャンセル</Button>
                <Button disabled={!selectedPosition} className="rounded-[12px] px-8 font-black bg-primary">結果を確定</Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// // src/components/score/Scoreboard.tsx
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { ChevronLeft, Maximize, Activity, ChevronRight, User } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface Match {
//     id: string; opponent: string; date: string;
//     location: string | null; matchType: string; status: string; season: string;
//     innings?: number;
// }

// interface LineupPlayer {
//     batting_order: number; playerName: string; uniformNumber: string; position: string;
// }

// interface ScoreboardProps {
//     match: Match; inning: number; isTop: boolean;
//     guestInningScores: number[]; selfInningScores: number[];
//     guestScore: number; selfScore: number;
//     currentPitcher: LineupPlayer | null; selfPitchCount: number; selfInningPitchCount: number;
//     currentBatter: LineupPlayer | null; nextBatter: LineupPlayer | null;
//     onFinish: () => void; onToggleFullScreen: () => void;
// }

// export function Scoreboard({
//     match, inning, isTop, guestInningScores, selfInningScores, guestScore, selfScore,
//     currentPitcher, selfPitchCount, selfInningPitchCount, currentBatter, nextBatter,
//     onFinish, onToggleFullScreen
// }: ScoreboardProps) {

//     const displayInnings = Math.max(match.innings || 9, Math.max(9, inning));

//     return (
//         <header className="px-2 pt-2 pb-6 sm:px-4 sm:pt-4 sm:pb-8 shrink-0 z-20">
//             <div className="bg-background/95 backdrop-blur-2xl border border-border/50 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.1)] flex flex-col relative">
                
//                 {/* 💡 修正: 上段（ヘッダー全体）をプライマリカラーで塗りつぶす！ */}
//                 <div className="bg-primary text-primary-foreground flex items-center justify-between px-3 py-3 rounded-t-[27px] relative overflow-hidden">
//                     {/* うっすらと上部に光沢を入れるグラデーション */}
//                     <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

//                     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-primary-foreground border-none transition-all shrink-0 z-10" asChild>
//                         <Link href="/dashboard"><ChevronLeft className="h-5 w-5 pr-0.5" /></Link>
//                     </Button>

//                     <div className="flex flex-col items-center justify-center z-10">
//                         <span className="text-[9px] font-black text-primary-foreground/70 uppercase tracking-[0.2em] mb-1 leading-none">
//                             {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
//                         </span>
//                         <h1 className="font-black text-base sm:text-lg tracking-tight truncate max-w-[180px] sm:max-w-[250px] drop-shadow-md leading-none">
//                             VS {match.opponent}
//                         </h1>
//                     </div>

//                     <div className="flex items-center gap-1.5 shrink-0 z-10">
//                         {/* 終了ボタンもプライマリ背景に馴染むように白半透明ベースに */}
//                         <Button onClick={onFinish} size="sm" className="bg-white/20 hover:bg-red-500 hover:text-white text-primary-foreground font-black rounded-full px-4 shadow-none text-[10px] h-8 border-none transition-colors">
//                             終了
//                         </Button>
//                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-primary-foreground border-none transition-all hidden sm:flex" onClick={onToggleFullScreen}>
//                             <Maximize className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* 中段：スコアボード本体 */}
//                 <div className="bg-gradient-to-b from-background to-muted/20 px-3 pt-3 pb-3 rounded-b-[28px] relative">
//                     <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
//                         {/* 左側：チーム名 */}
//                         <div className="flex flex-col gap-2.5 w-[70px] sm:w-[90px] shrink-0 font-bold text-xs sm:text-sm">
//                             <div className="truncate text-muted-foreground">{match.opponent}</div>
//                             <div className="truncate text-primary font-black drop-shadow-sm">Self</div>
//                         </div>

//                         {/* 中央：イニングスコア */}
//                         <div className="flex-1 flex px-2 sm:px-4 gap-1 sm:gap-1.5 min-w-[260px]">
//                             {[...Array(displayInnings)].map((_, i) => (
//                                 <div key={i} className="flex flex-col gap-2 w-6 sm:w-7 items-center justify-center shrink-0">
//                                     {/* 表のスコア */}
//                                     <div className={cn("text-xs sm:text-sm w-full text-center py-0.5 rounded-md font-bold", inning === i + 1 && isTop ? "bg-foreground/10 text-foreground" : "text-muted-foreground/80")}>
//                                         {guestInningScores[i] ?? '-'}
//                                     </div>
//                                     {/* 裏のスコア */}
//                                     <div className={cn("text-xs sm:text-sm w-full text-center py-0.5 rounded-md font-bold", inning === i + 1 && !isTop ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground/80")}>
//                                         {selfInningScores[i] ?? '-'}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* 右側：合計スコア */}
//                         <div className="flex flex-col gap-1 w-[40px] sm:w-[50px] shrink-0 items-end">
//                             <div className="text-xl sm:text-2xl font-black text-foreground leading-none">{guestScore}</div>
//                             <div className="text-xl sm:text-2xl font-black text-primary leading-none drop-shadow-md">{selfScore}</div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 下段：バッジ（スコアボードの下枠からはみ出してぶら下がるスタイル） */}
//                 <div className="absolute left-0 right-0 -bottom-5 flex justify-center items-end pointer-events-none z-30">
//                     <div className="pointer-events-auto flex gap-2 shadow-lg rounded-full">
//                         {isTop ? (
//                             currentPitcher && (
//                                 <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-blue-400/30 flex items-center gap-2 animate-in slide-in-from-top-2">
//                                     <div className="flex items-center gap-1.5">
//                                         <Activity className="h-3.5 w-3.5 opacity-80" /> <span>P: {currentPitcher.playerName}</span>
//                                     </div>
//                                     <span className="bg-black/20 px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1.5">
//                                         <span className="opacity-80">計{selfPitchCount}球</span><span className="opacity-40">|</span><span className="font-black drop-shadow-sm">今{selfInningPitchCount}球</span>
//                                     </span>
//                                 </div>
//                             )
//                         ) : (
//                             <>
//                                 {currentBatter && (
//                                     <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-primary-foreground/20 flex items-center gap-1.5 animate-in slide-in-from-top-2">
//                                         <User className="h-3.5 w-3.5 opacity-80" /> {currentBatter.batting_order}番 {currentBatter.playerName}
//                                     </div>
//                                 )}
//                                 {nextBatter && (
//                                     <div className="bg-background/95 backdrop-blur-md text-muted-foreground px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold border border-border/50 flex items-center gap-1 animate-in slide-in-from-top-2">
//                                         <span className="text-primary font-black ml-0.5 text-[8px]">NEXT</span>
//                                         <ChevronRight className="h-3 w-3 -mx-1 opacity-40" /> {nextBatter.batting_order}番 {nextBatter.playerName}
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// }

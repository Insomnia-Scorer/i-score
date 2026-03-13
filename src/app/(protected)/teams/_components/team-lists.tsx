// src/app/(protected)/teams/_components/team-lists.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ChevronRight, ChevronLeft, Settings, Info, Swords, Search, Plus } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Organization, Team } from "../types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. クラブ一覧コンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface OrgListProps {
    orgs: Organization[];
    isLoading: boolean;
    selectedCategory: string;
    onCategoryChange: (cat: string) => void;
    onSelectOrg: (org: Organization) => void;
    onOpenDetail: (e: React.MouseEvent, type: 'org', data: Organization) => void;
    onOpponentClick: (opponent: any) => void;
    onAddOrg: (isExternal: boolean) => void; // 💡 追加：ヘッダーの「追加ボタン」用
}

// 💡 リボンの選択肢
const CATEGORIES = [
    { id: 'all', label: 'すべて', icon: '🌍' },
    { id: 'gakudo', label: '学童野球', icon: '🧢' },
    { id: 'junior', label: '中学野球', icon: '⚾️' },
    { id: 'high', label: '高校野球', icon: '🏫' },
    { id: 'adult', label: '一般・草野球', icon: '🍺' },
    { id: 'other', label: 'その他', icon: '📝' },
];

export function OrgList({ orgs, isLoading, selectedCategory, onCategoryChange, onSelectOrg, onOpenDetail, onOpponentClick, onAddOrg }: OrgListProps) {

    // 💡 選択されたカテゴリで絞り込む（'all' の場合は全て）
    const filteredOrgs = selectedCategory === 'all'
        ? orgs
        : orgs.filter(org => org.category === selectedCategory);

    // 💡 取得したクラブ一覧を「Role」で2つに分割
    const myOrgs = filteredOrgs.filter(org => org.myRole !== 'OPPONENT_MANAGER');
    const opponentOrgs = filteredOrgs.filter(org => org.myRole === 'OPPONENT_MANAGER');

    // 💡 データベースの対戦相手組織を、Opponent型（試合履歴付き）にマッピング
    const realOpponents = opponentOrgs.map(org => ({
        id: org.id,
        name: org.name,
        matchCount: 0,
        lastMatch: '-',
        wins: 0, losses: 0, draws: 0,
        recentMatches: [],
        originalOrg: org // 編集モーダルに渡すための元データ
    }));

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const getRoleDisplayName = (role: string) => {
        if (role === 'OWNER') return '代表';
        if (role === 'OPPONENT_MANAGER') return '対戦相手';
        return role;
    };

    return (
        <div className="animate-in slide-in-from-left-4 fade-in duration-300 pb-10">
            {/* 💡 究極UI化：カテゴリ・リボン（横スクロール） */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {CATEGORIES.map(c => {
                    const isSelected = selectedCategory === c.id;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onCategoryChange(c.id)}
                            className={cn(
                                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition-all active:scale-95 shadow-sm border",
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
                                    : "bg-background/80 text-muted-foreground border-border/50 hover:bg-muted"
                            )}
                        >
                            <span>{c.icon}</span> {c.label}
                        </button>
                    );
                })}
            </div>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                セクション 1: 所属クラブ
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                    <RiTeamFill className="h-6 w-6 text-primary" />
                    所属クラブ <span className="text-muted-foreground/50 text-base sm:text-lg">({myOrgs.length})</span>
                </h2>
                <Button
                    variant="outline" size="sm"
                    onClick={() => onAddOrg(false)}
                    className="rounded-full font-bold h-9 bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors border-border/50 shadow-sm md:hidden"
                >
                    <Plus className="h-4 w-4 mr-1" /> 追加
                </Button>
            </div>

            {myOrgs.length === 0 ? (
                <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        <RiTeamFill className="h-12 w-12 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">クラブが登録されていません</h3>
                    <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のクラブを作成しましょう。</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                    {myOrgs.map((org) => (
                        <Card key={org.id} onClick={() => onSelectOrg(org)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                            </div>

                            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                        <RiTeamFill className="h-7 w-7" />
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-primary/10 text-primary uppercase tracking-widest transition-colors duration-300 border border-primary/20 shadow-sm pointer-events-none">
                                            {getRoleDisplayName(org.myRole)}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => onOpenDetail(e, 'org', org)} className={cn("h-8 w-8 rounded-full transition-colors z-20", org.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                            {org.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                    {org.name}
                                </h3>
                                <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                    チーム一覧を開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                セクション 2: 対戦履歴・その他のクラブ
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="mt-16 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-150 fill-mode-both">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-6 border-t border-border/50">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2.5 text-foreground/80">
                            <Swords className="h-5 w-5 text-primary/70" />
                            対戦相手・その他クラブ <span className="text-muted-foreground/50 text-base sm:text-lg">({realOpponents.length})</span>
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground mt-1">過去に対戦したクラブや、登録されているクラブの一覧です。</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="クラブを検索..."
                                className="h-10 w-full rounded-full border border-border/50 bg-background pl-9 pr-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                        </div>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => onAddOrg(true)} // 💡 外部クラブとして追加
                            className="rounded-full font-bold h-10 bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors border-border/50 shadow-sm shrink-0"
                        >
                            <Plus className="h-4 w-4 mr-1" /> 追加
                        </Button>
                    </div>
                </div>

                {realOpponents.length === 0 ? (
                    <div className="text-center py-16 bg-muted/30 rounded-[32px] border border-dashed border-border/50 shadow-sm">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-inner text-muted-foreground">
                            <Swords className="h-8 w-8" />
                        </div>
                        <h3 className="text-base font-black text-foreground/80 mb-1 tracking-tight">対戦相手が登録されていません</h3>
                        <p className="text-muted-foreground font-extrabold text-xs">試合を記録する前に、右上の「追加」から相手クラブを作成しましょう。</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm">
                        {realOpponents.map((opp, index) => (
                            <div
                                key={opp.id}
                                onClick={() => onOpponentClick(opp)}
                                className={cn(
                                    "group flex items-center justify-between p-4 sm:px-6 hover:bg-muted/50 transition-colors cursor-pointer",
                                    index !== realOpponents.length - 1 && "border-b border-border/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm sm:text-base border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                                        {opp.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">{opp.name}</span>
                                            {/* 💡 歯車アイコンで編集・削除モーダルを開く */}
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onOpenDetail(e, 'org', (opp as any).originalOrg); }} className="h-6 w-6 rounded-full text-muted-foreground hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Settings className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground hidden sm:block">最終対戦: {opp.lastMatch}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">対戦回数</span>
                                        <span className="font-black text-foreground">{opp.matchCount} <span className="text-xs text-muted-foreground font-bold">回</span></span>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. チーム一覧コンポーネント (変更なし)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TeamListProps {
    teams: Team[];
    selectedOrg: Organization;
    isLoading: boolean;
    onBack: () => void;
    onTeamClick: (teamId: string) => void;
    onOpenDetail: (e: React.MouseEvent, type: 'team', data: Team) => void;
}

export function TeamList({ teams, selectedOrg, isLoading, onBack, onTeamClick, onOpenDetail }: TeamListProps) {
    // ...（中略：以前の TeamList コンポーネントの中身そのまま）...
    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="mb-6 flex flex-col items-start gap-4">
                <Button variant="ghost" onClick={onBack} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold">
                    <ChevronLeft className="h-5 w-5 mr-1" /> クラブ一覧へ戻る
                </Button>
                <div className="flex items-center justify-between w-full pl-2">
                    <div>
                        <div className="text-xs font-black text-primary tracking-wider uppercase mb-1">{selectedOrg.name}</div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                            <Shield className="h-6 w-6 text-primary" />
                            所属チーム <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                        </h2>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        <Shield className="h-12 w-12 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">チームが登録されていません</h3>
                    <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のチームを追加しましょう。</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                    {teams.map((team) => (
                        <Card key={team.id} onClick={() => onTeamClick(team.id)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                            </div>

                            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                        <Shield className="h-7 w-7" />
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm">TEAM</div>
                                        <Button variant="ghost" size="icon" onClick={(e) => onOpenDetail(e, 'team', team)} className={cn("h-8 w-8 rounded-full transition-colors z-20", selectedOrg.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                            {selectedOrg.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                    {team.name}
                                </h3>
                                <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                    ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
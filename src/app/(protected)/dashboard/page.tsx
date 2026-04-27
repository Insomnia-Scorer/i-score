// filepath: `src/app/(protected)/dashboard/page.tsx`
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Activity, 
  Clock, 
  CloudSun, 
  Navigation, 
  Wind, 
  MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { ScoreTypeSelector } from "@/components/features/dashboard/ScoreTypeSelector"; 
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { getWindDirectionLabel, getWMOWeatherText, reverseGeocode, type OpenMeteoResponse } from "@/lib/weather";

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // ... (タイマー・位置情報等のuseEffectは維持)

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 💡 修正：データ取得ロジック（ネスト構造への対応強化）
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const teamId = typeof window !== "undefined" ? localStorage.getItem("iScore_selectedTeamId") : null;
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const result = await matchRes.json() as any;
          
          // 🔥 究極の防御：配列が直接届く場合と、{ data: [] } で届く場合の両方に対応
          let matchArray: Match[] = [];
          if (Array.isArray(result)) {
            matchArray = result;
          } else if (result && Array.isArray(result.data)) {
            matchArray = result.data;
          }

          if (matchArray.length > 0) {
            const sorted = matchArray.sort((a, b) => b.date.localeCompare(a.date));
            setMatches(sorted);
          } else {
            setMatches([]);
          }
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 💡 確実に3件抽出
  const recentMatches = useMemo(() => {
    return matches.slice(0, 3);
  }, [matches]);

  if (!mounted) return null;

  // ... (レンダリング部分は維持。タイトルサイズ等の究極設定をキープ)

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">

        {/* 1. タイトルセクション (Dashboard 最大化) */}
        <section className="text-center space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <Activity className="h-8 w-8" /> Dashboard
          </h2>
          <h1 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.35em] opacity-60">
            Match Management & Live Recording
          </h1>
        </section>

        {/* ... (位置情報・セレクター・ウィジェット) ... */}
        <div className="flex justify-center px-1">
          <div className="flex items-center gap-2 py-3 px-10 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-all cursor-default">
            <MapPin className="h-4 w-4 animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tight">
              現在地：{locationName || "取得中..."}
            </span>
          </div>
        </div>

        <section>
          <ScoreTypeSelector />
        </section>

        {/* 環境ウィジェット */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-5 sm:p-6">
          {/* ... (ウィジェットの中身) ... */}
        </section>

        {/* 3. 試合結果 (3件表示) */}
        <section className="pt-4 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-5 uppercase tracking-[0.15em]">
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </div>
              試合結果
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
              </div>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase">Latest 3 Matches</p>
          </div>

          <div className="min-h-[100px]">
             {/* 💡 matchArrayが空でもMatchList内の「データなし」が表示されるはずです */}
             <MatchList matches={recentMatches} isLoading={isLoading} />
          </div>
          
          {/* 💡 matches.length > 0 の時だけボタンを出す */}
          {!isLoading && matches.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => router.push('/matches')}
                className="bg-white/50 dark:bg-zinc-800/50 hover:bg-primary/10 text-primary border-2 border-primary/20 rounded-full px-10 h-14 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group shadow-sm"
              >
                全ての試合結果を表示
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

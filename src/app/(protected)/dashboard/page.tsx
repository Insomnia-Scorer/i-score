// filepath: src/app/(protected)/dashboard/page.tsx
/* 💡 i-score ダッシュボード：現場の状況をリアルタイムに反映する中心地 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, Users, PlayCircle, Plus, Activity, Clock, 
  CloudSun, Navigation, Wind, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { 
  getWindDirectionLabel, 
  getWMOWeatherText, 
  type OpenMeteoResponse 
} from "@/lib/weather";

interface UserMembership {
  teamId: string;
  organizationName: string;
  teamName: string;
}

interface WeatherData {
  temp: number;
  weatherCode: number;
  windDir: number;
  windSpd: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ org: string; name: string } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // マウント後の処理と時計の更新
  useEffect(() => {
    setMounted(true);
    const checkAdmin = async () => {
      const { data: session } = await authClient.getSession();
      if (session?.user?.role === "SYSTEM_ADMIN") {
        router.replace("/admin");
      }
    };
    checkAdmin();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  // 気象データの取得
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m`
        );
        if (res.ok) {
          const data = (await res.json()) as OpenMeteoResponse;
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            windDir: data.current.wind_direction_10m,
            windSpd: Math.round(data.current.wind_speed_10m),
          });
        }
      } catch (e) {
        console.error("Weather fetch error", e);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => console.warn("Geolocation denied - using default display")
      );
    }
  }, []);

  // チーム情報と試合データの取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        // チーム名の取得
        const teamRes = await fetch("/api/auth/me");
        if (teamRes.ok) {
          const res = (await teamRes.json()) as { data: { memberships: UserMembership[] } };
          const currentMembership = res.data.memberships.find((m) => m.teamId === teamId);
          if (currentMembership) {
            setTeamInfo({ 
              org: currentMembership.organizationName, 
              name: currentMembership.teamName 
            });
          }
        }

        // 試合情報の取得
        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = (await matchRes.json()) as Match[];
          setMatches(Array.isArray(matchData) ? matchData.sort((a, b) => b.date.localeCompare(a.date)) : []);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (!mounted) return null;

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">
        
        {/* --- ヒーローセクション --- */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Overview</h2>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {teamInfo ? (
              <><span className="text-foreground">{teamInfo.org}</span> <span className="text-primary">{teamInfo.name}</span></>
            ) : (
              <span className="text-muted-foreground italic">チームを選択してください</span>
            )}
          </h1>
        </section>

        {/* --- 気象・環境ウィジェット --- */}
        <section className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/20 shadow-xl rounded-[32px] p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 時刻 */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Clock className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{dateString}</p>
                <p className="text-lg font-black text-foreground tabular-nums leading-none mt-1">{timeString}</p>
              </div>
            </div>

            {/* 天気 */}
            <div className="flex items-center gap-3 border-l border-border/10 pl-2">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><CloudSun className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Condition</p>
                <p className="text-lg font-black text-foreground leading-none mt-1">
                  {weather ? (
                    <>{getWMOWeatherText(weather.weatherCode)} <span className="text-xs ml-1 text-muted-foreground font-medium">{weather.temp}°C</span></>
                  ) : "---"}
                </p>
              </div>
            </div>

            {/* 風向き */}
            <div className="flex items-center gap-3 border-l border-border/10 pl-2">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                <Navigation 
                  className="h-6 w-6 transition-transform duration-1000" 
                  style={{ transform: `rotate(${weather ? weather.windDir : 0}deg)` }} 
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Wind</p>
                <p className="text-lg font-black text-foreground leading-none mt-1">
                  {weather ? getWindDirectionLabel(weather.windDir) : "---"}
                </p>
              </div>
            </div>

            {/* 風速 */}
            <div className="flex items-center gap-3 border-l border-border/10 pl-2">
              <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500"><Wind className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Speed</p>
                <p className="text-lg font-black text-foreground leading-none mt-1 tabular-nums">
                  {weather ? weather.windSpd : "--"} <span className="text-xs text-muted-foreground font-medium">m/s</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- クイックアクション --- */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push("/matches/create")}
            className="h-auto py-6 rounded-[24px] flex flex-col gap-2 font-bold transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground shadow-lg"
          >
            <Plus className="h-6 w-6" /> New Match
          </Button>
          <Button 
            variant="secondary"
            onClick={() => router.push("/players")}
            className="h-auto py-6 rounded-[24px] flex flex-col gap-2 font-bold backdrop-blur-md bg-white/50 dark:bg-zinc-800/50 border-border/40 transition-all hover:scale-105"
          >
            <Users className="h-6 w-6" /> Players
          </Button>
          {/* 追加のボタンは必要に応じて配置 */}
        </section>

        {/* --- 試合リスト --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black flex items-center gap-2 tracking-tight">
              <Calendar className="h-5 w-5 text-primary" /> Recent Matches
            </h3>
          </div>
          <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-[32px] border border-border/20 p-2 sm:p-4 min-h-[300px]">
            <MatchList matches={matches} isLoading={isLoading} />
          </div>
        </section>

      </div>
    </div>
  );
}

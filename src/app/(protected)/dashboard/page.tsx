// filepath: src/app/(protected)/dashboard/page.tsx
/* 💡 i-Score ダッシュボード：完全復旧版 + リアルタイム天気のみ統合 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, PlayCircle, Plus, Activity, Clock, CloudSun, Navigation, Wind } from "lucide-react";
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

  useEffect(() => {
    setMounted(true);
    const checkAdmin = async () => {
      const { data: session } = await authClient.getSession();
      if (session?.user?.role === "SYSTEM_ADMIN") {
        router.replace("/admin");
        return;
      }
    };
    checkAdmin();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  // 天気取得ロジック（バックグラウンド）
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
        () => console.log("Location access denied")
      );
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        const teamRes = await fetch("/api/auth/me");
        if (teamRes.ok) {
          const res = (await teamRes.json()) as { data: { memberships: UserMembership[] } };
          const currentMembership = res.data.memberships.find((m) => m.teamId === teamId);
          if (currentMembership) {
            setTeamInfo({ org: currentMembership.organizationName, name: currentMembership.teamName });
          }
        }

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
    <div className="w-full animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* ヘッダー */}
        <section>
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Overview
          </h2>
          <h1 className="text-3xl font-black tracking-tight flex items-baseline gap-2">
            {teamInfo ? (
              <><span className="text-foreground">{teamInfo.org}</span><span className="text-primary">{teamInfo.name}</span></>
            ) : (
              <span className="text-foreground">Loading Team...</span>
            )}
          </h1>
        </section>

        {/* 環境ウィジェット - レイアウトは以前のまま、値だけ流し込み */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">{dateString}</p>
              <p className="text-lg font-bold tabular-nums">{timeString}</p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><CloudSun className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Weather</p>
              <p className="text-base font-bold">
                {weather ? `${getWMOWeatherText(weather.weatherCode)} ${weather.temp}°C` : "---"}
              </p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Navigation 
                className="h-5 w-5 transition-transform duration-700" 
                style={{ transform: `rotate(${weather ? weather.windDir : 0}deg)` }} 
              />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Wind Dir</p>
              <p className="text-base font-bold">{weather ? getWindDirectionLabel(weather.windDir) : "---"}</p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg text-teal-500"><Wind className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Wind Spd</p>
              <p className="text-base font-bold tabular-nums">{weather ? `${weather.windSpd} m/s` : "--"}</p>
            </div>
          </div>
        </section>

        {/* クイックアクション - 元のボタンデザイン（variant="outline" 等を維持） */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push("/matches/create")}
            className="h-auto py-6 flex flex-col gap-2 font-bold"
          >
            <Plus className="h-6 w-6" />
            <span>New Match</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/players")}
            className="h-auto py-6 flex flex-col gap-2 font-bold"
          >
            <Users className="h-6 w-6" />
            <span>Players</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/team")}
            className="h-auto py-6 flex flex-col gap-2 font-bold"
          >
            <Trophy className="h-6 w-6" />
            <span>Team Stats</span>
          </Button>
          <Button 
            variant="outline"
            className="h-auto py-6 flex flex-col gap-2 font-bold"
          >
            <PlayCircle className="h-6 w-6" />
            <span>Training</span>
          </Button>
        </section>

        {/* 試合リスト - 不要なコンテナを削除し、以前のままの構造へ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Recent Matches
            </h3>
          </div>
          <MatchList matches={matches} isLoading={isLoading} />
        </section>

      </div>
    </div>
  );
}

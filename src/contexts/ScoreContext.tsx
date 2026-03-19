// src/contexts/ScoreContext.tsx
"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { toast } from "sonner";

// 💡 状態の型定義
type Count = { ball: number; strike: number; out: number };
type Inning = { num: number; isTop: boolean };
type Runners = { 1: boolean; 2: boolean; 3: boolean };
type Score = { top: number; bottom: number };

export type PlayEvent = {
    id: string;
    inningText: string;
    resultType: "hit" | "out" | "run" | "walk" | "other";
    batterName: string;
    description: string;
    timestamp: string;
};

interface ScoreContextType {
    count: Count;
    currentInning: Inning;
    runners: Runners;
    score: Score;
    logs: PlayEvent[]; // 💡 実況ログ配列
    addBall: () => void;
    addStrike: () => void;
    addFoul: () => void;
    addOut: () => void;
    addPlayResult: (result: string) => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState<Count>({ ball: 0, strike: 0, out: 0 });
    const [currentInning, setCurrentInning] = useState<Inning>({ num: 1, isTop: true });
    const [runners, setRunners] = useState<Runners>({ 1: false, 2: false, 3: false });
    const [score, setScore] = useState<Score>({ top: 0, bottom: 0 });
    const [logs, setLogs] = useState<PlayEvent[]>([]);

    const lastActionTime = useRef<number>(0);
    const COOLDOWN_MS = 400;

    const canExecuteAction = () => {
        const now = Date.now();
        if (now - lastActionTime.current < COOLDOWN_MS) return false;
        lastActionTime.current = now;
        return true;
    };

    // 🎙️ 熱い実況を追加する専用関数
    const addLog = (resultType: PlayEvent["resultType"], description: string) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const inningText = `${currentInning.num}回${currentInning.isTop ? "表" : "裏"}`;
        const batterName = "打者"; // ※ゆくゆくは実際のバッター名を入れます

        setLogs((prev) => [
            {
                id: Math.random().toString(36).substring(7),
                inningText,
                resultType,
                batterName,
                description,
                timestamp: timeStr,
            },
            ...prev,
        ]);
    };

    // ⚾️ 3アウトチェンジ
    const changeInning = () => {
        setCount({ ball: 0, strike: 0, out: 0 });
        setRunners({ 1: false, 2: false, 3: false });

        // 🎙️ チェンジの実況
        addLog("other", "ここでスリーアウト！！攻守交替となります！さあ、次のイニングへ！🔄");

        setCurrentInning((prev) => ({
            num: prev.isTop ? prev.num : prev.num + 1,
            isTop: !prev.isTop,
        }));
        toast.info("チェンジ！攻守交替です。");
    };

    // ⚾️ 得点処理
    const addRuns = (runsToAdd: number) => {
        if (runsToAdd <= 0) return;
        setScore((prev) => ({
            ...prev,
            [currentInning.isTop ? "top" : "bottom"]: prev[currentInning.isTop ? "top" : "bottom"] + runsToAdd,
        }));
        // 🎙️ 得点の実況
        addLog("run", `ランナーがホームイン！！一挙に ${runsToAdd} 点を追加しました！！🔥`);
        toast.success(`${runsToAdd}点入りました！`);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ 打席結果の処理（進塁・得点・熱血実況！）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addPlayResult = (result: string) => {
        if (!canExecuteAction()) return;
        setCount((prev) => ({ ...prev, ball: 0, strike: 0 }));

        setRunners((prevRunners) => {
            let newRunners = { ...prevRunners };
            let runsScored = 0;

            switch (result) {
                case "1B":
                    addLog("hit", "快音を残した打球は鮮やかに野手の間を抜ける！見事なクリーンヒット！！✨");
                    if (prevRunners[3]) runsScored += 1;
                    newRunners[3] = prevRunners[2];
                    newRunners[2] = prevRunners[1];
                    newRunners[1] = true;
                    toast.success("ヒット！");
                    break;

                case "2B":
                    addLog("hit", "右中間を真っ二つに割る！！打ったバッターは悠々二塁へ！ツーベースヒット！！⚡️");
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    newRunners[3] = prevRunners[1];
                    newRunners[2] = true;
                    newRunners[1] = false;
                    toast.success("ツーベースヒット！");
                    break;

                case "3B":
                    addLog("hit", "外野の頭上を越える長打！！快速を飛ばして一気に三塁へ到達！スリーベースヒット！！💨");
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    if (prevRunners[1]) runsScored += 1;
                    newRunners[3] = true;
                    newRunners[2] = false;
                    newRunners[1] = false;
                    toast.success("スリーベースヒット！！");
                    break;

                case "HR":
                    addLog("run", "捉えたァーー！！打った瞬間にそれと分かる、特大のホームラン！！🏟️🔥 スタンドのファンが総立ちです！！");
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    if (prevRunners[1]) runsScored += 1;
                    runsScored += 1;
                    newRunners = { 1: false, 2: false, 3: false };
                    toast.success("ホームラン！！！🔥");
                    break;

                case "OUT":
                    addLog("out", "高く上がった打球…野手がガッチリと掴んでアウト！打ち取りました！");
                    addOut();
                    break;

                case "DP":
                    addLog("out", "ショートからセカンド、そしてファーストへ！！美しすぎるダブルプレー（ゲッツー）完成！！👏");
                    addOut();
                    setTimeout(() => addOut(), 100);
                    break;

                case "SAC":
                    addLog("out", "きっちりと送りバント成功！自己犠牲でランナーを進めます！渋い仕事！");
                    addOut();
                    break;

                case "FC":
                    addLog("other", "野手選択（フィルダースチョイス）！際どいタイミングでしたがオールセーフ！記録に残らない痛いプレイ！");
                    addOut(); // 簡易的にアウト処理
                    break;

                case "ERR":
                    addLog("other", "あっと！ボールを弾いた！エラーで出塁を許します！これは痛いタイムリーエラーか！？💦");
                    // ※エラーによる進塁処理は複雑なため、一旦現状維持（本来は手動進塁などと連携）
                    break;

                default:
                    addLog("other", "プレイがかかりました。");
                    break;
            }

            if (runsScored > 0) addRuns(runsScored);
            return newRunners;
        });
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ カウント系アクション（1球ごとの実況）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addBall = () => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.ball >= 3) {
                addLog("walk", "フォアボール！冷静に見極めて一塁へ歩きます！ランナー出塁！🚶‍♂️");
                setRunners((r) => {
                    let runs = 0;
                    let newR = { ...r };
                    if (r[1] && r[2] && r[3]) { runs += 1; }
                    else if (r[1] && r[2]) { newR[3] = true; }
                    else if (r[1]) { newR[2] = true; }
                    newR[1] = true;
                    if (runs > 0) addRuns(runs);
                    return newR;
                });
                toast.success("フォアボール！");
                return { ...prev, ball: 0, strike: 0 };
            }

            // 🎙️ 通常のボール実況
            addLog("other", "ボール！外角低め、バッターよく見極めました！👀");
            return { ...prev, ball: prev.ball + 1 };
        });
    };

    const addStrike = () => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.strike >= 2) {
                addLog("out", "三振ーー！！最後は渾身のウイニングショット！！バッター手が出ない！！🔥");
                toast.error("バッターアウト！（三振）");
                if (prev.out >= 2) { changeInning(); return { ball: 0, strike: 0, out: 0 }; }
                return { ball: 0, strike: 0, out: prev.out + 1 };
            }

            // 🎙️ 通常のストライク実況
            addLog("other", "ストライク！ズバッと決まりました！ピッチャー強気です！⚡️");
            return { ...prev, strike: prev.strike + 1 };
        });
    };

    const addFoul = () => {
        if (!canExecuteAction()) return;
        // 🎙️ ファウルの実況
        addLog("other", "ファウル！鋭い打球ですがバックネット！バッター必死に食らいつきます！💦");
        setCount((prev) => {
            if (prev.strike < 2) return { ...prev, strike: prev.strike + 1 };
            return prev;
        });
    };

    const addOut = () => {
        // ※盗塁死や牽制アウトなどの汎用アウト
        setCount((prev) => {
            if (prev.out >= 2) { changeInning(); return { ball: 0, strike: 0, out: 0 }; }
            toast.error("アウト！");
            return { ...prev, out: prev.out + 1 };
        });
    };

    return (
        <ScoreContext.Provider value={{ count, currentInning, runners, score, logs, addBall, addStrike, addFoul, addOut, addPlayResult }}>
            {children}
        </ScoreContext.Provider>
    );
}

export function useScore() {
    const context = useContext(ScoreContext);
    if (context === undefined) throw new Error("useScore must be used within a ScoreProvider");
    return context;
}
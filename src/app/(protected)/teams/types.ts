// src/app/(protected)/teams/types.ts
export interface Organization {
    id: string;
    name: string;
    category: string;
    myRole: string;
}

export interface Team {
    id: string;
    name: string;
    organizationId: string | null;
    year: number;
    tier?: string;
    generation?: string; // 💡 追加
    teamType?: string;   // 💡 追加
}

export interface MatchRecord {
    id: string;
    date: string;
    myTeamName: string;
    opponentTeamName: string;
    myScore: number;
    opponentScore: number;
    result: 'win' | 'loss' | 'draw';
}

export interface Opponent {
    id: string;
    name: string;
    matchCount: number;
    lastMatch: string;
    wins: number;
    losses: number;
    draws: number;
    recentMatches: MatchRecord[];
}
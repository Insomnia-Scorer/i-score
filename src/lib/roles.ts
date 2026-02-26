// src/lib/roles.ts

// 💡 7つのロールを厳密に定義
export const ROLES = {
  ADMIN: "admin", // IT管理者
  MANAGER: "manager", // 代表・監督
  COACH: "coach", // コーチ
  SCORER: "scorer", // スコアラー
  STAFF: "staff", // 保護者・スタッフ
  PLAYER: "player", // 選手
  VIEWER: "viewer", // OB・関係者
  PENDING: "pending", // 認証待ちの仮ユーザー（デフォルト）
} as const;

// TypeScript用の型（'admin' | 'manager' | 'coach' ... となります）
export type Role = typeof ROLES[keyof typeof ROLES];

// 💡 各アクションに対する権限チェック用のヘルパー関数
// これを作っておくと、後々の画面やAPIの制御が劇的に楽になります

// 0. チームに承認されたメンバーか？（pending以外ならOK）
export const isApprovedMember = (role?: string | null): boolean => {
  if (!role) return false;
  return role !== ROLES.PENDING;
};

// 1. システム管理（IT担当）ができるか
export const canManageSystem = (role?: string | null): boolean => {
  return role === ROLES.ADMIN;
};

// 2. チーム管理（代表・監督・IT担当）ができるか
export const canManageTeam = (role?: string | null): boolean => {
  if (!role) return false;
  return ([ROLES.ADMIN, ROLES.MANAGER] as string[]).includes(role as Role);
};

// 3. スコアの入力・編集（管理者、監督、コーチ、スコアラー）ができるか
export const canEditScore = (role?: string | null): boolean => {
  if (!role) return false;
  return ([ROLES.ADMIN, ROLES.MANAGER, ROLES.COACH, ROLES.SCORER] as string[]).includes(role as Role);
};

// 4. チーム内部情報の閲覧（スタッフ以上）ができるか
export const canViewInternalData = (role?: string | null): boolean => {
  if (!role) return false;
  return ([ROLES.ADMIN, ROLES.MANAGER, ROLES.COACH, ROLES.SCORER, ROLES.STAFF] as string[]).includes(role as Role);
};

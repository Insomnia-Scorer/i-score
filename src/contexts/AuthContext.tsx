// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
/**
 * 💡 究極の認証コンテキスト (トークン復元版)
 * 1. 役割: __initial_auth_token を使用したカスタムトークン認証の自動実行。
 * 2. 永続化: ログイン状態を監視し、Firestore からユーザーロールを取得。
 * 3. 連携: Google/LINE ログインのトリガーを提供。
 */
import { 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInAnonymously,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserSession, SystemRole } from "@/types/auth";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithLine: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 💡 トークンの復元と初期認証ロジック
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            // カスタムトークンでサインイン
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            // トークンがない場合は匿名サインイン（またはログイン画面へ）
            await signInAnonymously(auth);
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    };

    initAuth();

    // 認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Firestore からロールや所属チーム情報を取得
        // ここでは artifacts/{appId}/users/{userId} のパスを想定
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userDocRef = doc(db, 'artifacts', appId, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        const userData = userDoc.data();
        
        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "ゲストユーザー",
          systemRole: (userData?.systemRole as SystemRole) || 'USER',
          memberships: userData?.memberships || [],
          currentTeamId: userData?.currentTeamId,
          image: fbUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithLine = async () => {
    // LINEログインは通常 Firebase Custom Auth または 
    // OpenID Connect を使用した処理が必要なため、ここではフローの入り口のみ定義
    window.location.href = "/api/auth/line"; 
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithLine, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// src/app/(protected)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canManageTeam, ROLES, Role } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Users, Loader2, CheckCircle2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isManager = canManageTeam(userRole);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isManager) {
      setIsLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json() as User[];
        setUsers(data);
      } catch (error) {
        console.error("ユーザー取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isManager]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        // ローカルのステートも更新して画面に反映
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("権限の更新に失敗しました");
      }
    } catch (error) {
      console.error("更新エラー:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isSessionLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Shield className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold">アクセス権限がありません</h1>
        <Button asChild variant="outline"><Link href="/dashboard">ダッシュボードへ戻る</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 tracking-tight">
            <Users className="h-7 w-7 text-primary" />
            メンバー管理
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">チームメンバーの権限を割り当てます。</p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className={`overflow-hidden transition-colors ${user.role === ROLES.PENDING ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  {user.role === ROLES.PENDING && (
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">承認待ち</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  disabled={updatingId === user.id}
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-background border border-input text-sm rounded-lg focus:ring-primary focus:border-primary block w-40 p-2.5 disabled:opacity-50 font-medium cursor-pointer"
                >
                  <option value={ROLES.PENDING}>保留 (Pending)</option>
                  <option value={ROLES.VIEWER}>閲覧者 (Viewer)</option>
                  <option value={ROLES.PLAYER}>選手 (Player)</option>
                  <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                  <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                  <option value={ROLES.COACH}>コーチ (Coach)</option>
                  <option value={ROLES.MANAGER}>監督 (Manager)</option>
                  <option value={ROLES.ADMIN}>IT担当 (Admin)</option>
                </select>
                
                {updatingId === user.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <CheckCircle2 className={`h-5 w-5 ${user.role === ROLES.PENDING ? 'text-transparent' : 'text-green-500'}`} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// src/app/(protected)/tournaments/register/page.tsx
// 大会登録機能は /tournaments/map に統合されました。
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TournamentRegisterRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/tournaments/map");
    }, [router]);

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
    );
}

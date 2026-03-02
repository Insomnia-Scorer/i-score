// src/components/PageHeader.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
    href: string;            // 戻る先のURL (例: "/dashboard")
    icon: React.ElementType; // Lucideアイコン
    title: string;           // 画面のタイトル
    subtitle: string;        // サブタイトル（簡易説明）
}

export function PageHeader({ href, icon: Icon, title, subtitle }: PageHeaderProps) {
    return (
        {/* 💡 背景を bg-primary にし、文字を text-primary-foreground (白系) に統一。境界線を消して影(shadow-md)で立体感を出しました */}
        <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md transition-colors duration-300">
            <div className="flex items-center gap-3">
                
                {/* 💡 戻るボタンも、濃い背景に合うように「半透明の白」ベースに進化させました */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-none transition-all group shrink-0" 
                    asChild
                >
                    <Link href={href}>
                        <ChevronLeft className="h-6 w-6 pr-0.5" />
                    </Link>
                </Button>
                
                <div className="flex flex-col min-w-0">
                    {/* 💡 タイトルの色指定(text-primary)を外し、背景色に対して自動でコントラストが保たれるようにしました */}
                    <h1 className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2 truncate">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{title}</span>
                    </h1>
                    {/* 💡 サブタイトルも、薄いグレーではなく「80%の不透明度の白」に変更して美しく馴染ませています */}
                    <p className="text-xs text-primary-foreground/80 font-bold truncate mt-0.5 tracking-wider">
                        {subtitle}
                    </p>
                </div>
                
            </div>
        </header>
    );
}

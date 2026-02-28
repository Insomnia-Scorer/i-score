// src/components/logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function LogoIcon({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* 外枠：野球のダイヤモンド（ひし形） */}
      <path
        d="M16 2.5 L2.5 16 L16 29.5 L29.5 16 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="text-foreground" // ライトモードで黒、ダークモードで白に自動変化
      />
      
      {/* 「 i 」のドット部分（2塁ベースの位置） */}
      <circle 
        cx="16" 
        cy="10" 
        r="2.5" 
        fill="currentColor" 
        className="text-primary" // ブランドカラー（青など）で発光
      />
      
      {/* 「 i 」の縦線部分（マウンドからホームベースへの軌跡） */}
      <path
        d="M16 15.5 L16 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}

// src/components/logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function LogoIcon({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* 💡 ご提示いただいた画像の「Icon（アイコンのみ）」を再現しています。
        Tailwindの text-primary と連動し、テーマカラーで美しく描画されます。
      */}

      {/* 1. 流線型のメインボディ（eのような軌跡） */}
      <path
        d="M 15 50 C 15 25 35 15 60 20 C 80 25 85 45 75 60 C 60 80 30 80 20 65"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-primary"
      />

      {/* 2. 中央を貫くスピードライン */}
      <path
        d="M 15 55 L 60 40"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-primary"
      />

      {/* 3. 下部のスウォッシュ（ボールの縫い目のような軌跡） */}
      <path
        d="M 10 75 C 30 95 65 95 85 75"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-primary"
      />

      {/* 4. 右上の四芒星（キラキラマーク）✨ */}
      <path
        d="M 85 5 Q 85 20 100 20 Q 85 20 85 35 Q 85 20 70 20 Q 85 20 85 5 Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}
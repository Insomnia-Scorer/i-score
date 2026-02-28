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
      <defs>
        {/* 💡 画像の「鋭い切れ込み」を再現するためのマスク（切り抜き）設定 */}
        <mask id="dynamic-slash">
          {/* 全体を白（表示）で塗りつぶす */}
          <rect width="100" height="100" fill="white" />

          {/* 黒（透明にする部分）で鋭い斜めのラインを描画 */}
          <path d="M 5 60 Q 40 40 85 10" stroke="black" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 15 90 Q 50 70 95 40" stroke="black" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* 中央の「e」や「ボール」の芯となる空白部分 */}
          <ellipse cx="45" cy="50" rx="10" ry="14" fill="black" transform="rotate(20 45 50)" />
        </mask>
      </defs>

      {/* 1. メインの球体（ブルーのベース部分） */}
      {/* マスクを適用して、画像の鋭いスウォッシュ（切れ込み）を表現しています */}
      <circle
        cx="45"
        cy="50"
        r="32"
        fill="currentColor"
        className="text-primary"
        mask="url(#dynamic-slash)"
      />

      {/* 2. 左下の飛び出したスピード線（軌跡） */}
      <path
        d="M 22 68 L 6 78"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        className="text-primary"
      />

      {/* 3. 右上の四芒星（キラキラマーク）✨ */}
      <path
        d="M 80 12 Q 80 26 94 26 Q 80 26 80 40 Q 80 26 66 26 Q 80 26 80 12 Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}
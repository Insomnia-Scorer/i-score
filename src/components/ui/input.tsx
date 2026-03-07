import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 💡 ベースの美しいスタイル（角丸・背景・極小シャドウ）
          "flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-xs transition-all duration-300 placeholder:text-muted-foreground/50",
          // 💡 究極UI：フォーカス時のオーラエフェクトを標準搭載！
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background focus-visible:shadow-md",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

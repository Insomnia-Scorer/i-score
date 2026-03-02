// src/components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        className={cn(
          // 💡 flex から inline-flex に変更し、無駄な w-full を削除（親からの指定幅に完璧に従うようになります）
          "relative inline-flex items-center rounded-lg border border-input bg-background text-sm transition-all",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          className
        )}
      >
        <select
          ref={ref}
          // 💡 text-inherit を追加し、親に渡された text-xs などの文字サイズを確実に引き継ぐようにしました
          // 💡 py-1.5 と min-h-[36px] に縮小し、高さ指定（h-10など）が来た時にハミ出さないように調整
          className="w-full h-full min-h-[36px] appearance-none bg-transparent pl-3 pr-8 py-1.5 outline-none cursor-pointer z-10 text-inherit"
          {...props}
        >
          {children}
        </select>
        
        <div className="pointer-events-none absolute right-2.5 text-muted-foreground z-0 flex items-center justify-center">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

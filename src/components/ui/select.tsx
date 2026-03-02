// src/components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      {/* 💡 修正ポイント1: 外側のdivにすべてのデザイン（背景・枠・フォーカス）を持たせ、className をここで受け取ります */}
      <div 
        className={cn(
          "relative flex items-center w-full rounded-xl border border-input bg-background text-sm text-foreground transition-all",
          "hover:bg-muted focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          className
        )}
      >
        {/* 💡 修正ポイント2: 実際のselectタグは「透明」にして、親のdivにすっぽり被せます */}
        <select
          ref={ref}
          className="w-full h-full appearance-none bg-transparent px-4 py-2.5 pr-10 outline-none cursor-pointer invalid:text-muted-foreground z-10"
          {...props}
        >
          {children}
        </select>
        
        {/* 矢印アイコン */}
        <div className="pointer-events-none absolute right-3 text-muted-foreground z-0">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

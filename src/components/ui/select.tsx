// src/components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition-all cursor-pointer",
            "hover:border-slate-500 hover:bg-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20",
            "invalid:text-slate-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

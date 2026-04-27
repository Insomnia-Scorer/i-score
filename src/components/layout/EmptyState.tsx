// filepath: `src/components/layout/EmptyState.tsx`
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-10 rounded-3xl border-2 border-dashed border-border/40 bg-card/30 transition-all",
      className
    )}>
      <div className="p-4 bg-muted/20 rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-base font-black text-muted-foreground uppercase tracking-wider leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">
          {description}
        </p>
      )}
    </div>
  );
}

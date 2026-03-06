// src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // 💡 animate-pulse で全体がフワフワと点滅（呼吸）するアニメーションをつけます
      className={cn("animate-pulse rounded-md bg-muted-foreground/10", className)}
      {...props}
    />
  )
}

export { Skeleton }

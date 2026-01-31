import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "accent" | "muted";
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "primary",
}: StatCardProps) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-secondary",
    accent: "bg-accent/10 text-accent border-accent/20",
    muted: "bg-muted text-muted-foreground border-muted",
  };

  const iconVariants = {
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    accent: "text-accent",
    muted: "text-muted-foreground",
  };

  return (
    <div 
      className={cn(
        "rounded-xl border p-6 transition-all duration-300 hover-lift",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold font-display tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-70">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-background/50 transition-transform group-hover:scale-110", iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

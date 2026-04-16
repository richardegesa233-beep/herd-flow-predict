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
    primary: "bg-primary/[0.06] border-primary/12 hover:border-primary/25",
    secondary: "bg-secondary/60 border-secondary hover:border-secondary",
    accent: "bg-accent/[0.06] border-accent/12 hover:border-accent/25",
    muted: "bg-muted/50 border-border hover:border-border",
  };

  const iconVariants = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary-foreground bg-secondary",
    accent: "text-accent bg-accent/10",
    muted: "text-muted-foreground bg-muted",
  };

  const valueVariants = {
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    accent: "text-accent",
    muted: "text-foreground",
  };

  return (
    <div 
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 hover-lift group",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold tabular-nums", valueVariants[variant])} style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg transition-transform duration-300 group-hover:scale-110", iconVariants[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "white";
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  variant = "default",
  fullScreen = false,
  className,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-3 w-3 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
    xl: "h-16 w-16 border-4",
  };

  const variantClasses = {
    default: "border-muted/30 border-t-muted-foreground",
    primary: "border-primary/20 border-t-primary",
    white: "border-white/30 border-t-white",
  };

  const content = (
    <div
      className={cn(
        "animate-spin rounded-full transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          {content}
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return content;
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  initials: string;
  photoUrl?: string | null;
  name?: string;
  secondary?: string;
  className?: string;
}

export function UserAvatar({
  initials,
  photoUrl,
  name,
  secondary,
  className,
}: UserAvatarProps) {
  const avatar = (
    <Avatar className={cn("h-8 w-8 shrink-0", !name && className)}>
      {photoUrl && <AvatarImage src={photoUrl} alt={name ?? initials} />}
      <AvatarFallback className="bg-primary text-white text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!name) return avatar;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {avatar}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate mb-1">{name}</p>
        {secondary && (
          <p className="text-xs text-muted-foreground truncate">{secondary}</p>
        )}
      </div>
    </div>
  );
}

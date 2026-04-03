import { cn } from "@/shared/lib";

export function ProfileImgChip({
  avatarUrl,
  name,
  className,
}: {
  avatarUrl?: string | null;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-bg text-xs font-semibold text-text",
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl ?? ""}
          alt={`${name} 프로필`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitial(name)}</span>
      )}
    </span>
  );
}

function getInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "?";
}

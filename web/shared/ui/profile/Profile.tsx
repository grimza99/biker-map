"use client";

import { PATHS } from "@package-shared/constants";
import { cn } from "@shared/lib";
import { useRouter } from "next/navigation";
import { ProfileImgChip } from "./ProfileImgChip";

interface IProfileProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  imgClassName?: string;
  canGoMePage?: boolean;
}
export function Profile({
  name,
  avatarUrl,
  className,
  imgClassName,
  canGoMePage = true,
}: IProfileProps) {
  const router = useRouter();
  const handleClickProfile = () => {
    if (canGoMePage) router.push(PATHS.me);
  };
  return (
    <div
      className={cn(
        "inline-flex max-w-40 w-full items-center justify-between rounded-3xl border border-border bg-panel-solid px-3 py-1.5 text-md font-medium text-text gap-2",
        className
      )}
      onClick={handleClickProfile}
    >
      <ProfileImgChip
        avatarUrl={avatarUrl ?? ""}
        name={name}
        className={imgClassName}
      />
      <span className="max-w-20 truncate mr-2">{name}</span>
    </div>
  );
}

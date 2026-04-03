"use client";

import Link from "next/link";

import { cn } from "@shared/lib";
import { ProfileImgChip } from "./ProfileImgChip";

export function Profile({
  name,
  avatarUrl,
  href = "/me",
  className,
  imgClassName,
}: {
  name: string;
  avatarUrl?: string | null;
  href?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex max-w-40 w-full items-center justify-between rounded-3xl border border-border bg-panel-solid px-3 py-1.5 text-md font-medium text-text",
        className
      )}
    >
      <ProfileImgChip
        avatarUrl={avatarUrl ?? ""}
        name={name}
        className={imgClassName}
      />
      <span className="max-w-20 truncate mr-2">{name}</span>
    </Link>
  );
}

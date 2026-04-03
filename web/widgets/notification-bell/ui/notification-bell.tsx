"use client";

import { NotificationItem } from "@package-shared/types/notification";
import { Bell, CheckCheck, Circle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@shared/lib";
import { Button } from "@shared/ui";

const initialNotifications: NotificationItem[] = [
  {
    id: "n-001",
    title: "새 댓글이 달렸습니다",
    message: "민준님이 '장거리 주행 루트' 글에 댓글을 남겼습니다.",
    unread: true,
    timeLabel: "3분 전",
  },
  {
    id: "n-003",
    title: "즐겨찾기한 장소가 업데이트되었습니다",
    message: "북악 스카이웨이 주변 카페 정보가 새로 반영되었습니다.",
    unread: false,
    timeLabel: "1시간 전",
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false }))
    );
  }

  if (!notifications.length) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="secondary"
        size="icon"
        selected={isOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={"알림"}
        onClick={() => setIsOpen((current) => !current)}
        className={cn("relative text-text hover:text-accent")}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 ? (
          <Circle className=" absolute right-2 top-2 h-2.5 w-2.5 fill-accent text-accent" />
        ) : null}
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="알림"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-border bg-panel shadow-[0_20px_60px_rgba(5,6,7,0.45)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
            <h2 className="m-0 text-base font-semibold tracking-[-0.02em] text-text">
              알림
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="px-3 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              모두 읽음
            </Button>
          </div>

          <div className="grid gap-3 px-4 py-4">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "grid gap-2 rounded-[18px] border p-3 transition duration-150 ease-out",
                  item.unread
                    ? "border-active/40 bg-active/5"
                    : "border-border bg-bg/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-0.5">
                    <h3 className="m-0 text-sm font-semibold tracking-[-0.02em] text-text">
                      {item.title}
                    </h3>
                    <p className="m-0 text-xs leading-6 text-muted truncate">
                      {item.message}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted">{item.timeLabel}</span>
              </article>
            ))}
          </div>

          <div className="border-t border-border px-4 py-2">
            <Button variant="ghost" size="sm">
              <Link href="/notifications" onClick={() => setIsOpen(false)}>
                전체 알림 보기
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

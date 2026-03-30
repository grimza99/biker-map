"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight, Circle } from "lucide-react";

import { cn } from "@shared/lib";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  unread: boolean;
  timeLabel: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n-001",
    title: "새 댓글이 달렸습니다",
    message: "민준님이 '장거리 주행 루트' 글에 댓글을 남겼습니다.",
    unread: true,
    timeLabel: "3분 전"
  },
  {
    id: "n-002",
    title: "좋아요 반응이 추가되었습니다",
    message: "서연님이 당신의 게시글에 반응했습니다.",
    unread: true,
    timeLabel: "18분 전"
  },
  {
    id: "n-003",
    title: "즐겨찾기한 장소가 업데이트되었습니다",
    message: "북악 스카이웨이 주변 카페 정보가 새로 반영되었습니다.",
    unread: false,
    timeLabel: "1시간 전"
  }
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
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }

  if (!notifications.length) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-panel-solid text-text transition duration-150 ease-out hover:-translate-y-0.5 hover:border-accent",
          isOpen && "border-accent bg-accent text-text shadow-[0_10px_24px_var(--shadow-accent)]"
        )}>
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-bg" aria-hidden="true" />
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="알림"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-border bg-panel shadow-[0_20px_60px_rgba(5,6,7,0.45)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
            <div className="grid gap-1">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">Notifications</p>
              <h2 className="m-0 text-base font-semibold tracking-[-0.02em] text-text">알림</h2>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-panel-solid px-3 py-1.5 text-xs font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5",
                unreadCount === 0 && "opacity-60"
              )}>
              <CheckCheck className="h-3.5 w-3.5" />
              모두 읽음
            </button>
          </div>

          <div className="grid gap-3 px-4 py-4">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "grid gap-2 rounded-[18px] border p-3 transition duration-150 ease-out",
                  item.unread ? "border-active/40 bg-active/5" : "border-border bg-bg/40"
                )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <h3 className="m-0 text-sm font-semibold tracking-[-0.02em] text-text">{item.title}</h3>
                    <p className="m-0 text-xs leading-6 text-muted">{item.message}</p>
                  </div>
                  {item.unread ? <Circle className="mt-0.5 h-3 w-3 fill-accent text-accent" /> : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">{item.timeLabel}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-strong">
                    확인
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <Link
              href="/notifications"
              className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-4 py-2 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5"
              onClick={() => setIsOpen(false)}>
              전체 알림 보기
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

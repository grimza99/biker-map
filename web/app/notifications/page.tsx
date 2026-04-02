import Link from "next/link";

import { cn } from "@shared/lib";
import { PageWrapper } from "@shared/ui";
import type { InboxNotification } from "@package-shared/types/notification";

type NotificationsView = "all" | "unread" | "mentions" | "empty" | "error" | "loading";

const notifications: InboxNotification[] = [
  {
    id: "n-001",
    kind: "comment",
    title: "새 댓글이 달렸습니다",
    message: "민준님이 '장거리 주행 루트' 글에 댓글을 남겼습니다.",
    timeLabel: "3분 전",
    unread: true,
    area: "커뮤니티"
  },
  {
    id: "n-002",
    kind: "reaction",
    title: "좋아요 반응이 추가되었습니다",
    message: "서연님이 당신의 게시글에 반응했습니다.",
    timeLabel: "18분 전",
    unread: true,
    area: "커뮤니티"
  },
  {
    id: "n-003",
    kind: "system",
    title: "즐겨찾기한 장소가 업데이트되었습니다",
    message: "북악 스카이웨이 주변 카페 정보가 새로 반영되었습니다.",
    timeLabel: "1시간 전",
    unread: false,
    area: "지도"
  },
  {
    id: "n-004",
    kind: "system",
    title: "추천 경로가 갱신되었습니다",
    message: "비오는 날 우회 경로가 오늘의 추천으로 등록되었습니다.",
    timeLabel: "오늘",
    unread: false,
    area: "경로"
  }
];

const filterTabs: Array<{ key: NotificationsView; label: string }> = [
  { key: "all", label: "전체" },
  { key: "unread", label: "읽지 않음" },
  { key: "mentions", label: "멘션" }
];

const kindMeta: Record<
  InboxNotification["kind"],
  { badge: string; tone: "accent" | "neutral" | "danger" }
> = {
  comment: { badge: "댓글", tone: "accent" },
  reply: { badge: "답글", tone: "accent" },
  reaction: { badge: "반응", tone: "neutral" },
  system: { badge: "시스템", tone: "danger" }
};

const toneClass: Record<"accent" | "neutral" | "danger", string> = {
  accent:
    "inline-flex items-center rounded-full bg-active/10 px-2.5 py-1 text-[12px] font-semibold text-accent-strong",
  neutral:
    "inline-flex items-center rounded-full bg-panel-soft/60 px-2.5 py-1 text-[12px] font-semibold text-text",
  danger:
    "inline-flex items-center rounded-full bg-danger/10 px-2.5 py-1 text-[12px] font-semibold text-danger"
};

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const view = normalizeView(params.view);

  if (view === "loading") {
    return (
      <PageWrapper className="p-6" innerClassName="gap-3">
        <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">알림 동기화</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">콘텐츠를 준비하는 중입니다.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">잠시만 기다리면 다음 화면을 볼 수 있습니다.</p>
      </PageWrapper>
    );
  }

  if (view === "error") {
    return (
      <PageWrapper className="border-danger/20 bg-panel p-6" innerClassName="gap-3">
        <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-danger">오류</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text">알림을 불러오지 못했습니다</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          잠시 후 다시 시도하거나 네트워크 상태를 확인하세요.
        </p>
      </PageWrapper>
    );
  }

  const viewItems = getFilteredNotifications(view, notifications);

  if (view === "empty" || viewItems.length === 0) {
    return (
      <PageWrapper className="p-6" innerClassName="gap-3">
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-text">새 알림이 없습니다</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          좋아요, 댓글, 즐겨찾기 업데이트가 들어오면 여기서 확인할 수 있습니다.
        </p>
      </PageWrapper>
    );
  }

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">인박스</p>
          <h1 className="mt-2 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">알림</h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted">
            댓글, 반응, 즐겨찾기, 경로 갱신을 한 곳에서 확인합니다. 현재 {unreadCount}개의 읽지 않은 알림이
            있습니다.
          </p>
        </div>

        <Link
          href="/notifications?view=loading"
          className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-4 py-2.5 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5">
          동기화 보기
        </Link>
      </div>

      <div className="flex flex-wrap gap-3" aria-label="알림 필터">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/notifications?view=${tab.key}`}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
              view === tab.key
                ? "bg-accent text-text shadow-[0_10px_24px_var(--shadow-accent)]"
                : "border border-border bg-panel-solid text-text"
            )}>
            {tab.label}
          </Link>
        ))}
        <Link
          href="/notifications?view=empty"
          className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-4 py-2.5 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5">
          빈 상태
        </Link>
        <Link
          href="/notifications?view=error"
          className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-4 py-2.5 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5">
          오류 상태
        </Link>
      </div>

      <div className="mt-5 grid gap-5">
        {groupNotifications(viewItems).map(([heading, items]) => (
          <section key={heading} className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-base font-semibold tracking-[-0.02em] text-text">{heading}</h2>
              <span className="rounded-full border border-border bg-panel-solid px-3 py-1.5 text-sm text-muted">
                {items.length}건
              </span>
            </div>

            <div className="grid gap-3">
              {items.map((item) => {
                const meta = kindMeta[item.kind];

                return (
              <article
                    key={item.id}
                    className={cn(
                      "grid gap-3 rounded-[18px] border bg-panel p-4 shadow-[0_8px_24px_var(--shadow)] transition duration-150 ease-out",
                      item.unread
                        ? "border-active/40 ring-1 ring-active/10"
                        : "border-border"
                    )}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={toneClass[meta.tone]}>{meta.badge}</span>
                      <span className="text-sm text-muted">{item.timeLabel}</span>
                    </div>

                    <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">{item.title}</h3>
                    <p className="m-0 text-sm leading-7 text-muted">{item.message}</p>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted">{item.area}</span>
                      {item.unread ? <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-label="읽지 않음" /> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageWrapper>
  );
}

function normalizeView(view?: string): NotificationsView {
  if (
    view === "all" ||
    view === "unread" ||
    view === "mentions" ||
    view === "empty" ||
    view === "error" ||
    view === "loading"
  ) {
    return view;
  }

  return "all";
}

function getFilteredNotifications(view: NotificationsView, items: InboxNotification[]) {
  if (view === "unread") {
    return items.filter((item) => item.unread);
  }

  if (view === "mentions") {
    return items.filter((item) => item.kind === "comment" || item.kind === "reply" || item.kind === "reaction");
  }

  return items;
}

function groupNotifications(items: InboxNotification[]) {
  const unread = items.filter((item) => item.unread);
  const read = items.filter((item) => !item.unread);

  return [
    ["읽지 않음", unread],
    ["읽은 알림", read]
  ].filter(([, groupItems]) => groupItems.length > 0) as Array<[string, InboxNotification[]]>;
}

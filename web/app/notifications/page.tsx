import Link from "next/link";

import { EmptyState, ErrorState, LoadingState } from "@shared/ui";
import type { InboxNotification } from "@entities/notification";

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
    kind: "favorite",
    title: "즐겨찾기한 장소가 업데이트되었습니다",
    message: "북악 스카이웨이 주변 카페 정보가 새로 반영되었습니다.",
    timeLabel: "1시간 전",
    unread: false,
    area: "지도"
  },
  {
    id: "n-004",
    kind: "route",
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
  reaction: { badge: "반응", tone: "neutral" },
  favorite: { badge: "즐겨찾기", tone: "neutral" },
  route: { badge: "경로", tone: "accent" },
  system: { badge: "시스템", tone: "danger" }
};

const toneClass: Record<"accent" | "neutral" | "danger", string> = {
  accent: "notification-badge",
  neutral: "notification-badge notification-badge-neutral",
  danger: "notification-badge notification-badge-danger"
};

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const view = normalizeView(params.view);

  if (view === "loading") {
    return <LoadingState label="알림 동기화" />;
  }

  if (view === "error") {
    return (
      <ErrorState
        title="알림을 불러오지 못했습니다"
        message="잠시 후 다시 시도하거나 네트워크 상태를 확인하세요."
      />
    );
  }

  const viewItems = getFilteredNotifications(view, notifications);

  if (view === "empty" || viewItems.length === 0) {
    return (
      <EmptyState
        title="새 알림이 없습니다"
        message="좋아요, 댓글, 즐겨찾기 업데이트가 들어오면 여기서 확인할 수 있습니다."
      />
    );
  }

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <section className="page-card">
      <div className="notifications-hero">
        <div>
          <p className="eyebrow">인박스</p>
          <h1>알림</h1>
          <p className="muted">
            댓글, 반응, 즐겨찾기, 경로 갱신을 한 곳에서 확인합니다. 현재 {unreadCount}개의 읽지 않은 알림이
            있습니다.
          </p>
        </div>

        <Link href="/notifications?view=loading" className="ghost-button">
          동기화 보기
        </Link>
      </div>

      <div className="hero-links" aria-label="알림 필터">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/notifications?view=${tab.key}`}
            className={view === tab.key ? "primary-button" : "ghost-button"}>
            {tab.label}
          </Link>
        ))}
        <Link href="/notifications?view=empty" className="ghost-button">
          빈 상태
        </Link>
        <Link href="/notifications?view=error" className="ghost-button">
          오류 상태
        </Link>
      </div>

      <div className="notifications-list">
        {groupNotifications(viewItems).map(([heading, items]) => (
          <section key={heading} className="notification-group">
            <div className="notification-group-header">
              <h2>{heading}</h2>
              <span className="session-pill">{items.length}건</span>
            </div>

            <div className="notification-stack">
              {items.map((item) => {
                const meta = kindMeta[item.kind];

                return (
                  <article
                    key={item.id}
                    className={item.unread ? "notification-card notification-card-unread" : "notification-card"}>
                    <div className="notification-card-top">
                      <span className={`${toneClass[meta.tone]}`}>{meta.badge}</span>
                      <span className="notification-time">{item.timeLabel}</span>
                    </div>

                    <h3>{item.title}</h3>
                    <p className="muted">{item.message}</p>

                    <div className="notification-card-bottom">
                      <span className="notification-area">{item.area}</span>
                      {item.unread ? <span className="notification-dot" aria-label="읽지 않음" /> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
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
    return items.filter((item) => item.kind === "comment" || item.kind === "reaction");
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

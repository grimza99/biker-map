import Link from "next/link";

import { cn } from "@shared/lib";
import { PageWrapper } from "@shared/ui";
import type { CommunityCategorySlug } from "@package-shared/types/community";

import {
  communityCategories,
  communityPosts,
} from "./community-content";

const spotlightPosts = communityPosts.slice(0, 4);
const categoryOrder: Array<CommunityCategorySlug | "all"> = ["all", ...communityCategories.map((item) => item.slug)];

export default function CommunityPage() {
  return (
    <PageWrapper className="p-0 text-text" innerClassName="gap-0">
      <div className="grid gap-5 rounded-[26px] border border-border bg-panel/82 p-6 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl md:p-7">
        <div className="grid gap-3">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">커뮤니티 MVP</p>
          <h1 className="m-0 text-[clamp(30px,5vw,44px)] font-semibold tracking-[-0.04em] text-text">
            카테고리 목록에서 바로 글 목록으로 진입합니다.
          </h1>
          <p className="max-w-[62ch] text-sm leading-7 text-muted">
            공지, 질문, 후기, 정보, 자유 게시판 기준의 최소 흐름을 먼저 열고, 웹 MVP에서 카테고리 &gt; 목록 &gt; 상세로
            이어지는 구조를 잡습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryOrder.map((slug) => {
            const category = slug === "all" ? null : communityCategories.find((item) => item.slug === slug);

            return (
              <Link
                key={slug}
                href={slug === "all" ? "/community" : `/community/${slug}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
                  slug === "all"
                    ? "border-accent bg-accent text-text shadow-[0_10px_24px_rgba(229,87,47,0.28)]"
                    : "border-border bg-panel-solid text-text hover:border-accent hover:text-accent-strong"
                )}>
                <span>{slug === "all" ? "전체" : category?.label}</span>
                {category ? <span className="text-xs text-muted/80">{category.hint}</span> : null}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {spotlightPosts.map((post) => {
            const category = communityCategories.find((item) => item.slug === post.category);

            return (
              <Link
                key={post.id}
                href={`/community/${post.category}`}
                className="grid gap-3 rounded-[20px] border border-border bg-bg/52 p-4 transition duration-150 ease-out hover:-translate-y-0.5 hover:border-accent">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-border bg-panel-solid px-3 py-1 text-xs font-medium text-muted">
                    {category?.label}
                  </span>
                  {post.pinned ? (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      고정
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <h2 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">{post.title}</h2>
                  <p className="m-0 text-sm leading-7 text-muted">{post.excerpt}</p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <span>{post.author}</span>
                  <span>{post.timeLabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

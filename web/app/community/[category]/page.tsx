import Link from "next/link";
import { notFound } from "next/navigation";

import { communityCategories } from "@/entities/community/community-categories";
import { getCommunityCategory } from "@/entities/community/ui/PostList";
import { cn } from "@shared/lib";
import { PageWrapper } from "@shared/ui";
import { communityPosts } from "../community-content";

export default async function CommunityCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryMeta = getCommunityCategory(category);

  if (!categoryMeta) {
    notFound();
  }

  const posts = communityPosts;
  return (
    <PageWrapper className="p-0 text-text" innerClassName="gap-0">
      <div className="grid gap-5 rounded-[26px] border border-border bg-panel/82 p-6 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-3">
            <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
              커뮤니티 카테고리
            </p>
            <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
              {categoryMeta.label}
            </h1>
            <p className="max-w-[62ch] text-sm leading-7 text-muted">
              {categoryMeta.hint} 기준의 글 목록입니다.
            </p>
          </div>

          <Link
            href="/community"
            className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-4 py-2 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5"
          >
            전체 보기
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {communityCategories.map((item) => (
            <Link
              key={item.slug}
              href={`/community/${item.slug}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
                item.slug === categoryMeta.slug
                  ? "border-accent bg-accent text-text shadow-[0_10px_24px_rgba(229,87,47,0.28)]"
                  : "border-border bg-panel-solid text-text hover:border-accent hover:text-accent-strong"
              )}
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted/80">{item.hint}</span>
            </Link>
          ))}
        </div>

        <div className="grid gap-3">
          {posts.length > 0 &&
            posts.map((post) => (
              <article
                key={post.id}
                className={cn(
                  "grid gap-3 rounded-[20px] border p-4 transition duration-150 ease-out",
                  post.pinned
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-bg/52"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-border bg-panel-solid px-3 py-1 text-xs font-medium text-muted">
                    {post.author}
                  </span>
                  <span className="text-xs text-muted">{post.timeLabel}</span>
                </div>

                <div className="grid gap-2">
                  <h2 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">
                    {post.title}
                  </h2>
                  <p className="m-0 text-sm leading-7 text-muted">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-muted">
                  <span>댓글 {post.commentCount}</span>
                  <span>조회 {post.viewCount}</span>
                </div>
              </article>
            ))}
        </div>
      </div>
    </PageWrapper>
  );
}

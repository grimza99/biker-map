import { PageWrapper } from "@shared/ui";

export default async function PostDetailPage({
  params
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">게시글 상세</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{postId}</p>
    </PageWrapper>
  );
}

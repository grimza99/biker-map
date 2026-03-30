import { PageWrapper } from "@shared/ui";

export default function NewPostPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">게시글 작성</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">로그인 필요 작성 셸</p>
    </PageWrapper>
  );
}

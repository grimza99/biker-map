import { PageWrapper } from "@shared/ui";

export default function CommunityPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text)]">커뮤니티</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">중고거래 / 자유 / 모임모집 진입</p>
    </PageWrapper>
  );
}

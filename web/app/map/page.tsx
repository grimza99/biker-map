import { PageWrapper } from "@shared/ui";

export default function MapPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">지도</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">검색, 카테고리 필터, 상세 진입 영역</p>
    </PageWrapper>
  );
}

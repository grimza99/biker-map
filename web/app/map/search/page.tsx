import { PageWrapper } from "@shared/ui";

export default function MapSearchPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-text">지도 검색</h1>
      <p className="mt-3 text-sm leading-7 text-muted">검색 결과 목록 셸</p>
    </PageWrapper>
  );
}

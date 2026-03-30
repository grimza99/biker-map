import { PageWrapper } from "@shared/ui";

export default function FavoritesPage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-text">즐겨찾기</h1>
      <p className="mt-3 text-sm leading-7 text-muted">인증 사용자 전용 목록 셸</p>
    </PageWrapper>
  );
}

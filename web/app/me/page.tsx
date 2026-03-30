import { PageWrapper } from "@shared/ui";

export default function MePage() {
  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">내 정보</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">내 활동 및 설정 진입점</p>
    </PageWrapper>
  );
}

import { PageWrapper } from "../page-wrapper";

export function LoadingState({ label = "불러오는 중" }: { label?: string }) {
  return (
    <PageWrapper innerClassName="gap-3">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent)]">{label}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text)]">콘텐츠를 준비하는 중입니다.</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">잠시만 기다리면 다음 화면을 볼 수 있습니다.</p>
    </PageWrapper>
  );
}

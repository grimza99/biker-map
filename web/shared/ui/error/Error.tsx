import { PageWrapper } from "../page-wrapper";

export function ErrorState({ title = "오류가 발생했습니다", message }: { title?: string; message?: string }) {
  return (
    <PageWrapper className="border-[rgba(165,61,48,0.18)] bg-[color:var(--panel)]" innerClassName="gap-3">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[color:var(--danger)]">오류</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">{title}</h1>
      {message ? <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{message}</p> : null}
    </PageWrapper>
  );
}

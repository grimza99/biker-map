import { PageWrapper } from "../page-wrapper";

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <PageWrapper innerClassName="gap-3">
      <h1 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text)]">{title}</h1>
      {message ? <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{message}</p> : null}
    </PageWrapper>
  );
}

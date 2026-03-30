import { PageWrapper } from "@shared/ui";

export default async function RouteDetailPage({
  params
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text)]">루트 상세</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{routeId}</p>
    </PageWrapper>
  );
}

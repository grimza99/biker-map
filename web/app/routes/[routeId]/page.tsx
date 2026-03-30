export default async function RouteDetailPage({
  params
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return (
    <section className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur-xl">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">루트 상세</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{routeId}</p>
    </section>
  );
}

export default async function PlaceDetailPage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return (
    <section className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur-xl">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">장소 상세</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{placeId}</p>
    </section>
  );
}

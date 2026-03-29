export default async function PlaceDetailPage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return (
    <section className="page-card">
      <h1>장소 상세</h1>
      <p className="muted">{placeId}</p>
    </section>
  );
}

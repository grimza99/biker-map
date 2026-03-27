export default async function RouteDetailPage({
  params
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return (
    <section className="page-card">
      <h1>루트 상세</h1>
      <p className="muted">{routeId}</p>
    </section>
  );
}

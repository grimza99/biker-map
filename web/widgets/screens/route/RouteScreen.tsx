export function RouteScreen({ routeId }: { routeId: string }) {
  return (
    <section className="page-card">
      <h1>루트 상세</h1>
      <p className="muted">{routeId}</p>
    </section>
  );
}

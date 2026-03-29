export function PlaceScreen({ placeId }: { placeId: string }) {
  return (
    <section className="page-card">
      <h1>장소 상세</h1>
      <p className="muted">{placeId}</p>
    </section>
  );
}

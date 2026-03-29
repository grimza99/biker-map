export function CommunityCategoryScreen({ category }: { category: string }) {
  return (
    <section className="page-card">
      <h1>카테고리</h1>
      <p className="muted">{category}</p>
    </section>
  );
}

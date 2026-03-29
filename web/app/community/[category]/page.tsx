export default async function CommunityCategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return (
    <section className="page-card">
      <h1>카테고리</h1>
      <p className="muted">{category}</p>
    </section>
  );
}

import { PageWrapper } from "@shared/ui";

export default async function CommunityCategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">카테고리</h1>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{category}</p>
    </PageWrapper>
  );
}

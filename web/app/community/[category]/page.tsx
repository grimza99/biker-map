import { CommunityCategoryScreen } from "@widgets/screens";

export default async function CommunityCategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return <CommunityCategoryScreen category={category} />;
}

import { PageWrapper } from "@shared/ui";

export default async function PlaceDetailPage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return (
    <PageWrapper className="p-6" innerClassName="gap-0">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-text">장소 상세</h1>
      <p className="mt-3 text-sm leading-7 text-muted">{placeId}</p>
    </PageWrapper>
  );
}

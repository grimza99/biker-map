import { PlaceScreen } from "@widgets/screens";

export default async function PlaceDetailPage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return <PlaceScreen placeId={placeId} />;
}

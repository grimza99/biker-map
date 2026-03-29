import { RouteScreen } from "@widgets/screens";

export default async function RouteDetailPage({
  params
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  return <RouteScreen routeId={routeId} />;
}

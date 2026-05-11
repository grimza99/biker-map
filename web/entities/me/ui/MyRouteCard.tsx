import { useDeleteRouteMutate } from "@/features/routes";
import { Button, Chip, DefaultCardContainer } from "@/shared";
import { regionLabel, RouteListItem } from "@package-shared/index";
import { ExternalLink, MapPinned, RouteIcon, Timer } from "lucide-react";

interface MyRouteCardProps {
  route: RouteListItem;
  onEdit: (id: string | null) => void;
}
export function MyRouteCard({ route, onEdit }: MyRouteCardProps) {
  const deleteRouteMutation = useDeleteRouteMutate();
  const sourceTypeLabel = route.sourceType === "user" ? "내 경로" : "큐레이션";
  return (
    <DefaultCardContainer className="flex flex-col md:flex-row justify-between gap-4 md:gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label={sourceTypeLabel} />
            {route.tags.length > 0 && (
              <>
                {route.tags.map((tag) => (
                  <Chip key={`${route.id}-${tag}`} label={`#${tag}`} />
                ))}
              </>
            )}
          </div>
          <h2 className="m-0 text-xl font-semibold tracking-[-0.03em] text-text">
            {route.title}
          </h2>
          <p className="m-0 text-sm leading-7 text-muted">{route.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-accent" />
            출발 -
            {route.departureRegion
              ? regionLabel[route.departureRegion]
              : route.departureRegion}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-accent" />
            도착 -
            {route.destinationRegion
              ? regionLabel[route.destinationRegion]
              : route.destinationRegion}
          </span>
          <span className="inline-flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-accent" />
            {route.distanceKm ? <>{route?.distanceKm}km</> : "거리 정보 없음"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-accent" />
            {route.estimatedDurationMinutes ? (
              <>{route.estimatedDurationMinutes}분</>
            ) : (
              "시간 정보 없음"
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start justify-end gap-2">
        <Button>상세 보기</Button>
        <a
          href={route.externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="whitespace-nowrap inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-medium text-text transition hover:-translate-y-0.5"
        >
          <ExternalLink className="h-4 w-4" />
          경로보기
        </a>
        <Button size="sm" variant="primary" onClick={() => onEdit(route.id)}>
          수정
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            try {
              await deleteRouteMutation.mutateAsync(route.id);
            } catch (error) {
              console.error("Failed to delete route:", error);
            }
          }}
        >
          삭제
        </Button>
      </div>
      {route.thumbnailUrl ? (
        <img
          src={route.thumbnailUrl}
          alt={route.title}
          className="hidden h-40 w-40 rounded-2xl border border-border object-cover md:block"
        />
      ) : null}
    </DefaultCardContainer>
  );
}

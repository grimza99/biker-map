import { Button, DefaultCardContainer } from "@/shared";
import { regionLabel, RouteListItem } from "@package-shared/index";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

interface ManageRouteItemProps {
  route: RouteListItem;
  onClickEdit: (routeId: string) => void;
  onClickDelete: (routeId: string) => void;
  isMutating?: boolean;
}
export function ManageRouteItem({
  route,
  onClickEdit,
  onClickDelete,
  isMutating = false,
}: ManageRouteItemProps) {
  return (
    <DefaultCardContainer
      key={route.id}
      className="flex gap-3 justify-between p-3 min-w-90 lg:min-w-100"
    >
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3>{route.title}</h3>
          <p className="m-0 text-xs text-muted">
            {route.departureRegion ? regionLabel[route.departureRegion] : "-"} →{" "}
            {route.destinationRegion
              ? regionLabel[route.destinationRegion]
              : "-"}
          </p>
          <a
            href={route.externalMapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="m-0 text-sm leading-6 text-muted">{route.summary}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onClickEdit(route.id)}
          disabled={isMutating}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onClickDelete(route.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </DefaultCardContainer>
  );
}

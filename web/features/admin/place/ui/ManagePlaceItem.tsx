import { Button, DefaultCardContainer } from "@/shared";
import { type PlaceListItem } from "@package-shared/index";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

interface ManagePlaceItemProps {
  place: PlaceListItem;
  onClickEdit: (placeId: string) => void;
  onClickDelete: (placeId: string) => void;
  isMutating?: boolean;
}

export function ManagePlaceItem({
  place,
  onClickEdit,
  onClickDelete,
  isMutating = false,
}: ManagePlaceItemProps) {
  return (
    <DefaultCardContainer className="flex min-w-90 justify-between gap-3 p-3 lg:min-w-100">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3>{place.name}</h3>
          <p className="m-0 text-xs uppercase text-muted">{place.category}</p>
          <a
            href={place.naverPlaceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="m-0 text-sm leading-6 text-muted">{place.address}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onClickEdit(place.id)}
          disabled={isMutating}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onClickDelete(place.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </DefaultCardContainer>
  );
}

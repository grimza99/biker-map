import { PlaceListItem } from "@package-shared/index";
import { useRouter } from "next/navigation";

import { quickFilters } from "@/entities/map";
import { Button, Chip } from "@/shared";

export function PlaceCard({ place }: { place: PlaceListItem }) {
  const router = useRouter();

  const handleClickDetail = () => {
    router.push(`/places/${place.id}`);
  };

  const label =
    quickFilters.find((item) => item.value === place.category)?.label ??
    undefined;

  return (
    <div className="cursor-pointer rounded-lg border border-border bg-panel-solid p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-lg">{place.name}</span>
        {label && <Chip label={label} />}
      </div>
      <p className="m-0 text-sm leading-5 text-muted">{place.address}</p>
      <div className="flex gap-2 items-center">
        <Button variant="primary" onClick={handleClickDetail} size="sm">
          상세보기
        </Button>
        <Button variant="secondary">
          <a href={place.naverPlaceUrl} target="_blank" rel="noreferrer">
            길찾기
          </a>
        </Button>
      </div>
    </div>
  );
}

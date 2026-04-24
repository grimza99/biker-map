import { useMemo, useState } from "react";

import { AdminModalId } from "@/app/admin/page";
import { ManagePlaceItem } from "@/features/admin";
import { useDeletePlace } from "@/features/admin/place/model/use-place";
import { PlaceForm } from "@/features/admin/place/ui/PlaceForm";
import { usePlaceDetail } from "@/features/places/model/use-place-detail";
import { usePlaces } from "@/features/places/model/use-places";
import { ManageEntityDialogLayout } from "@/widgets/admin/manage-entity-dialog";
import { buildCursor } from "@shared/api";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Input,
  Pagination,
} from "@shared/ui";
import { useDebouncedValue } from "@/shared";

interface ManagePlaceDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (id: AdminModalId | null) => void;
}

export function ManagePlaceDialog({
  openModalId,
  setOpenModalId,
}: ManagePlaceDialogProps) {
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 8;
  const debouncedSearch = useDebouncedValue(search, 300);

  const placesQuery = usePlaces({
    search: debouncedSearch || undefined,
    limit: pageSize,
    cursor: page > 1 ? buildCursor((page - 1) * pageSize) : undefined,
  });
  const placeDetailQuery = usePlaceDetail(editingPlaceId ?? "");
  const places = placesQuery.data?.data.items ?? [];
  const deleteMutation = useDeletePlace();
  const total = placesQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const selectedPlace = useMemo(
    () => placeDetailQuery.data?.data ?? null,
    [placeDetailQuery.data?.data]
  );

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch("");
      setPage(1);
      setEditingPlaceId(null);
    }

    setOpenModalId(nextOpen ? "place-manage" : null);
  };

  const handleDeletePlace = async (placeId: string) => {
    if (!window.confirm("이 장소를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(placeId);
    } catch (error) {
      console.error("장소 삭제 실패:", error);
    }

    if (editingPlaceId === placeId) {
      setEditingPlaceId(null);
    }
  };

  return (
    <Dialog
      open={openModalId === "place-manage"}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          Place 관리
        </Button>
      </DialogTrigger>

      <DialogContent size="xl" className="border border-border">
        <DialogHeader
          title={
            <span className="text-lg font-semibold text-text">장소 관리</span>
          }
        />
        <DialogBody className="grid h-full gap-5 pt-0">
          <ManageEntityDialogLayout
            listTitle="장소 목록"
            listToolbar={
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="장소명 검색"
              />
            }
            editorTitle="장소 수정"
            editorDescription="수정할 장소를 목록에서 선택하면 아래에 폼이 열립니다."
            isLoading={placesQuery.isLoading}
            isEmpty={!places.length}
            emptyTitle="등록된 장소가 아직 없습니다."
            listContent={places.map((place) => (
              <ManagePlaceItem
                key={place.id}
                place={place}
                onClickEdit={(id) => setEditingPlaceId(id)}
                onClickDelete={handleDeletePlace}
                isMutating={
                  deleteMutation.isPending && editingPlaceId === place.id
                }
              />
            ))}
            listFooter={
              total > pageSize ? (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="pt-2"
                />
              ) : null
            }
            editorContent={
              selectedPlace ? (
                <PlaceForm
                  initialData={selectedPlace}
                  onCancel={() => setEditingPlaceId(null)}
                  onSuccess={() => setEditingPlaceId(null)}
                />
              ) : null
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

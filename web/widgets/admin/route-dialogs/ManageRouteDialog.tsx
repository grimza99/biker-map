import { AdminModalId } from "@/app/admin/page";
import { useRouteDetail } from "@/features/routes/model/use-route-detail";
import { useRoutes } from "@/features/routes/model/use-routes";
import { RouteForm } from "@/features/routes/ui/route-form";
import { useMemo, useState } from "react";

import { ManageRouteItem } from "@/features/admin/route";
import { ManageEntityDialogLayout } from "@/widgets/admin/manage-entity-dialog";
import { useDeleteRouteMutate } from "@/features/routes";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Input,
} from "@shared/ui";
import { useDebouncedValue } from "@/shared";

interface ManageRouteDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (id: AdminModalId | null) => void;
}

export function ManageRouteDialog({
  openModalId,
  setOpenModalId,
}: ManageRouteDialogProps) {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const routesQuery = useRoutes({
    search: debouncedSearch || undefined,
    limit: 50,
  });
  const routeDetailQuery = useRouteDetail(editingRouteId ?? "");
  const routes = routesQuery.data?.data.items ?? [];

  const deleteMutation = useDeleteRouteMutate();

  const selectedRoute = useMemo(
    () => routeDetailQuery.data?.data ?? null,
    [routeDetailQuery.data?.data]
  );

  const handleDeleteRoute = (routeId: string) => {
    if (window.confirm("이 경로를 삭제하시겠습니까?")) {
      try {
        deleteMutation.mutate(routeId);
      } catch (error) {
        console.error("라우트 삭제 실패:", error);
      }
    }
    if (editingRouteId === routeId) {
      setEditingRouteId(null);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch("");
      setEditingRouteId(null);
    }

    setOpenModalId(nextOpen ? "route-manage" : null);
  };

  return (
    <Dialog
      open={openModalId === "route-manage"}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          Route 관리
        </Button>
      </DialogTrigger>

      <DialogContent size="xl" className="border border-border">
        <DialogHeader
          title={
            <span className="text-lg font-semibold text-text">경로 관리</span>
          }
        />
        <DialogBody className="grid h-full gap-5 pt-0">
          <ManageEntityDialogLayout
            listTitle="경로 목록"
            listToolbar={
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="경로명 검색"
              />
            }
            editorTitle="라우트 수정"
            editorDescription="수정할 라우트를 목록에서 선택하면 아래에 폼이 열립니다."
            isLoading={routesQuery.isLoading}
            isEmpty={!routes.length}
            emptyTitle="등록된 라우트가 아직 없습니다."
            listContent={routes.map((route) => (
              <ManageRouteItem
                route={route}
                key={route.id}
                onClickEdit={(id) => setEditingRouteId(id)}
                onClickDelete={handleDeleteRoute}
                isMutating={
                  deleteMutation.isPending && editingRouteId === route.id
                }
              />
            ))}
            editorContent={
              selectedRoute ? (
                <RouteForm
                  initialData={selectedRoute}
                  submitLabel="경로 수정"
                  onCancel={() => setEditingRouteId(null)}
                  onSuccess={() => setEditingRouteId(null)}
                />
              ) : null
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

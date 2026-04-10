import { AdminModalId } from "@/app/admin/page";
import { useRouteDetail } from "@/features/routes/model/use-route-detail";
import { useRoutes } from "@/features/routes/model/use-routes";
import { RouteForm } from "@/features/routes/ui/route-form";
import { useMemo, useState } from "react";

import { ManageRouteItem, useDeleteRouteMutate } from "@/features/admin/route";
import {
  Button,
  DefaultCardContainer,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Divider,
  EmptyState,
  LoadingState,
} from "@shared/ui";

interface ManageRouteDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (id: AdminModalId | null) => void;
}

export function ManageRouteDialog({
  openModalId,
  setOpenModalId,
}: ManageRouteDialogProps) {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const routesQuery = useRoutes({ limit: 50 });
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

  return (
    <Dialog
      open={openModalId === "route-manage"}
      onOpenChange={(nextOpen) =>
        setOpenModalId(nextOpen ? "route-manage" : null)
      }
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
        <DialogBody className="grid gap-5 pt-0 h-full">
          <div className="flex gap-4 max-h-[calc(100vh-20%)]">
            <div className="flex flex-col gap-2">
              <DefaultCardContainer className="flex flex-col gap-3 min-h-[calc(100vh-25%)] overflow-y-scroll">
                <h3>경로 목록</h3>

                {routesQuery.isLoading && (
                  <LoadingState label="라우트를 불러오는 중" />
                )}
                {!routesQuery.isLoading && !routes.length && (
                  <EmptyState title="등록된 라우트가 아직 없습니다." />
                )}

                {routes.map((route) => (
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
              </DefaultCardContainer>
            </div>
            <Divider orientation="vertical" />
            <DefaultCardContainer className="min-h-[calc(100vh-25%)] gap-4 overflow-y-auto">
              <div className="grid gap-1">
                <h3 className="m-0 text-lg font-semibold text-text">
                  라우트 수정
                </h3>
                <p className="m-0 text-sm leading-6 text-muted">
                  수정할 라우트를 목록에서 선택하면 아래에 폼이 열립니다.
                </p>
              </div>
              {selectedRoute && (
                <RouteForm
                  initialData={selectedRoute}
                  submitLabel="경로 수정"
                  onCancel={() => setEditingRouteId(null)}
                />
              )}
            </DefaultCardContainer>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

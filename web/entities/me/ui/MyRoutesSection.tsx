"use client";

import { RouteCard } from "@/entities/route";
import { useDeleteRouteMutate } from "@/features/routes/model/use-route";
import { RouteForm } from "@/features/routes/ui/route-form";
import { useMyRoutes } from "@features/me/model/use-my-routes";
import { useRouteDetail } from "@features/routes/model/use-route-detail";
import type { RouteRegion } from "@package-shared/types/route";
import { queryKeys } from "@shared/config/query-keys";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const regionLabelMap: Record<RouteRegion, string> = {
  all: "전체",
  seoul: "서울",
  busan: "부산",
  daegu: "대구",
  incheon: "인천",
  gwangju: "광주",
  daejeon: "대전",
  ulsan: "울산",
  sejong: "세종",
  jeju: "제주",
};

export function MyRoutesSection() {
  const myRoutesQuery = useMyRoutes();
  const routes = myRoutesQuery.data?.data.items ?? [];
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const deleteRouteMutation = useDeleteRouteMutate();
  const queryClient = useQueryClient();
  const editingRouteQuery = useRouteDetail(editingRouteId ?? "");

  if (myRoutesQuery.isLoading) {
    return <LoadingState label="내가 만든 경로를 불러오는 중" />;
  }

  if (myRoutesQuery.isError) {
    return (
      <ErrorState
        title="내가 만든 경로를 불러오지 못했습니다"
        message={
          myRoutesQuery.error instanceof Error
            ? myRoutesQuery.error.message
            : undefined
        }
      />
    );
  }

  if (!routes.length) {
    return (
      <EmptyState
        title="아직 만든 경로가 없습니다"
        message="직접 만든 드라이브 경로가 여기 표시됩니다."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {actionError ? (
        <ErrorState title="경로 작업에 실패했습니다" message={actionError} />
      ) : null}

      {routes.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}

      <Dialog
        open={Boolean(editingRouteId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRouteId(null);
            setActionError(null);
          }
        }}
      >
        <DialogContent size="lg">
          <DialogHeader title="경로 수정" />
          <DialogBody>
            {editingRouteQuery.isLoading ? (
              <LoadingState label="경로 정보를 불러오는 중" />
            ) : editingRouteQuery.isError ? (
              <ErrorState
                title="경로 정보를 불러오지 못했습니다"
                message={
                  editingRouteQuery.error instanceof Error
                    ? editingRouteQuery.error.message
                    : undefined
                }
              />
            ) : editingRouteQuery.data?.data ? (
              <RouteForm
                initialData={editingRouteQuery.data.data}
                submitLabel="경로 수정"
                onCancel={() => setEditingRouteId(null)}
                onSuccess={async () => {
                  setEditingRouteId(null);
                  await queryClient.invalidateQueries({
                    queryKey: queryKeys.myRoutes(),
                  });
                }}
              />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

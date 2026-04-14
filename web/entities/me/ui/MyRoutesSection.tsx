"use client";

import { RouteForm } from "@/features/routes/ui/route-form";
import { useMyRoutes } from "@features/me/model/use-my-routes";
import { useRouteDetail } from "@features/routes/model/use-route-detail";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@shared/ui";
import { useState } from "react";
import { MyRouteCard } from "./MyRouteCard";

export function MyRoutesSection() {
  const myRoutesQuery = useMyRoutes();
  const routes = myRoutesQuery.data?.data.items ?? [];
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

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
      {routes.map((route) => (
        <div key={route.id} className="relative">
          <MyRouteCard
            key={route.id}
            route={route}
            onEdit={(id) => setEditingRouteId(id)}
          />
        </div>
      ))}

      <Dialog
        open={Boolean(editingRouteId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRouteId(null);
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
                onSuccess={() => {
                  setEditingRouteId(null);
                }}
              />
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

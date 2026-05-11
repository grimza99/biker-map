"use client";

import { useMyRoutes } from "@features/me/model/use-my-routes";
import { useRouteDetail } from "@features/routes/model/use-route-detail";
import { Button, Dialog, DialogBody, DialogContent, DialogHeader, EmptyState, ErrorState, LoadingState } from "@shared/ui";
import { RouteForm, UserRouteForm } from "@/features/routes";
import { useState } from "react";
import { MyRouteCard } from "./MyRouteCard";

export function MyRoutesSection() {
  const myRoutesQuery = useMyRoutes();
  const routes = myRoutesQuery.data?.data.items ?? [];
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const editingRouteQuery = useRouteDetail(editingRouteId ?? "");
  const editingRoute = editingRouteQuery.data?.data;

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
      <div className="grid gap-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateOpen(true)}>내 경로 등록</Button>
        </div>
        <EmptyState
          title="아직 만든 경로가 없습니다"
          message="직접 만든 드라이브 경로가 여기 표시됩니다."
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent size="lg">
            <DialogHeader title="내 경로 등록" />
            <DialogBody>
              <UserRouteForm
                submitLabel="경로 등록"
                onCancel={() => setIsCreateOpen(false)}
                onSuccess={() => setIsCreateOpen(false)}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>내 경로 등록</Button>
      </div>
      {routes.map((route) => (
        <div key={route.id} className="relative">
          <MyRouteCard
            key={route.id}
            route={route}
            onEdit={(id) => setEditingRouteId(id)}
          />
        </div>
      ))}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent size="lg">
          <DialogHeader title="내 경로 등록" />
          <DialogBody>
            <UserRouteForm
              submitLabel="경로 등록"
              onCancel={() => setIsCreateOpen(false)}
              onSuccess={() => setIsCreateOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

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
            ) : editingRoute ? (
              editingRoute.sourceType === "user" ? (
                <UserRouteForm
                  initialData={editingRoute}
                  submitLabel="경로 수정"
                  onCancel={() => setEditingRouteId(null)}
                  onSuccess={() => {
                    setEditingRouteId(null);
                  }}
                />
              ) : (
                <RouteForm
                  initialData={editingRoute}
                  submitLabel="경로 수정"
                  onCancel={() => setEditingRouteId(null)}
                  onSuccess={() => {
                    setEditingRouteId(null);
                  }}
                />
              )
            ) : null}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

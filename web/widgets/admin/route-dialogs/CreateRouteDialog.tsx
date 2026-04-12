import { AdminModalId } from "@/app/admin/page";
import { RouteForm } from "@/features/routes/ui/route-form";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared";

interface CreateRouteDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (modalId: AdminModalId | null) => void;
}

export function CreateRouteDialog({
  openModalId,
  setOpenModalId,
}: CreateRouteDialogProps) {
  return (
    <Dialog
      open={openModalId === "route-create"}
      onOpenChange={(nextOpen) =>
        setOpenModalId(nextOpen ? "route-create" : null)
      }
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          Route 등록
        </Button>
      </DialogTrigger>

      <DialogContent
        size="lg"
        className="border border-border min-h-[calc(100vh-20%)]"
      >
        <DialogHeader
          title={
            <span className="text-lg font-semibold text-text">경로 등록</span>
          }
        />
        <DialogBody className="pt-0">
          <RouteForm
            onSuccess={() => setOpenModalId(null)}
            onCancel={() => setOpenModalId(null)}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

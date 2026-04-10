import { AdminModalId } from "@/app/admin/page";
import { PlaceForm } from "@/features/admin";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogTrigger,
} from "@/shared";

interface CreatePlaceDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (id: AdminModalId | null) => void;
}
export function CreatePlaceDialog({
  openModalId,
  setOpenModalId,
}: CreatePlaceDialogProps) {
  return (
    <Dialog
      open={openModalId === "place-create"}
      onOpenChange={() => setOpenModalId("place-create")}
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          Place 등록
        </Button>
      </DialogTrigger>
      <DialogContent size="lg" className="border border-border">
        <DialogBody className="pt-5">
          <PlaceForm
            onSuccess={() => setOpenModalId(null)}
            onCancel={() => setOpenModalId(null)}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

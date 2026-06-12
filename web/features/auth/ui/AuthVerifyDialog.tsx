import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/shared";

interface IAuthVerifyDialogProps {
  open: boolean;
  onOpenChange: () => void;
}
export default function AuthVerifyDialog({
  open,
  onOpenChange,
}: IAuthVerifyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title="핸드폰 본인 인증" />
        <DialogBody>
          <></>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

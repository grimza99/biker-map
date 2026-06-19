"use client";

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  Input,
} from "@/shared";
import { useRemainingTime } from "@/shared/hooks";
import { ChangeEvent, useState } from "react";

import {
  useSendSMSVerificationCodeMutation,
  useVerifyMuation,
} from "../model/use-sms-verify-mutation";

interface IAuthVerifyDialogProps {
  open: boolean;
  onOpenChange: () => void;
}

export function AuthVerifyDialog({
  open,
  onOpenChange,
}: IAuthVerifyDialogProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const { mutateAsync: sendSMSMutation, data } =
    useSendSMSVerificationCodeMutation({
      phone,
    });
  const { mutateAsync: checkCodeMutation } = useVerifyMuation({
    phone,
    code,
  });
  const { timerText, remainingSeconds } = useRemainingTime(
    data?.data.expiresAt
  );

  const handleChangePhoneNumber = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const value = e.target.value;
    setPhone(value.replace(/\D/g, "").trim());
  };

  const handleSMSSendSubmit = async () => {
    await sendSMSMutation();
  };

  const handleVerifyCodeSubmit = async () => {
    await checkCodeMutation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title="핸드폰 본인 인증" />
        <DialogBody>
          <div className="flex flex-col gap-4">
            <form
              className="flex items-end justify-between gap-3"
              action={handleSMSSendSubmit}
            >
              <Input
                label="핸드폰 번호"
                className="flex-1"
                value={phone}
                onChange={handleChangePhoneNumber}
              />
              <Button type="submit" disabled={phone.length < 1}>
                {remainingSeconds > 0 ? "재발송" : "발송"}
              </Button>
            </form>
            <form
              className="flex items-center justify-between gap-3"
              action={handleVerifyCodeSubmit}
            >
              <div className="flex-1">
                <Input
                  label="코드 확인"
                  className="flex-1"
                  disabled={remainingSeconds < 1}
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                />
                {remainingSeconds > 0 && (
                  <div className="ml-2 flex gap-2">
                    <span className="text-muted">
                      3분안에 인증을 완료해 주세요
                    </span>
                    <strong className="text-accent">{timerText}</strong>
                  </div>
                )}
              </div>
              <Button disabled={remainingSeconds < 1} type="submit">
                확인
              </Button>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

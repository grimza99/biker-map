"use client";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  SendVerificationCodeFormValues,
  VerifyCodeFormValues,
} from "@package-shared/schemas";

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  Input,
} from "@/shared";
import { useRemainingTime } from "@/shared/hooks";

import { sendVerificationCodeFormSchema, verifyCodeFormSchema } from "../model";
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
  const phoneForm = useForm<SendVerificationCodeFormValues>({
    resolver: zodResolver(sendVerificationCodeFormSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
    },
  });
  const verifyForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeFormSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
      code: "",
    },
  });
  const phone =
    useWatch({
      control: phoneForm.control,
      name: "phone",
    }) ?? "";
  const code =
    useWatch({
      control: verifyForm.control,
      name: "code",
    }) ?? "";

  const {
    mutateAsync: sendSMSMutation,
    data,
    isPending: isSendPending,
  } = useSendSMSVerificationCodeMutation({
    phone,
  });
  const { mutateAsync: checkCodeMutation, isPending: isVerifyPending } =
    useVerifyMuation({
      phone,
      code,
    });
  const { timerText, remainingSeconds } = useRemainingTime(
    data?.data.expiresAt
  );

  useEffect(() => {
    verifyForm.setValue("phone", phone, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [phone, verifyForm]);

  const submitSendCode = phoneForm.handleSubmit(async () => {
    await sendSMSMutation();
  });

  const submitVerifyCode = verifyForm.handleSubmit(async () => {
    const isPhoneValid = await phoneForm.trigger("phone");
    if (!isPhoneValid) {
      return;
    }

    await checkCodeMutation();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title="핸드폰 본인 인증" />
        <DialogBody>
          <div className="flex flex-col gap-4">
            <form
              className="flex items-end justify-between gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submitSendCode();
              }}
              noValidate
            >
              <Input
                label="핸드폰 번호"
                className="flex-1"
                inputMode="numeric"
                errorText={phoneForm.formState.errors.phone?.message}
                {...phoneForm.register("phone", {
                  setValueAs: (value) =>
                    String(value ?? "")
                      .replace(/\D/g, "")
                      .trim(),
                })}
              />
              <Button
                type="submit"
                loading={isSendPending}
                disabled={!phoneForm.formState.isValid || isSendPending}
              >
                {remainingSeconds > 0 ? "재발송" : "발송"}
              </Button>
            </form>
            <form
              className="flex items-center justify-between gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submitVerifyCode();
              }}
              noValidate
            >
              <div className="flex-1">
                <Input
                  label="코드 확인"
                  className="flex-1"
                  disabled={remainingSeconds < 1}
                  inputMode="numeric"
                  errorText={
                    verifyForm.formState.errors.code?.message ??
                    phoneForm.formState.errors.phone?.message
                  }
                  {...verifyForm.register("code", {
                    setValueAs: (value) =>
                      String(value ?? "")
                        .replace(/\D/g, "")
                        .trim(),
                  })}
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
              <Button
                disabled={
                  remainingSeconds < 1 ||
                  !verifyForm.formState.isValid ||
                  isVerifyPending
                }
                loading={isVerifyPending}
                type="submit"
              >
                확인
              </Button>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

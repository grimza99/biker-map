import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import {
  phoneSchema,
  type SendVerificationCodeFormValues,
  type VerifyCodeFormValues,
  verifyCodeSchema,
} from "@package-shared/index";

import { AppText, Button, Input } from "@/shared";
import { AppModal } from "@/widgets/ui";
import { useRemainingTime } from "../hook";
import { useSendSMSVerificationCodeMutation, useVerifyMuation } from "../model";

interface IAuthVerifyDialogProps {
  open: boolean;
  onOpenChange: () => void;
  onSuccess: () => void;
}
export function AuthVerifyDialog({
  open,
  onOpenChange,
  onSuccess,
}: IAuthVerifyDialogProps) {
  const phoneForm = useForm<SendVerificationCodeFormValues>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
    },
  });
  const verifyForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    mode: "onChange",
    defaultValues: {
      phone: "",
      code: "",
    },
  });
  const {
    mutateAsync: sendSMSMutation,
    data,
    isPending: isSending,
  } = useSendSMSVerificationCodeMutation();
  const { mutateAsync: checkCodeMutation, isPending: isVerifying } =
    useVerifyMuation();
  const { timerText, remainingSeconds } = useRemainingTime(
    data?.data.expiresAt
  );
  const handleSMSSendSubmit = phoneForm.handleSubmit(async (values) => {
    try {
      const normalizedPhone = values.phone.replace(/\D/g, "").trim();
      const payload = {
        phone: normalizedPhone,
      };

      phoneForm.setValue("phone", normalizedPhone, {
        shouldDirty: true,
        shouldValidate: true,
      });
      verifyForm.setValue("phone", normalizedPhone, {
        shouldDirty: true,
        shouldValidate: true,
      });

      await sendSMSMutation(payload);
    } catch {
      // mutation onError에서 사용자 피드백을 처리하고, 이벤트 핸들러에서는 rejection만 소비한다.
    }
  });

  const handleVerifyCodeSubmit = verifyForm.handleSubmit(async (values) => {
    try {
      const normalizedPayload = {
        phone: values.phone.replace(/\D/g, "").trim(),
        code: values.code.trim(),
      };

      verifyForm.setValue("phone", normalizedPayload.phone, {
        shouldDirty: true,
        shouldValidate: true,
      });
      verifyForm.setValue("code", normalizedPayload.code, {
        shouldDirty: true,
        shouldValidate: true,
      });

      await checkCodeMutation(normalizedPayload);
      onSuccess();
    } catch {
      // mutation onError에서 사용자 피드백을 처리하고, 이벤트 핸들러에서는 rejection만 소비한다.
    }
  });

  return (
    <AppModal
      visible={open}
      onClose={onOpenChange}
      title="핸드폰 본인 인증"
      bodyClassName="py-5"
    >
      <View className="flex flex-col gap-10">
        <View className="flex flex-row items-end gap-3">
          <Controller
            control={phoneForm.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Input
                label="핸드폰 번호"
                className="flex-1"
                editable={!isSending && !isVerifying}
                keyboardType="number-pad"
                onBlur={field.onBlur}
                onChangeText={(value) => {
                  const normalizedValue = value.replace(/\D/g, "").trim();
                  field.onChange(normalizedValue);
                  verifyForm.setValue("phone", normalizedValue, {
                    shouldDirty: true,
                    shouldValidate: verifyForm.formState.submitCount > 0,
                  });
                }}
                value={field.value}
                errorText={fieldState.error?.message}
              />
            )}
          />
          <Button
            disabled={!phoneForm.formState.isValid || isSending || isVerifying}
            loading={isSending}
            onPress={() => void handleSMSSendSubmit()}
          >
            {remainingSeconds > 0 ? "재발송" : "발송"}
          </Button>
        </View>
        <View className="flex flex-row items-end gap-3">
          <Controller
            control={verifyForm.control}
            name="code"
            render={({ field, fieldState }) => (
              <Input
                label="코드 확인"
                className="flex-1"
                disabled={remainingSeconds < 1}
                editable={!isSending && !isVerifying}
                keyboardType="number-pad"
                onBlur={field.onBlur}
                onChangeText={(value) => field.onChange(value.trim())}
                value={field.value}
                errorText={fieldState.error?.message}
              />
            )}
          />
          <Button
            disabled={
              remainingSeconds < 1 ||
              !verifyForm.formState.isValid ||
              isSending ||
              isVerifying
            }
            loading={isVerifying}
            onPress={() => void handleVerifyCodeSubmit()}
          >
            확인
          </Button>
        </View>
        {remainingSeconds > 0 && (
          <View className="ml-2 flex flex-row gap-2">
            <AppText className="text-sm" tone="muted">
              3분안에 인증을 완료해 주세요
            </AppText>
            <AppText className="text-accent font-bold">{timerText}</AppText>
          </View>
        )}
      </View>
    </AppModal>
  );
}

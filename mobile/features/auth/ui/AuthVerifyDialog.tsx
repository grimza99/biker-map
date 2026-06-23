import { useState } from "react";

import { AppText, Button, CommonModal, Input } from "@/components/common";
import { useRemainingTime } from "../hook";
import { useSendSMSVerificationCodeMutation, useVerifyMuation } from "../model";
import { TextInputChangeEvent, View } from "react-native";

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
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const { mutateAsync: sendSMSMutation, data } =
    useSendSMSVerificationCodeMutation({
      phone,
    });
  const { mutateAsync: checkCodeMutation } = useVerifyMuation({ phone, code });
  const { timerText, remainingSeconds } = useRemainingTime(
    data?.data.expiresAt
  );

  const handleChangePhoneNumber = (e: TextInputChangeEvent) => {
    const value = e.nativeEvent.text;
    setPhone(value.replace(/\D/g, "").trim());
  };

  const handleSMSSendSubmit = async () => {
    await sendSMSMutation();
  };

  const handleVerifyCodeSubmit = async () => {
    await checkCodeMutation();
    onSuccess();
  }

  return (
    <CommonModal
      visible={open}
      onClose={onOpenChange}
      title="핸드폰 본인 인증"
      bodyClassName="py-5"
    >
      <View className="flex flex-col gap-10">
        <View className="flex flex-row items-end gap-3">
          <Input
            label="핸드폰 번호"
            className="flex-1"
            value={phone}
            onChange={handleChangePhoneNumber}
          />
          <Button disabled={phone.length < 1} onPress={handleSMSSendSubmit}>
            {remainingSeconds > 0 ? "재발송" : "발송"}
          </Button>
        </View>
        <View className="flex flex-row items-end gap-3">
          <Input
            label="코드 확인"
            className="flex-1"
            disabled={remainingSeconds < 1}
            value={code}
            onChange={(e) => setCode(e.nativeEvent.text.trim())}
          />
          <Button
            disabled={remainingSeconds < 1}
            onPress={handleVerifyCodeSubmit}
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
    </CommonModal>
  );
}

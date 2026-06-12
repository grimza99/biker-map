import { AppText, Button, CommonModal } from "@/components/common";
import { useDeleteAccount } from "@/features/auth";
import { Ionicons } from "@expo/vector-icons";
import { bikerMapTheme } from "@package-shared/constants";
import { View } from "react-native";

interface IDeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function DeleteAccountModal({
  isOpen,
  onClose,
}: IDeleteAccountModalProps) {
  const { mutateAsync: deleteAccount } = useDeleteAccount();

  const handleClickDeleteAccount = async () => {
    await deleteAccount();
  };
  return (
    <CommonModal
      icon={
        <View className="border-danger border rounded-2xl py-3.5 px-3.5 bg-danger/25">
          <Ionicons
            name="warning"
            size={24}
            color={bikerMapTheme.colors.accent}
          />
        </View>
      }
      visibleCloseButton={false}
      visible={isOpen}
      title="회원 탈퇴를 진행할까요?"
      description="탈퇴 시 저장된 추천 경로, 작성하신 게시글의 소유 권한이 삭제되며 복구할 수 없습니다. 정말로 탈퇴 절차를 진행할까요?"
      onClose={onClose}
      footer={
        <View className="flex flex-row gap-2 items-center">
          <Button variant="secondary" onPress={onClose}>
            <AppText>취소</AppText>
          </Button>
          <Button onPress={handleClickDeleteAccount}>
            <AppText className="text-white">탈퇴하기</AppText>
          </Button>
        </View>
      }
    />
  );
}

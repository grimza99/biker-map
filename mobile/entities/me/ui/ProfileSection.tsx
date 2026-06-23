import { View } from "react-native";
import { proficiencyMap } from "@package-shared/model";

import { AppText, Button } from "@/components/common";
import { useSession } from "@/features/session/model";
import { ProfileForm } from "@/features/me";
import { AuthVerifyDialog } from "@/features/auth/ui/AuthVerifyDialog";
import { useState } from "react";

interface IProfileSection {
  isEdit?: boolean;
}

export function ProfileSection({ isEdit = false }: IProfileSection) {
  const { user } = useSession();
  const [openVerifyModal, setOpenVerifyModal] = useState(false);
  if (!user) return null;

  const { name, email, phone, proficiency, bikeBrand, bikeModel } = user;
  const proficiencyLabel = proficiency ? proficiencyMap[proficiency] : null;

  const ProfileSectionItems = [
    { label: "이름", value: name },
    { label: "이메일", value: email },
    { label: "휴대폰 번호", value: phone },
    { label: "숙련도", value: proficiencyLabel },
    { label: "브랜드", value: bikeBrand },
    { label: "모델명", value: bikeModel },
  ];
  return (
    <>
      <View className="border border-border rounded-2xl p-5 bg-panel-soft">
        {isEdit ? (
          <ProfileForm currenValue={user} />
        ) : (
          <>
            {ProfileSectionItems.map((item, idx) => (
              <View className="flex flex-col gap-3" key={item.label}>
                <ProfileSectionItem label={item.label} value={item.value} />
                {idx !== ProfileSectionItems.length - 1 && (
                  <View className="w-full h-0.5 bg-border mb-2" />
                )}
              </View>
            ))}
          </>
        )}

        <AuthVerifyDialog
          open={openVerifyModal}
          onOpenChange={() => {
            setOpenVerifyModal(false);
          }}
          onSuccess={() => {
            setOpenVerifyModal(false);
          }}
        />
      </View>
      {!user.isVerified && (
        <Button variant="secondary" onPress={() => setOpenVerifyModal(true)}>
          핸드폰 본인인증 하기
        </Button>
      )}
    </>
  );
}

interface IProfileSectionItem {
  label: string;
  value: string | undefined | null;
}
function ProfileSectionItem({ label, value }: IProfileSectionItem) {
  return (
    <View className="flex flex-row items-center justify-between">
      <AppText tone="muted" className="font-bold text-lg">
        {label}
      </AppText>
      <AppText className="font-semibold text-lg">
        {value || "정보 없음"}
      </AppText>
    </View>
  );
}

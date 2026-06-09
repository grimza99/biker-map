import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { cn } from "@/shared";
import { AppText, CommonModal } from "../common";

export type NotificationItem = {
  id: string;
  title: string;
  summary: string;
  time: string;
  unread: boolean;
};

type NotificationSheetProps = {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
};

export function NotificationSheet({
  visible,
  notifications,
  onClose,
  onMarkAllRead,
}: NotificationSheetProps) {
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <CommonModal
      visible={visible}
      title="알림"
      eyebrow="Notifications"
      description={
        unreadCount > 0
          ? `읽지 않은 알림 ${unreadCount}개`
          : "읽지 않은 알림이 없습니다."
      }
      onClose={onClose}
      icon={
        <Ionicons
          name="notifications-outline"
          size={18}
          color={bikerMapTheme.colors.text}
        />
      }
      headerAction={
        <Pressable
          className="flex-row items-center gap-1.5 rounded-full bg-text px-3.5 py-2.5"
          onPress={onMarkAllRead}
        >
          <Ionicons
            name="checkmark-done"
            size={16}
            color={bikerMapTheme.colors.bg}
          />
          <AppText className="text-[13px] font-extrabold text-bg">
            모두 읽음
          </AppText>
        </Pressable>
      }
      variant="sheet"
      contentContainerClassName="min-h-[440px]"
      bodyClassName="flex-1 gap-2.5"
    >
      <AppText className="text-xs font-bold uppercase tracking-[1px] text-active">
        최신 알림
      </AppText>

      <ScrollView
        contentContainerClassName="gap-2.5 pb-0.5 pt-1"
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => (
          <View
            key={item.id}
            className="flex-row items-start justify-between gap-3 rounded-[20px] border border-border bg-panel-solid p-3.5"
          >
            <View className="flex-1 gap-1.5">
              <View className="flex-row items-center gap-2">
                <View
                  className={cn(
                    "h-2 w-2 rounded-full bg-panel-soft",
                    item.unread && "bg-accent"
                  )}
                />
                <AppText className="text-[15px] font-extrabold">
                  {item.title}
                </AppText>
              </View>
              <AppText className="text-[13px] leading-4.5" tone="muted">
                {item.summary}
              </AppText>
            </View>
            <AppText className="text-xs font-bold text-active">
              {item.time}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </CommonModal>
  );
}

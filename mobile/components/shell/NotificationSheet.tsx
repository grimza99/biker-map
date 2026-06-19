import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { CommonModal } from "../common";

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

export function NotificationSheet({ visible, notifications, onClose, onMarkAllRead }: NotificationSheetProps) {
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <CommonModal
      visible={visible}
      title="알림"
      eyebrow="Notifications"
      description={unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "읽지 않은 알림이 없습니다."}
      onClose={onClose}
      icon={<Ionicons name="notifications-outline" size={18} color={bikerMapTheme.colors.text} />}
      headerAction={
        <Pressable style={styles.headerAction} onPress={onMarkAllRead}>
          <Ionicons name="checkmark-done" size={16} color={bikerMapTheme.colors.bg} />
          <Text style={styles.markAllButtonText}>모두 읽음</Text>
        </Pressable>
      }
      variant="sheet"
      contentContainerStyle={styles.sheet}
      bodyStyle={styles.content}
    >
      <Text style={styles.sectionLabel}>최신 알림</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemMeta}>
              <View style={styles.row}>
                <View style={[styles.statusDot, item.unread && styles.statusDotUnread]} />
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.itemSummary}>{item.summary}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </CommonModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    minHeight: 440,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  markAllButtonText: {
    color: bikerMapTheme.colors.bg,
    fontSize: 13,
    fontWeight: "800",
  },
  content: {
    gap: 10,
    flex: 1,
  },
  sectionLabel: {
    color: bikerMapTheme.colors.active,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  list: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 14,
  },
  itemMeta: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  statusDotUnread: {
    backgroundColor: bikerMapTheme.colors.accent,
  },
  itemTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  itemSummary: {
    color: bikerMapTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: bikerMapTheme.colors.active,
    fontSize: 12,
    fontWeight: "700",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <View style={styles.iconBubble}>
                <Ionicons name="notifications-outline" size={18} color={bikerMapTheme.colors.text} />
              </View>
              <View>
                <Text style={styles.eyebrow}>Notifications</Text>
                <Text style={styles.title}>알림</Text>
              </View>
            </View>

            <Pressable style={styles.markAllButton} onPress={onMarkAllRead}>
              <Ionicons name="checkmark-done" size={16} color={bikerMapTheme.colors.bg} />
              <Text style={styles.markAllButtonText}>모두 읽음</Text>
            </Pressable>
          </View>

          <Text style={styles.summary}>
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "읽지 않은 알림이 없습니다."}
          </Text>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 6, 11, 0.64)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  sheet: {
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  handle: {
    alignSelf: "center",
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBubble: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
  },
  eyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  markAllButton: {
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
  summary: {
    color: bikerMapTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 4,
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

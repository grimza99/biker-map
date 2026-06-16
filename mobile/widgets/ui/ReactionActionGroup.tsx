import { Feather } from "@expo/vector-icons";
import {
  bikerMapTheme,
  type ReactionSummary,
  type ReactionType,
} from "@package-shared/index";
import { View } from "react-native";

import { Button } from "@/components/common";

type ReactionActionGroupProps = {
  reactions: ReactionSummary;
  disabled?: boolean;
  onToggle: (reaction: ReactionType) => void;
};

type ReactionButtonConfig = {
  iconName: "thumbs-up" | "thumbs-down";
  reaction: ReactionType;
  selected: boolean;
  count: number;
};

export function ReactionActionGroup({
  reactions,
  disabled,
  onToggle,
}: ReactionActionGroupProps) {
  const actions: ReactionButtonConfig[] = [
    {
      iconName: "thumbs-up",
      reaction: "like",
      selected: reactions.myReaction === "like",
      count: reactions.likeCount,
    },
    {
      iconName: "thumbs-down",
      reaction: "dislike",
      selected: reactions.myReaction === "dislike",
      count: reactions.dislikeCount,
    },
  ];

  return (
    <View className="flex-row items-center gap-1.5">
      {actions.map((action) => (
        <Button
          key={action.reaction}
          size="sm"
          variant="ghost"
          selected={action.selected}
          disabled={disabled}
          onPress={() => onToggle(action.reaction)}
          textStyle={{ fontSize: 12 }}
        >
          <Feather
            name={action.iconName}
            size={16}
            color={
              action.selected
                ? bikerMapTheme.colors.accent
                : bikerMapTheme.colors.muted
            }
          />
        </Button>
      ))}
    </View>
  );
}

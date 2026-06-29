import { FontAwesome } from "@expo/vector-icons";
import { bikerMapTheme } from "@package-shared/index";

import { Button } from "@/components/common";

type FavoriteActionButtonProps = {
  postId: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function FavoriteActionButton({
  selected = false,
  disabled,
  onClick,
}: FavoriteActionButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      selected={selected}
      disabled={disabled}
      onPress={onClick}
    >
      <FontAwesome
        name={selected ? "heart" : "heart-o"}
        size={18}
        color={
          selected ? bikerMapTheme.colors.accent : bikerMapTheme.colors.text
        }
      />
    </Button>
  );
}

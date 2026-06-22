import { View } from "react-native";
import { cn } from "../lib";

export function Divider({
  orientation = "horizontal",
  subtle = false,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  subtle?: boolean;
  className?: string;
}) {
  return (
    <View
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full"
          : "h-full min-h-6 w-px self-stretch",
        subtle ? "bg-border/55" : "bg-border",
        className
      )}
    />
  );
}

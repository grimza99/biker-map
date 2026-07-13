import { Text, View } from "react-native";

import { getChipPaletteClass } from "@package-shared/index";

import { cn } from "@/shared";

function getChipTextClass(className: string) {
  const textClassName = className
    .split(" ")
    .filter((token) => token.startsWith("text-"))
    .at(-1);

  return textClassName ?? "text-text";
}

export function Chip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const paletteClassName = cn(getChipPaletteClass(label), className);

  return (
    <View
      className={cn(
        "self-start rounded-full border px-3 py-1",
        paletteClassName
      )}
    >
      <Text
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.08em]",
          getChipTextClass(paletteClassName)
        )}
      >
        {label}
      </Text>
    </View>
  );
}

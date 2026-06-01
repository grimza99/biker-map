const chipPalette = [
  "border-accent/25 bg-accent/10 text-accent",
  "border-info/25 bg-info/10 text-info",
  "border-active/25 bg-active/10 text-active",
  "border-warning/25 bg-warning/10 text-warning",
  "border-border bg-panel-soft text-text/88",
];

export function getChipPaletteClass(label: string) {
  const hash = Array.from(label).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0
  );

  return chipPalette[hash % chipPalette.length];
}

import { Chip } from "./Chip";

export function TagChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return <Chip label={`# ${label}`} className={className} />;
}

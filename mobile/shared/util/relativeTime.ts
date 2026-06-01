import dayjs from "@/shared/lib/day-js";

export function formatRelative(date: string) {
  const target = dayjs(date);

  const diffSeconds = dayjs().diff(target, "second");

  if (diffSeconds < 60) {
    return "방금 전";
  }

  return target.fromNow();
}

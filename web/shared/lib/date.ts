type DateFormatType =
  | "iso"
  | "date"
  | "dateTime"
  | "time"
  | "relative"
  | "monthDay"
  | "yearMonthDay";
export function formatDateByType(date: string, type: DateFormatType) {
  const target = new Date(date);

  if (Number.isNaN(target.getTime())) {
    return "";
  }

  switch (type) {
    case "iso":
      return target.toISOString();
    case "date":
      return target.toLocaleDateString("ko-KR");
    case "dateTime":
      return target.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "time":
      return target.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "monthDay":
      return target.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    case "relative":
      return formatRelativeLabel(target);
    default:
      return target.toLocaleString("ko-KR");
  }
}

export function formatRelativeLabel(input: string | Date, now = new Date()) {
  const target = input instanceof Date ? input : new Date(input);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return target.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

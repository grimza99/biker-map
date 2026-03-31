export function formatIsoDate(date = new Date()) {
  return date.toISOString();
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
    day: "numeric"
  });
}


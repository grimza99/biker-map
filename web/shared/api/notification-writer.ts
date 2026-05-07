import { createSupabaseServiceClient } from "@shared/lib/supabase";

type BaseNotificationInput = {
  userId: string;
  title: string;
  message: string;
  kind: "comment" | "reply" | "reaction" | "system";
  sourceType: "post" | "comment" | "system";
  sourcePostId?: string | null;
  sourceCommentId?: string | null;
  url?: string | null;
};

export async function createNotification(input: BaseNotificationInput) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    kind: input.kind,
    source_type: input.sourceType,
    source_post_id: input.sourcePostId ?? null,
    source_comment_id: input.sourceCommentId ?? null,
    title: input.title,
    message: input.message,
    url: input.url ?? null,
    unread: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createNotifications(inputs: BaseNotificationInput[]) {
  const uniqueByKey = new Map<string, BaseNotificationInput>();

  for (const input of inputs) {
    if (!input.userId) {
      continue;
    }

    const key = [
      input.userId,
      input.kind,
      input.sourceType,
      input.sourcePostId ?? "",
      input.sourceCommentId ?? "",
      input.message,
    ].join(":");

    uniqueByKey.set(key, input);
  }

  const rows = Array.from(uniqueByKey.values());
  if (!rows.length) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("notifications").insert(
    rows.map((input) => ({
      user_id: input.userId,
      kind: input.kind,
      source_type: input.sourceType,
      source_post_id: input.sourcePostId ?? null,
      source_comment_id: input.sourceCommentId ?? null,
      title: input.title,
      message: input.message,
      url: input.url ?? null,
      unread: true,
    }))
  );

  if (error) {
    throw new Error(error.message);
  }
}

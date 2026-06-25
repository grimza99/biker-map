#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline";

const HELP_TEXT = `사용법
  node web/scripts/chat-debug-peer.mjs --email <email> --password <password> --target-user-id <uuid> [--base-url <url>]
  node web/scripts/chat-debug-peer.mjs --email <email> --password <password> --chat-id <uuid> [--base-url <url>]

필수 환경변수
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

대화 명령어
  /msg <text>        메시지 전송
  /typing on         typing 시작
  /typing off        typing 종료
  /read [messageId]  읽음 처리. messageId 생략 시 마지막 메시지 기준
  /leave             presence leave 전송 후 종료
  /status            현재 room / 마지막 메시지 정보 출력
  /help              도움말 출력
`;

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(HELP_TEXT);
  process.exit(0);
}

const baseUrl = args.baseUrl ?? process.env.CHAT_DEBUG_BASE_URL ?? "http://127.0.0.1:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!args.email || !args.password || (!args.targetUserId && !args.chatId)) {
  console.error(HELP_TEXT);
  process.exit(1);
}

if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 환경변수가 필요합니다."
  );
  process.exit(1);
}

const mobileHeaders = {
  "Content-Type": "application/json",
  "X-Client-Platform": "mobile",
};

const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: mobileHeaders,
  body: JSON.stringify({
    email: args.email,
    password: args.password,
  }),
});

if (!loginResponse.ok) {
  const errorBody = await safeJson(loginResponse);
  console.error("로그인 실패", loginResponse.status, errorBody);
  process.exit(1);
}

const loginBody = await loginResponse.json();
const accessToken = loginBody?.data?.accessToken;
const session = loginBody?.data?.session;

if (!accessToken || !session?.userId) {
  console.error("로그인 응답이 올바르지 않습니다.", loginBody);
  process.exit(1);
}

const authHeaders = {
  ...mobileHeaders,
  Authorization: `Bearer ${accessToken}`,
};

let room;
if (args.chatId) {
  const roomResponse = await fetch(
    `${baseUrl}/api/mobile/bikers/chats/${args.chatId}`,
    {
      headers: authHeaders,
    }
  );

  if (!roomResponse.ok) {
    const errorBody = await safeJson(roomResponse);
    console.error("채팅방 조회 실패", roomResponse.status, errorBody);
    process.exit(1);
  }

  room = (await roomResponse.json())?.data?.room;
} else {
  const ensureResponse = await fetch(`${baseUrl}/api/mobile/bikers/chats/direct`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      targetUserId: args.targetUserId,
    }),
  });

  if (!ensureResponse.ok) {
    const errorBody = await safeJson(ensureResponse);
    console.error("direct room 준비 실패", ensureResponse.status, errorBody);
    process.exit(1);
  }

  room = (await ensureResponse.json())?.data?.room;
}

if (!room?.id) {
  console.error("채팅방 응답이 올바르지 않습니다.", room);
  process.exit(1);
}

const realtimeConfigResponse = await fetch(
  `${baseUrl}/api/mobile/bikers/chats/${room.id}/realtime-config`,
  {
    headers: authHeaders,
  }
);

if (!realtimeConfigResponse.ok) {
  const errorBody = await safeJson(realtimeConfigResponse);
  console.error("realtime config 조회 실패", realtimeConfigResponse.status, errorBody);
  process.exit(1);
}

const realtimeConfig = (await realtimeConfigResponse.json())?.data;
if (!realtimeConfig?.channel) {
  console.error("realtime config 응답이 올바르지 않습니다.", realtimeConfig);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

supabase.realtime.setAuth(accessToken);

const state = {
  lastMessageId: room.lastMessage?.id ?? null,
  room,
  typing: false,
};

const channel = supabase.channel(realtimeConfig.channel, {
  config: {
    private: realtimeConfig.privateChannel ?? false,
  },
});

channel
  .on("broadcast", { event: "chat:message" }, ({ payload }) => {
    if (!payload?.message) {
      return;
    }

    state.lastMessageId = payload.message.id;
    printEvent("message", `${payload.message.author.nickname}: ${payload.message.body}`);
  })
  .on("broadcast", { event: "chat:typing" }, ({ payload }) => {
    printEvent(
      "typing",
      `${payload.userId} ${payload.isTyping ? "typing:on" : "typing:off"}`
    );
  })
  .on("broadcast", { event: "chat:presence" }, ({ payload }) => {
    printEvent("presence", `${payload.userId} ${payload.status}`);
  });

const subscribed = await new Promise((resolve) => {
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      resolve(true);
      return;
    }

    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      resolve(false);
    }
  });
});

if (!subscribed) {
  console.error("realtime subscribe 실패");
  process.exit(1);
}

console.log(
  `[peer] room=${room.id} user=${session.userId} nickname=${session.name ?? "unknown"} base=${baseUrl}`
);
console.log(HELP_TEXT);

await sendPresence("join");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "peer> ",
});

rl.prompt();

rl.on("line", async (line) => {
  const trimmed = line.trim();

  if (!trimmed) {
    rl.prompt();
    return;
  }

  try {
    if (trimmed === "/help") {
      console.log(HELP_TEXT);
    } else if (trimmed === "/status") {
      console.log({
        chatId: room.id,
        lastMessageId: state.lastMessageId,
        typing: state.typing,
      });
    } else if (trimmed === "/typing on") {
      state.typing = true;
      await sendTyping(true);
    } else if (trimmed === "/typing off") {
      state.typing = false;
      await sendTyping(false);
    } else if (trimmed === "/leave") {
      await shutdown();
      return;
    } else if (trimmed.startsWith("/msg ")) {
      const message = trimmed.slice("/msg ".length).trim();
      await sendMessage(message);
    } else if (trimmed.startsWith("/read")) {
      const messageId = trimmed.replace("/read", "").trim() || state.lastMessageId;
      await markRead(messageId);
    } else {
      await sendMessage(trimmed);
    }
  } catch (error) {
    console.error("[peer:error]", error instanceof Error ? error.message : error);
  }

  rl.prompt();
});

process.on("SIGINT", async () => {
  await shutdown();
});

async function sendMessage(body) {
  const response = await fetch(`${baseUrl}/api/mobile/bikers/chats/${room.id}/messages`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      body,
      clientMessageId: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    throw new Error(`메시지 전송 실패 (${response.status}) ${JSON.stringify(errorBody)}`);
  }

  const responseBody = await response.json();
  state.lastMessageId = responseBody?.data?.message?.id ?? state.lastMessageId;
  console.log("[peer] message sent");
}

async function markRead(lastReadMessageId) {
  const response = await fetch(`${baseUrl}/api/mobile/bikers/chats/${room.id}/read`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      lastReadMessageId: lastReadMessageId ?? null,
    }),
  });

  if (!response.ok) {
    const errorBody = await safeJson(response);
    throw new Error(`읽음 처리 실패 (${response.status}) ${JSON.stringify(errorBody)}`);
  }

  console.log("[peer] read updated", lastReadMessageId ?? "(latest)");
}

async function sendTyping(isTyping) {
  const result = await channel.send({
    type: "broadcast",
    event: "chat:typing",
    payload: {
      type: "chat:typing",
      roomId: room.id,
      userId: session.userId,
      isTyping,
      sentAt: new Date().toISOString(),
    },
  });

  if (result !== "ok") {
    throw new Error(`typing broadcast 실패: ${result}`);
  }
}

async function sendPresence(status) {
  const result = await channel.send({
    type: "broadcast",
    event: "chat:presence",
    payload: {
      type: "chat:presence",
      roomId: room.id,
      userId: session.userId,
      status,
      sentAt: new Date().toISOString(),
    },
  });

  if (result !== "ok") {
    throw new Error(`presence broadcast 실패: ${result}`);
  }
}

async function shutdown() {
  try {
    if (state.typing) {
      await sendTyping(false);
    }
    await sendPresence("leave");
  } catch {
    // 종료 중 실패는 무시한다.
  }

  rl.close();
  await supabase.removeChannel(channel);
  process.exit(0);
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      result.help = true;
      continue;
    }

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      result[key] = true;
      continue;
    }

    result[key] = value;
    index += 1;
  }

  return result;
}

async function safeJson(response) {
  return response.json().catch(() => null);
}

function printEvent(type, text) {
  process.stdout.write(`\n[peer:${type}] ${text}\n`);
}

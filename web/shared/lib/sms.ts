import "server-only";

import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import { getSmsServerEnv, type SmsProvider } from "@shared/config";

const SOLAPI_API_BASE_URL = "https://api.solapi.com";

type SendVerificationSmsInput = {
  phone: string;
  code: string;
};

type SendVerificationSmsResult = {
  provider: SmsProvider;
  requestId: string | null;
  sentAt: string;
};

type SolapiSendMessageResponse = {
  groupInfo?: {
    groupId?: string;
    dateCreated?: string;
  };
  failedMessageList?: Array<{
    statusCode?: string;
    statusMessage?: string;
  }>;
  messageList?: Array<{
    messageId?: string;
    statusCode?: string;
    statusMessage?: string;
  }>;
};

type SolapiErrorResponse = {
  errorCode?: string;
  errorMessage?: string;
};

export function createVerificationCode() {
  return String(randomInt(100000, 1_000_000));
}

export function hashVerificationCode(params: {
  userId: string;
  phone: string;
  code: string;
}) {
  const env = getSmsServerEnv();

  return createHmac("sha256", env.SMS_VERIFICATION_HMAC_SECRET)
    .update(`${params.userId}:${params.phone}:${params.code}`)
    .digest("hex");
}

export function isVerificationCodeMatched(params: {
  userId: string;
  phone: string;
  code: string;
  hashedCode: string;
}) {
  const nextHash = hashVerificationCode(params);
  const nextHashBuffer = Buffer.from(nextHash, "utf8");
  const currentHashBuffer = Buffer.from(params.hashedCode, "utf8");

  if (nextHashBuffer.length !== currentHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(nextHashBuffer, currentHashBuffer);
}

export async function sendVerificationSms({
  phone,
  code,
}: SendVerificationSmsInput): Promise<SendVerificationSmsResult> {
  const env = getSmsServerEnv();
  const requestPath = "/messages/v4/send-many/detail";
  const requestUrl = `${SOLAPI_API_BASE_URL}${requestPath}`;
  const sentAt = new Date().toISOString();
  const authHeader = createSolapiAuthorizationHeader({
    apiKey: env.SOLAPI_API_KEY,
    apiSecret: env.SOLAPI_API_SECRET,
    dateTime: sentAt,
  });

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      messages: [
        {
          to: phone,
          from: env.SMS_SENDER_PHONE,
          text: `[Biker Map] 인증번호는 [${code}] 입니다. 3분 안에 입력해 주세요.`,
          type: "SMS",
          country: "82",
        },
      ],
      strict: true,
      allowDuplicates: false,
      showMessageList: true,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | SolapiSendMessageResponse
    | SolapiErrorResponse
    | null;

  if (!response.ok) {
    throw new Error(getSolapiErrorMessage(payload));
  }

  const successPayload = isSolapiSendMessageResponse(payload) ? payload : null;
  const failedMessage = successPayload?.failedMessageList?.[0] ?? null;

  if (failedMessage) {
    throw new Error(
      failedMessage.statusMessage ?? "SMS 발송 접수에 실패했습니다."
    );
  }

  const message = successPayload?.messageList?.[0] ?? null;

  if (message?.statusCode !== "2000") {
    throw new Error(message?.statusMessage ?? "SMS 발송 접수에 실패했습니다.");
  }

  return {
    provider: env.SMS_PROVIDER,
    requestId: message?.messageId ?? successPayload?.groupInfo?.groupId ?? null,
    sentAt: successPayload?.groupInfo?.dateCreated ?? sentAt,
  };
}

function createSolapiAuthorizationHeader(params: {
  apiKey: string;
  apiSecret: string;
  dateTime: string;
}) {
  const salt = randomBytesHex(16);
  const signature = createHmac("sha256", params.apiSecret)
    .update(`${params.dateTime}${salt}`)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${params.apiKey}, date=${params.dateTime}, salt=${salt}, signature=${signature}`;
}

function randomBytesHex(size: number) {
  return randomBytes(size).toString("hex");
}

function getSolapiErrorMessage(
  payload: SolapiSendMessageResponse | SolapiErrorResponse | null
) {
  if (!payload) {
    return "SMS 발송 API 호출에 실패했습니다.";
  }

  if ("errorMessage" in payload && payload.errorMessage) {
    return payload.errorMessage;
  }

  if (
    "failedMessageList" in payload &&
    payload.failedMessageList?.[0]?.statusMessage
  ) {
    return payload.failedMessageList[0].statusMessage;
  }

  return "SMS 발송 API 호출에 실패했습니다.";
}

function isSolapiSendMessageResponse(
  payload: SolapiSendMessageResponse | SolapiErrorResponse | null
): payload is SolapiSendMessageResponse {
  return Boolean(
    payload &&
      ("messageList" in payload ||
        "failedMessageList" in payload ||
        "groupInfo" in payload)
  );
}

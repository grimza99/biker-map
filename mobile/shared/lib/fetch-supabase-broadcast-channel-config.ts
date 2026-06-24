import type {
  RealtimeFeature,
  RealtimeMode,
  TRealtimeConfigResponseData,
} from "@package-shared/index";

import { apiFetch } from "../api";
import type { SupabaseBroadcastChannelConfig } from "./use-supabase-broadcast-realtime";

type FetchSupabaseBroadcastChannelConfigOptions<
  TFeature extends RealtimeFeature,
> = {
  expectedFeature: TFeature;
  expectedMode?: RealtimeMode;
  path: string;
  unsupportedMessage?: string;
};

export async function fetchSupabaseBroadcastChannelConfig<
  TFeature extends RealtimeFeature,
>({
  expectedFeature,
  expectedMode = "supabase-realtime",
  path,
  unsupportedMessage = "지원하지 않는 실시간 채널 설정입니다.",
}: FetchSupabaseBroadcastChannelConfigOptions<TFeature>): Promise<
  SupabaseBroadcastChannelConfig
> {
  const response = await apiFetch.get<TRealtimeConfigResponseData>(path);
  const config = response.data;

  if (
    config.mode !== expectedMode ||
    config.feature !== expectedFeature ||
    !config.channel
  ) {
    throw new Error(unsupportedMessage);
  }

  return {
    channelName: config.channel,
    privateChannel: config.privateChannel ?? false,
  };
}

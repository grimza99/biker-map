import { Linking } from "react-native";

export async function openExternalUrl(url: string) {
  if (!url) {
    return;
  }

  await Linking.openURL(url);
}

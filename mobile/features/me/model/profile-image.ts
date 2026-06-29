import type { ImageInputAsset } from "@/components/common";
import { uploadImage } from "@/features/image";

export async function resolveAvatarUrl(avatarAsset: ImageInputAsset[]) {
  const selectedAsset = avatarAsset[0];

  if (!selectedAsset) {
    return null;
  }

  if (isUploadedImageUri(selectedAsset.uri)) {
    return selectedAsset.uri;
  }

  const uploaded = await uploadImage(selectedAsset);
  return uploaded.url;
}

export function mapInitialAvatarAsset(
  avatarUrl?: string | null
): ImageInputAsset[] {
  if (!avatarUrl) {
    return [];
  }

  return [
    {
      id: avatarUrl,
      name: "profile-image.jpg",
      uri: avatarUrl,
    },
  ];
}

export function hasLocalAvatarAsset(avatarAsset: ImageInputAsset[]) {
  return avatarAsset.some((asset) => !isUploadedImageUri(asset.uri));
}

function isUploadedImageUri(uri: string) {
  return /^https?:\/\//.test(uri);
}

import { API_PATHS, type UploadImageResponseData } from "@package-shared/index";

import { apiFetch } from "@/shared";
import type { ImageInputAsset } from "@/components/common";

type ReactNativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadImage(
  asset: ImageInputAsset
): Promise<UploadImageResponseData> {
  const formData = new FormData();
  const inferredMimeType = inferImageMimeType(asset);
  const fileExtension = resolveFileExtension(inferredMimeType);
  const fileName = asset.name ?? `post-image-${Date.now()}.${fileExtension}`;
  const mimeType = asset.mimeType ?? inferredMimeType;
  const file: ReactNativeUploadFile = {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  };

  formData.append("file", file as unknown as Blob);

  const response = await apiFetch.post<UploadImageResponseData>(
    API_PATHS.uploads.image,
    formData
  );

  return response.data;
}

/**
 * --------------------------------------------------------------------
 * @description 파일 확장자로 Mime type 추론
 */
function inferImageMimeType(asset: ImageInputAsset) {
  const candidate = `${asset.name ?? ""} ${asset.uri}`.toLowerCase();

  if (candidate.includes(".png")) {
    return "image/png";
  }

  if (candidate.includes(".webp")) {
    return "image/webp";
  }

  if (candidate.includes(".gif")) {
    return "image/gif";
  }

  if (candidate.includes(".heic")) {
    return "image/heic";
  }

  if (candidate.includes(".heif")) {
    return "image/heif";
  }

  if (candidate.includes(".jpg") || candidate.includes(".jpeg")) {
    return "image/jpeg";
  }

  return "image/jpeg";
}

function resolveFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

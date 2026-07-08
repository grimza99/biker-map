export type UploadImageResponseData = {
  path: string;
  url: string;
  contentType: string;
};
export type UploadImageDraftType =
  | "image"
  | "video"
  | "livePhoto"
  | "pairedVideo";

export type UploadImageDraft = {
  uri: string;
  id?: string | null;
  mimeType?: string | null;
  name?: string | null;
  type?: UploadImageDraftType | null;
  height?: number;
  size?: number;
  width?: number;
};

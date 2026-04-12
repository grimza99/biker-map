import { apiFetch } from "@/shared";
import { API_PATHS, UploadImageResponseData } from "@package-shared/index";

export const uploadImage = async (
  file: File
): Promise<UploadImageResponseData> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch<UploadImageResponseData>(API_PATHS.uploads.image, {
    method: "POST",
    body: formData,
  });

  return res.data;
};

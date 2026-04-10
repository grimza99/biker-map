import {
  BUCKET_NAME,
  type UploadImageResponseData,
} from "@package-shared/index";

import { requireApiSession } from "@shared/api/auth";
import { badRequest, created, internalServerError } from "@shared/api/response";
import { createSupabaseApiClient } from "@shared/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return badRequest("이미지 파일이 필요합니다.");
  }

  if (!file.type.startsWith("image/")) {
    return badRequest("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_FILE_SIZE) {
    return badRequest("이미지는 10MB 이하만 업로드할 수 있습니다.");
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `routes/${session.userId}/${Date.now()}-${sanitizeFileName(
    crypto.randomUUID()
  )}.${ext}`;

  const data = new Uint8Array(await file.arrayBuffer());

  console.log(path, data);
  const supabase = createSupabaseApiClient(request);
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, data, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return internalServerError(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return created<UploadImageResponseData>({
    path,
    url: publicUrlData.publicUrl,
    contentType: file.type,
  });
}

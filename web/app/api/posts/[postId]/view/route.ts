import { incrementPostViewCount, internalServerError, notFound, ok } from "@shared/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const viewCount = await incrementPostViewCount(postId);

    if (viewCount === null) {
      return notFound("게시글을 찾을 수 없습니다.");
    }

    return ok({ postId, viewCount });
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "게시글 조회수를 반영하지 못했습니다."
    );
  }
}

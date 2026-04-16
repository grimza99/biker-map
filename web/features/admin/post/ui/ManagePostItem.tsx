import { Button, DefaultCardContainer } from "@/shared";
import { type CommunityPost } from "@package-shared/index";
import { Pencil, Trash2 } from "lucide-react";

interface ManagePostItemProps {
  post: CommunityPost;
  onClickEdit: (postId: string) => void;
  onClickDelete: (postId: string) => void;
  isMutating?: boolean;
}

export function ManagePostItem({
  post,
  onClickEdit,
  onClickDelete,
  isMutating = false,
}: ManagePostItemProps) {
  return (
    <DefaultCardContainer className="flex min-w-90 justify-between gap-3 p-3 lg:min-w-100">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3>{post.title}</h3>
          <p className="m-0 text-xs uppercase text-muted">{post.category}</p>
        </div>
        <p className="m-0 text-sm leading-6 text-muted">{post.excerpt}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onClickEdit(post.id)}
          disabled={isMutating}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={isMutating}
          onClick={() => onClickDelete(post.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </DefaultCardContainer>
  );
}

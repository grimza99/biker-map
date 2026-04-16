import { useMemo, useState } from "react";

import { AdminModalId } from "@/app/admin/page";
import { ManagePostItem } from "@/features/admin";
import { useCommunityPostDetail } from "@/features/community/model/use-community-post-detail";
import { useCommunityPosts } from "@/features/community/model/use-community-posts";
import {
  useDeleteCommunityPost,
  useUpdateCommunityPost,
} from "@/features/community/model/use-post";
import { CommunityPostForm } from "@/features/community/ui/community-post-form";
import { ManageEntityDialogLayout } from "@/widgets/admin/manage-entity-dialog";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Pagination,
} from "@shared/ui";

interface ManagePostDialogProps {
  openModalId: AdminModalId | null;
  setOpenModalId: (id: AdminModalId | null) => void;
}

export function ManagePostDialog({
  openModalId,
  setOpenModalId,
}: ManagePostDialogProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const postsQuery = useCommunityPosts({
    page,
    pageSize,
    sort: "latest",
  });
  const postDetailQuery = useCommunityPostDetail(editingPostId ?? "");
  const posts = postsQuery.data?.data.items ?? [];
  const deleteMutation = useDeleteCommunityPost(editingPostId ?? "");
  const updateMutation = useUpdateCommunityPost(editingPostId ?? "");
  const total = postsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const selectedPost = useMemo(
    () => postDetailQuery.data?.data ?? null,
    [postDetailQuery.data?.data]
  );

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(postId);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }

    if (editingPostId === postId) {
      setEditingPostId(null);
    }
  };

  return (
    <Dialog
      open={openModalId === "post-manage"}
      onOpenChange={(nextOpen) =>
        setOpenModalId(nextOpen ? "post-manage" : null)
      }
    >
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          Post 관리
        </Button>
      </DialogTrigger>

      <DialogContent size="xl" className="border border-border">
        <DialogHeader
          title={
            <span className="text-lg font-semibold text-text">게시글 관리</span>
          }
        />
        <DialogBody className="grid h-full gap-5 pt-0">
          <ManageEntityDialogLayout
            listTitle="게시글 목록"
            editorTitle="게시글 수정"
            editorDescription="수정할 게시글을 목록에서 선택하면 아래에 폼이 열립니다."
            isLoading={postsQuery.isLoading}
            isEmpty={!posts.length}
            emptyTitle="등록된 게시글이 아직 없습니다."
            listContent={posts.map((post) => (
              <ManagePostItem
                key={post.id}
                post={post}
                onClickEdit={(id) => setEditingPostId(id)}
                onClickDelete={handleDeletePost}
                isMutating={deleteMutation.isPending && editingPostId === post.id}
              />
            ))}
            listFooter={
              total > pageSize ? (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="pt-2"
                />
              ) : null
            }
            editorContent={
              selectedPost ? (
                <CommunityPostForm
                  allowedCategories={["notice", "question", "info", "free"]}
                  submitLabel="게시글 수정"
                  initialValues={{
                    category: selectedPost.category,
                    title: selectedPost.title,
                    content: selectedPost.content,
                    images: selectedPost.images ?? [],
                  }}
                  onSubmit={(payload) =>
                    updateMutation.mutateAsync({
                      category: payload.category,
                      title: payload.title,
                      content: payload.content,
                      images: payload.images,
                    })
                  }
                  onSuccess={() => setEditingPostId(null)}
                  onCancel={() => setEditingPostId(null)}
                />
              ) : null
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

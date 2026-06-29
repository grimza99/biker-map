"use client";

import { ApiClientError } from "@package-shared/index";
import { FormEvent, useState } from "react";

import { Button, Input } from "@/shared";

interface CommentEditFormProps {
  initialValue: string;
  submitLabel?: string;
  disabled?: boolean;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export function CommentEditForm({
  initialValue,
  submitLabel = "수정",
  disabled,
  isPending,
  error,
  onSubmit,
  onCancel,
}: CommentEditFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || isPending) {
      return;
    }

    onSubmit(content.trim());
  };

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <Input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled || isPending}
        className="flex-1"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={isPending}
          disabled={!content.trim() || disabled}
        >
          {submitLabel}
        </Button>
      </div>
      {error instanceof ApiClientError ? (
        <p className="m-0 text-sm text-danger">{error.message}</p>
      ) : null}
    </form>
  );
}

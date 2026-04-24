"use client";

import dynamic from "next/dynamic";
import type { TextareaHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";

import { uploadImage } from "@/features/image";
import { ApiClientError } from "@shared/api/http";
import { Button } from "@shared/ui/button";
import { useToast } from "@shared/ui/toast";
import { commands } from "@uiw/react-md-editor";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function insertMarkdownAtSelection(
  currentValue: string,
  selectionStart: number,
  selectionEnd: number,
  urls: string[]
) {
  const before = currentValue.slice(0, selectionStart);
  const after = currentValue.slice(selectionEnd);
  const imageBlock = urls.map((url) => `![route-image](${url})`).join("\n\n");
  const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
  const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
  const inserted = `${prefix}${imageBlock}${suffix}`;
  const nextValue = `${before}${inserted}${after}`;
  const nextCaretPosition = before.length + inserted.length;

  return {
    nextValue,
    nextCaretPosition,
  };
}

export function MarkdownEditor({
  value,
  onChange,
  label = "본문",
  placeholder = "마크다운으로 작성해 주세요.",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const valueRef = useRef(value);
  const selectionRef = useRef({ start: 0, end: 0 });
  const pendingCaretPositionRef = useRef<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (pendingCaretPositionRef.current === null || !textareaRef.current) {
      return;
    }

    const nextPosition = pendingCaretPositionRef.current;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(nextPosition, nextPosition);
    selectionRef.current = {
      start: nextPosition,
      end: nextPosition,
    };
    pendingCaretPositionRef.current = null;
  }, [value]);

  function syncSelection() {
    if (!textareaRef.current) {
      return;
    }

    selectionRef.current = {
      start: textareaRef.current.selectionStart ?? valueRef.current.length,
      end: textareaRef.current.selectionEnd ?? valueRef.current.length,
    };
  }

  async function handleUpload(files: FileList | File[]) {
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files).slice(0, 5)) {
        const formData = new FormData();
        formData.append("file", file);

        const data = await uploadImage(file);
        uploadedUrls.push(data.url);
      }

      const { nextValue, nextCaretPosition } = insertMarkdownAtSelection(
        valueRef.current,
        selectionRef.current.start,
        selectionRef.current.end,
        uploadedUrls
      );

      pendingCaretPositionRef.current = nextCaretPosition;
      onChange(nextValue);
    } catch (error) {
      showToast({
        tone: "danger",
        title: "이미지 업로드 실패",
        description:
          error instanceof ApiClientError
            ? error.message
            : error instanceof Error
            ? error.message
            : "이미지 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="grid gap-3" data-color-mode="dark">
      {/* 라벨 & 이미지 업로드 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-[13px] font-semibold leading-[1.3] tracking-[0.01em] text-text">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files;
              if (files && files.length > 0) {
                void handleUpload(files);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            이미지 업로드
          </Button>
        </div>
      </div>

      <div className="overflow-scroll bg-panel">
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          height={420}
          preview="edit"
          visibleDragbar={false}
          commands={[
            commands.bold,
            commands.italic,
            commands.unorderedListCommand,
            commands.link,
            commands.quote,
            commands.codeEdit,
            commands.codePreview,
          ]}
          extraCommands={[]}
          components={{
            textarea: (props) => {
              const textareaProps =
                props as TextareaHTMLAttributes<HTMLTextAreaElement>;

              return (
                <textarea
                  className="h-full w-full resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm leading-[1.3] text-text outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...textareaProps}
                  ref={textareaRef}
                  onSelect={(event) => {
                    textareaProps.onSelect?.(event);
                    syncSelection();
                  }}
                  onClick={(event) => {
                    textareaProps.onClick?.(event);
                    syncSelection();
                  }}
                  onKeyUp={(event) => {
                    textareaProps.onKeyUp?.(event);
                    syncSelection();
                  }}
                  onFocus={(event) => {
                    textareaProps.onFocus?.(event);
                    syncSelection();
                  }}
                />
              );
            },
          }}
          textareaProps={{
            placeholder,
            onSelect: syncSelection,
            onClick: syncSelection,
            onKeyUp: syncSelection,
            onFocus: syncSelection,
          }}
        />
      </div>
    </div>
  );
}

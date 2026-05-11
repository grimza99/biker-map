"use client";

import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  type MutableRefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib";

import {
  type FieldBaseProps,
  FieldShell,
  fieldDisabledClassName,
  fieldInteractiveClassName,
  fieldSizeClassNames,
  fieldToneClassName,
} from "./FieldShell";

type ImageValueItem = {
  id: string;
  value: string;
};

type SelectedFileMeta = {
  id: string;
  name: string;
  size: number;
};

export type ImageInputProps = FieldBaseProps & {
  id?: string;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (url: string[] | null) => void;
  onUpload?: (file: File) => Promise<string>;
  onUploadingChange?: (isUploading: boolean) => void;
  accept?: string;
  disabled?: boolean;
  previewAlt?: string;
  maxImages?: number;
};

export function ImageInput({
  id,
  label,
  helperText,
  errorText,
  size = "md",
  className,
  fieldClassName,
  value,
  defaultValue = null,
  onValueChange,
  onUpload,
  onUploadingChange,
  accept = "image/*",
  disabled,
  previewAlt = "선택한 이미지 미리보기",
  maxImages = 5,
}: ImageInputProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const idRef = useRef(0);
  const currentValueIdMapRef = useRef<Map<string, string[]>>(new Map());
  const [uncontrolledValue, setUncontrolledValue] = useState<string[] | null>(
    normalizeImageUrls(defaultValue)
  );
  const [localPreviewUrls, setLocalPreviewUrls] = useState<ImageValueItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    SelectedFileMeta[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentValue = useMemo(
    () => normalizeImageUrls(value === undefined ? uncontrolledValue : value),
    [uncontrolledValue, value]
  );
  const currentValueItems = useMemo(
    () => toImageValueItems(currentValue, currentValueIdMapRef, idRef),
    [currentValue]
  );
  const previewUrls = useMemo(
    () => (localPreviewUrls.length > 0 ? localPreviewUrls : currentValueItems),
    [currentValue, localPreviewUrls]
  );
  const isMaxReached = previewUrls.length >= maxImages;

  useEffect(() => {
    return () => {
      localPreviewUrls.forEach(({ value }) => {
        if (value.startsWith("blob:")) {
          URL.revokeObjectURL(value);
        }
      });
    };
  }, [localPreviewUrls]);

  function updateValue(nextValue: string[] | null) {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function handleRemove(targetId: string) {
    const nextValues = currentValueItems
      .filter((item) => item.id !== targetId)
      .map((item) => item.value);
    const removedPreview = localPreviewUrls.find((item) => item.id === targetId);
    const nextLocalPreviewUrls = localPreviewUrls.filter(
      (item) => item.id !== targetId
    );

    if (removedPreview?.value.startsWith("blob:")) {
      URL.revokeObjectURL(removedPreview.value);
    }

    updateValue(nextValues.length > 0 ? nextValues : null);
    setLocalPreviewUrls(nextLocalPreviewUrls);
    setSelectedFiles((previous) =>
      previous.filter((item) => item.id !== targetId)
    );
    setUploadError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <FieldShell
        id={resolvedId}
        label={label}
        helperText={helperText}
        errorText={errorText}
        disabled={disabled}
        size={size}
        className="gap-2"
        fieldClassName="hidden"
      >
        <input
          ref={inputRef}
          id={resolvedId}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={async (event) => {
            const nextFiles = Array.from(event.target.files ?? []);
            if (nextFiles.length === 0) {
              return;
            }

            const currentUrls = currentValue ?? [];
            const availableSlots = Math.max(maxImages - currentUrls.length, 0);

            if (availableSlots === 0) {
              setUploadError(
                `이미지는 최대 ${maxImages}장까지 업로드할 수 있습니다.`
              );
              event.target.value = "";
              return;
            }

            const acceptedFiles = nextFiles.slice(0, availableSlots);
            const nextPreviewUrls = acceptedFiles.map((file) => ({
              id: nextImageValueId(idRef),
              value: URL.createObjectURL(file),
            }));
            setLocalPreviewUrls((previous) => [
              ...previous,
              ...nextPreviewUrls,
            ]);
            setSelectedFiles((previous) => [
              ...previous,
              ...acceptedFiles.map((file, index) => ({
                id: nextPreviewUrls[index]?.id ?? nextImageValueId(idRef),
                name: file.name,
                size: file.size,
              })),
            ]);
            setUploadError(null);

            if (!onUpload) {
              updateValue([
                ...currentUrls,
                ...nextPreviewUrls.map((item) => item.value),
              ]);
              return;
            }

            try {
              setIsUploading(true);
              onUploadingChange?.(true);
              const uploadedUrls: string[] = [];

              for (const file of acceptedFiles) {
                const uploadedUrl = await onUpload(file);
                uploadedUrls.push(uploadedUrl);
              }

              updateValue([...currentUrls, ...uploadedUrls]);
            } catch (error) {
              setUploadError(
                error instanceof Error
                  ? error.message
                  : "이미지 업로드에 실패했습니다."
              );
            } finally {
              setIsUploading(false);
              onUploadingChange?.(false);
              event.target.value = "";
            }
          }}
        />
      </FieldShell>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group grid justify-items-center gap-3 rounded-[20px] border border-dashed px-4 py-6 text-center transition duration-150 ease-out",
          fieldToneClassName,
          disabled ? fieldDisabledClassName : fieldInteractiveClassName,
          fieldSizeClassNames[size],
          fieldClassName
        )}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-panel-soft text-muted transition group-hover:text-accent group-focus-visible:text-accent">
          {previewUrls.length > 0 ? (
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Upload className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <span className="grid gap-1">
          <span className="text-sm font-semibold text-text">
            {isUploading
              ? "이미지를 업로드하는 중입니다"
              : previewUrls.length > 0
              ? isMaxReached
                ? `이미지 ${maxImages}장이 모두 업로드되었습니다`
                : `이미지를 추가하거나 변경하세요 (${previewUrls.length}/${maxImages})`
              : "이미지 업로드"}
          </span>
          <span className="text-xs leading-5 text-muted">
            PNG, JPG, WEBP 형식 이미지를 최대 {maxImages}장까지 선택할 수
            있습니다.
          </span>
        </span>
      </button>

      {previewUrls.length > 0 ? (
        <div className="grid gap-3 rounded-[22px] border border-border bg-panel-solid/72 p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previewUrls.map((url, index) => {
              const fileMeta = selectedFiles.find((item) => item.id === url.id);
              const isCover = index === 0;

              return (
                <div
                  key={url.id}
                  className="grid gap-3 rounded-[18px] border border-border bg-bg/40 p-3"
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-[14px] border border-border bg-bg/50">
                    <Image
                      src={url.value}
                      alt={`${previewAlt} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                      unoptimized
                    />
                    {isCover && (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                        대표 이미지
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm font-semibold text-text">
                        {fileMeta?.name ?? `업로드된 이미지 ${index + 1}`}
                      </p>
                      {fileMeta?.size !== undefined ? (
                        <p className="m-0 text-xs text-muted">
                          {(fileMeta.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      ) : (
                        <p className="m-0 truncate text-xs text-muted">
                          {url.value}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(url.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel text-muted transition hover:border-danger/45 hover:text-danger"
                      aria-label={`${index + 1}번째 이미지 제거`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {uploadError ? (
        <p className="m-0 text-xs font-medium text-danger">{uploadError}</p>
      ) : null}
    </div>
  );
}

function normalizeImageUrls(value: string | string[] | null | undefined) {
  if (!value) {
    return null;
  }

  const values = Array.isArray(value) ? value : [value];
  return values.filter(Boolean);
}

function nextImageValueId(idRef: MutableRefObject<number>) {
  idRef.current += 1;
  return `image-${idRef.current}`;
}

function toImageValueItems(
  values: string[] | null,
  valueIdMapRef: MutableRefObject<Map<string, string[]>>,
  idRef: MutableRefObject<number>
) {
  if (!values || values.length === 0) {
    valueIdMapRef.current = new Map();
    return [];
  }

  const previousBuckets = valueIdMapRef.current;
  const nextBuckets = new Map<string, string[]>();

  const items = values.map((value) => {
    const previousIds = previousBuckets.get(value);
    const id = previousIds?.shift() ?? nextImageValueId(idRef);
    const nextIds = nextBuckets.get(value) ?? [];
    nextIds.push(id);
    nextBuckets.set(value, nextIds);

    return { id, value };
  });

  valueIdMapRef.current = nextBuckets;
  return items;
}

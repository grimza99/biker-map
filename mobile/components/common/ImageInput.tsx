import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn } from "@/shared";
import { AppText } from "../../shared/ui/AppText";
import { Button } from "./Button";
import { FieldShell, type FieldBaseProps, type FieldSize } from "./FieldShell";

export type ImageInputSize = FieldSize;

export type ImageInputAsset = {
  height?: number;
  id?: string | null;
  mimeType?: string | null;
  name?: string | null;
  size?: number;
  type?: ImagePicker.ImagePickerAsset["type"];
  uri: string;
  width?: number;
};

export type ImageInputValue =
  | ImageInputAsset
  | ImageInputAsset[]
  | null
  | undefined;

export type ImageInputProps = FieldBaseProps & {
  addButtonLabel?: string;
  defaultValue?: ImageInputValue;
  disabled?: boolean;
  emptyTitle?: string;
  fieldClassName?: string;
  imageClassName?: string;
  maxImages?: number;
  onPickingChange?: (isPicking: boolean) => void;
  onValueChange?: (value: ImageInputAsset[] | null) => void;
  previewLabel?: string;
  removeButtonLabel?: string;
  replaceButtonLabel?: string;
  value?: ImageInputValue;
};

export function ImageInput({
  addButtonLabel = "이미지 추가",
  defaultValue = null,
  disabled = false,
  emptyTitle = "이미지를 선택하세요",
  errorText,
  fieldClassName,
  helperText,
  imageClassName,
  label,
  maxImages = 1,
  onPickingChange,
  onValueChange,
  previewLabel = "선택한 이미지",
  removeButtonLabel = "삭제",
  replaceButtonLabel = "교체",
  size = "md",
  className,
  value,
}: ImageInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    normalizeImageInputValue(defaultValue)
  );
  const [isPicking, setIsPicking] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const resolvedMaxImages = Math.max(maxImages, 1);
  const currentValue = useMemo(
    () =>
      normalizeImageInputValue(
        value === undefined ? uncontrolledValue : value
      ).slice(0, resolvedMaxImages),
    [resolvedMaxImages, uncontrolledValue, value]
  );
  const canAddMore = currentValue.length < resolvedMaxImages;
  const effectiveErrorText = errorText ?? localError;

  function updateValue(nextValue: ImageInputAsset[]) {
    const normalizedValue = nextValue.length > 0 ? nextValue : null;

    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(normalizedValue);
  }

  async function pickImages(selectionLimit: number) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setLocalError("이미지를 선택하려면 사진 접근 권한이 필요합니다.");
      return null;
    }

    setLocalError(undefined);
    setIsPicking(true);
    onPickingChange?.(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: selectionLimit > 1,
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        quality: 1,
        selectionLimit,
      });

      if (result.canceled || result.assets.length === 0) {
        return null;
      }

      return result.assets
        .slice(0, selectionLimit)
        .map(mapPickerAssetToInputAsset);
    } finally {
      setIsPicking(false);
      onPickingChange?.(false);
    }
  }

  async function handleAddPress() {
    if (disabled || isPicking) {
      return;
    }

    const remainingSlots = resolvedMaxImages - currentValue.length;

    if (remainingSlots <= 0) {
      setLocalError(
        `이미지는 최대 ${resolvedMaxImages}장까지 선택할 수 있습니다.`
      );
      return;
    }

    const nextAssets = await pickImages(remainingSlots);

    if (!nextAssets) {
      return;
    }

    updateValue([...currentValue, ...nextAssets]);
  }

  async function handleReplacePress(index: number) {
    if (disabled || isPicking) {
      return;
    }

    const nextAssets = await pickImages(1);

    if (!nextAssets?.[0]) {
      return;
    }

    const nextValue = [...currentValue];
    nextValue[index] = nextAssets[0];
    updateValue(nextValue);
  }

  function handleRemovePress(index: number) {
    if (disabled || isPicking) {
      return;
    }

    const nextValue = currentValue.filter(
      (_, valueIndex) => valueIndex !== index
    );
    updateValue(nextValue);
    setLocalError(undefined);
  }

  return (
    <FieldShell
      disabled={disabled || isPicking}
      errorText={effectiveErrorText}
      helperText={helperText}
      label={label}
      size={size}
      className={className}
    >
      <View
        className={cn(
          "gap-3 rounded-[20px] border border-border bg-panel-solid p-3",
          effectiveErrorText && "border-danger bg-danger/10",
          fieldClassName
        )}
      >
        {currentValue.length > 0 ? (
          <View className="gap-3">
            {currentValue.map((asset, index) => (
              <View
                key={resolveAssetKey(asset, index)}
                className="gap-3 rounded-[18px] border border-border bg-panel p-2.5"
              >
                <View className="relative aspect-4/3 w-full overflow-hidden rounded-[14px] border border-border bg-bg">
                  <Image
                    accessibilityLabel={`${previewLabel} ${index + 1}`}
                    className={cn("h-full w-full", imageClassName)}
                    resizeMode="cover"
                    source={{ uri: asset.uri }}
                  />

                  {isPicking ? (
                    <View className="absolute inset-0 items-center justify-center bg-[rgba(17,19,21,0.45)]">
                      <ActivityIndicator
                        color={bikerMapTheme.colors.text}
                        size="small"
                      />
                    </View>
                  ) : null}

                  {index === 0 && resolvedMaxImages > 1 ? (
                    <View className="absolute left-2.5 top-2.5 rounded-full bg-accent px-2.25 py-1">
                      <AppText className="text-[11px] font-extrabold leading-3.5 text-text">
                        대표
                      </AppText>
                    </View>
                  ) : null}
                </View>

                <View className="gap-2.5">
                  <View className="gap-0.75">
                    <AppText
                      className="text-sm font-extrabold leading-5"
                      numberOfLines={1}
                    >
                      {asset.name ?? `${previewLabel} ${index + 1}`}
                    </AppText>
                    <AppText
                      className="text-xs leading-4.25"
                      numberOfLines={1}
                      tone="muted"
                    >
                      {formatAssetMeta(asset)}
                    </AppText>
                  </View>

                  <View className="flex-row gap-2">
                    <Button
                      disabled={disabled || isPicking}
                      leftIcon={
                        <Ionicons
                          color={bikerMapTheme.colors.text}
                          name="swap-horizontal-outline"
                          size={15}
                        />
                      }
                      onPress={() => handleReplacePress(index)}
                      size="sm"
                      variant="secondary"
                    >
                      {replaceButtonLabel}
                    </Button>
                    <Button
                      disabled={disabled || isPicking}
                      leftIcon={
                        <Ionicons
                          color={bikerMapTheme.colors.text}
                          name="trash-outline"
                          size={15}
                        />
                      }
                      onPress={() => handleRemovePress(index)}
                      size="sm"
                      variant="danger"
                    >
                      {removeButtonLabel}
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              busy: isPicking,
              disabled: disabled || isPicking,
            }}
            disabled={disabled || isPicking}
            onPress={handleAddPress}
            style={({ pressed }) => [
              pressed && !disabled && !isPicking
                ? emptyStatePressedStyle
                : null,
            ]}
            className="min-h-44 items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-panel p-4.5"
          >
            <View className="items-center justify-center">
              {isPicking ? (
                <ActivityIndicator
                  color={bikerMapTheme.colors.accent}
                  size="small"
                />
              ) : (
                <Ionicons
                  color={bikerMapTheme.colors.accent}
                  name="image-outline"
                  size={24}
                />
              )}
            </View>
            <AppText className="text-center text-base font-extrabold leading-5.5">
              {isPicking ? "이미지를 불러오는 중입니다" : emptyTitle}
            </AppText>
          </Pressable>
        )}

        {canAddMore ? (
          <Button
            disabled={disabled || isPicking}
            fullWidth
            leftIcon={
              isPicking ? (
                <ActivityIndicator
                  color={bikerMapTheme.colors.text}
                  size="small"
                />
              ) : (
                <Ionicons
                  color={bikerMapTheme.colors.text}
                  name="add"
                  size={16}
                />
              )
            }
            onPress={handleAddPress}
            size="md"
            variant={currentValue.length > 0 ? "secondary" : "primary"}
          >
            {currentValue.length > 0
              ? `${addButtonLabel} (${currentValue.length}/${resolvedMaxImages})`
              : addButtonLabel}
          </Button>
        ) : null}
      </View>
    </FieldShell>
  );
}

function normalizeImageInputValue(value: ImageInputValue): ImageInputAsset[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value.filter(isValidAsset)
    : [value].filter(isValidAsset);
}

function isValidAsset(asset: ImageInputAsset): asset is ImageInputAsset {
  return Boolean(asset.uri);
}

function mapPickerAssetToInputAsset(
  asset: ImagePicker.ImagePickerAsset
): ImageInputAsset {
  return {
    height: asset.height,
    id: asset.assetId ?? asset.uri,
    mimeType: asset.mimeType,
    name: asset.fileName,
    size: asset.fileSize,
    type: asset.type,
    uri: asset.uri,
    width: asset.width,
  };
}

function resolveAssetKey(asset: ImageInputAsset, index: number) {
  return asset.id ?? `${asset.uri}-${index}`;
}

function formatAssetMeta(asset: ImageInputAsset) {
  if (asset.size !== undefined) {
    return `${(asset.size / 1024 / 1024).toFixed(2)} MB`;
  }

  return asset.mimeType ?? asset.uri;
}

const emptyStatePressedStyle: ViewStyle = {
  borderColor: bikerMapTheme.colors.accent,
  backgroundColor: bikerMapTheme.colors.panelSoft,
};

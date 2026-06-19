import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageStyle, StyleProp, ViewStyle } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

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
  fieldStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
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
  fieldStyle,
  helperText,
  imageStyle,
  label,
  maxImages = 1,
  onPickingChange,
  onValueChange,
  previewLabel = "선택한 이미지",
  removeButtonLabel = "삭제",
  replaceButtonLabel = "교체",
  size = "md",
  style,
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
      style={style}
    >
      <View
        style={[
          styles.surface,
          effectiveErrorText ? styles.surfaceError : null,
          fieldStyle,
        ]}
      >
        {currentValue.length > 0 ? (
          <View style={styles.previewList}>
            {currentValue.map((asset, index) => (
              <View
                key={resolveAssetKey(asset, index)}
                style={styles.previewCard}
              >
                <View style={styles.imageFrame}>
                  <Image
                    accessibilityLabel={`${previewLabel} ${index + 1}`}
                    resizeMode="cover"
                    source={{ uri: asset.uri }}
                    style={[styles.image, imageStyle]}
                  />

                  {isPicking ? (
                    <View style={styles.previewOverlay}>
                      <ActivityIndicator
                        color={bikerMapTheme.colors.text}
                        size="small"
                      />
                    </View>
                  ) : null}

                  {index === 0 && resolvedMaxImages > 1 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>대표</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.previewBody}>
                  <View style={styles.previewCopy}>
                    <Text numberOfLines={1} style={styles.previewTitle}>
                      {asset.name ?? `${previewLabel} ${index + 1}`}
                    </Text>
                    <Text numberOfLines={1} style={styles.previewMeta}>
                      {formatAssetMeta(asset)}
                    </Text>
                  </View>

                  <View style={styles.previewActions}>
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
              styles.emptyState,
              pressed && !disabled && !isPicking
                ? styles.emptyStatePressed
                : null,
            ]}
          >
            <View style={styles.emptyIcon}>
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
            <Text style={styles.emptyTitle}>
              {isPicking ? "이미지를 불러오는 중입니다" : emptyTitle}
            </Text>
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

const styles = StyleSheet.create({
  surface: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 12,
  },
  surfaceError: {
    borderColor: bikerMapTheme.colors.danger,
    backgroundColor: "rgba(216, 91, 78, 0.1)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 176,
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    borderStyle: "dashed",
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 18,
  },
  emptyStatePressed: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  emptyIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },

  previewList: {
    gap: 12,
  },
  previewCard: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 10,
  },
  imageFrame: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.bg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(17, 19, 21, 0.45)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.accent,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: bikerMapTheme.colors.text,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
  previewBody: {
    gap: 10,
  },
  previewCopy: {
    gap: 3,
  },
  previewTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  previewMeta: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  previewActions: {
    flexDirection: "row",
    gap: 8,
  },
});

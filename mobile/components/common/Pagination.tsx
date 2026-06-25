import { Fragment } from "react";
import { View } from "react-native";

import { Button } from "./Button";
import { AppText } from "../../shared";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
};

type PaginationItem = number | "ellipsis";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(currentPage, totalPages, maxVisiblePages);

  return (
    <View className="w-full flex-row items-center justify-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={currentPage <= 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        이전
      </Button>

      <View className="shrink flex-row items-center justify-center gap-2">
        {items.map((item, index) => (
          <Fragment key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <View className="w-7 items-center">
                <AppText tone="muted" className="text-xs font-semibold">
                  ...
                </AppText>
              </View>
            ) : (
              <Button
                size="sm"
                variant={item === currentPage ? "primary" : "secondary"}
                onPress={() => onPageChange(item)}
              >
                {item}
              </Button>
            )}
          </Fragment>
        ))}
      </View>

      <Button
        size="sm"
        variant="secondary"
        disabled={currentPage >= totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        다음
      </Button>
    </View>
  );
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): PaginationItem[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  let step = 1;

  while (
    pages.size < maxVisiblePages &&
    (currentPage - step > 1 || currentPage + step < totalPages)
  ) {
    if (currentPage - step > 1) {
      pages.add(currentPage - step);
    }

    if (pages.size >= maxVisiblePages) {
      break;
    }

    if (currentPage + step < totalPages) {
      pages.add(currentPage + step);
    }

    step += 1;
  }

  const sortedPages = Array.from(pages).sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1]! > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

import type { PlaceListItem, PlacesQuery } from "@package-shared/index";
import { useEffect, useRef, useState } from "react";

import { getPlaceList } from "./place-api";

type UsePlaceListResult = {
  errorMessage: string | null;
  isLoading: boolean;
  places: PlaceListItem[];
};

export function usePlaceList(query: PlacesQuery): UsePlaceListResult {
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    let isActive = true;
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;
    setIsLoading(true);
    setErrorMessage(null);

    void getPlaceList(query)
      .then((nextPlaces) => {
        if (!isActive || requestSeqRef.current !== requestSeq) {
          return;
        }

        setPlaces(nextPlaces);
      })
      .catch((error: unknown) => {
        if (!isActive || requestSeqRef.current !== requestSeq) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "장소 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => {
        if (!isActive || requestSeqRef.current !== requestSeq) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [query.category, query.cursor, query.limit, query.search]);

  return {
    errorMessage,
    isLoading,
    places,
  };
}

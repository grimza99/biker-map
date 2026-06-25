import { CreatePlaceBody, UpdatePlaceBody } from "src/types";
import { z } from "zod";
import { SCHEMA_ATOM } from "./schema-atom";

export const placeSchema = z.object({
  name: SCHEMA_ATOM.place.placeName,
  category: SCHEMA_ATOM.place.category,
  address: SCHEMA_ATOM.address,
  phone: SCHEMA_ATOM.phone.optional(),
  description: SCHEMA_ATOM.optional.trimmedString,
  lat: SCHEMA_ATOM.coordinate,
  lng: SCHEMA_ATOM.coordinate,
  naverPlaceUrl: SCHEMA_ATOM.url,
  images: z
    .array(SCHEMA_ATOM.image)
    .default([])
    .transform((images) => images.filter(Boolean)),
});

export type PlaceFormInput = z.input<typeof placeSchema>;
export type PlaceFormValues = z.output<typeof placeSchema>;

export function createPlaceDefaultValues(
  initialData?: Partial<CreatePlaceBody & UpdatePlaceBody> | null
): PlaceFormInput {
  return {
    name: initialData?.name ?? "",
    category: initialData?.category ?? "gas",
    address: initialData?.address ?? "",
    phone: initialData?.phone ?? "",
    description: initialData?.description ?? "",
    lat:
      initialData?.lat !== undefined && initialData?.lat !== null
        ? String(initialData.lat)
        : "",
    lng:
      initialData?.lng !== undefined && initialData?.lng !== null
        ? String(initialData.lng)
        : "",
    naverPlaceUrl: initialData?.naverPlaceUrl ?? "",
    images: initialData?.images ?? [],
  };
}

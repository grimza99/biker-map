import { z } from "zod";
import { CreatePlaceBody, UpdatePlaceBody } from "../types";
import { SCHEMA_ATOM } from "./schema-atom";

export const placeSchema = z.object({
  name: SCHEMA_ATOM.place.placeName,
  category: SCHEMA_ATOM.place.category,
  address: SCHEMA_ATOM.address,
  phone: SCHEMA_ATOM.optional.phone,
  description: SCHEMA_ATOM.optional.trimmedString,
  lat: SCHEMA_ATOM.coordinate,
  lng: SCHEMA_ATOM.coordinate,
  naverPlaceUrl: SCHEMA_ATOM.url,
  images: z
    .array(SCHEMA_ATOM.image)
    .default([])
    .transform((images) => images.filter(Boolean)),
});

export const updatePlaceSchema = z.object({
  name: SCHEMA_ATOM.place.placeName.optional(),
  category: SCHEMA_ATOM.place.category.optional(),
  address: SCHEMA_ATOM.address.optional(),
  phone: SCHEMA_ATOM.optional.phone.optional(),
  description: SCHEMA_ATOM.optional.trimmedString.optional(),
  lat: SCHEMA_ATOM.coordinate.optional(),
  lng: SCHEMA_ATOM.coordinate.optional(),
  naverPlaceUrl: SCHEMA_ATOM.url.optional(),
  images: z
    .array(SCHEMA_ATOM.image)
    .default([])
    .transform((images) => images.filter(Boolean))
    .optional(),
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

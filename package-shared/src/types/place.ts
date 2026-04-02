export type PlaceCategory = "gas" | "repair" | "cafe" | "shop" | "rest";

export type PlaceViewport = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

export type PlacesQuery = {
  search?: string;
  category?: PlaceCategory;
  viewport?: PlaceViewport;
  cursor?: string;
  limit?: number;
};

export type PlaceListItem = {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  lat: number;
  lng: number;
  naverPlaceUrl: string;
};

export type PlaceDetail = {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  phone?: string;
  description?: string;
  lat: number;
  lng: number;
  images?: string[];
  naverPlaceUrl: string;
};

export type PlacesListResponseData = {
  items: PlaceListItem[];
};

export type CreatePlaceBody = {
  name: string;
  category: PlaceCategory;
  address: string;
  phone?: string;
  description?: string;
  lat: number;
  lng: number;
  images?: string[];
  naverPlaceUrl: string;
};

export type CreatePlaceResponseData = {
  id: string;
  createdAt: string;
};

export type UpdatePlaceBody = Partial<CreatePlaceBody>;

export type UpdatePlaceResponseData = {
  id: string;
  updatedAt: string;
};

export type DeletePlaceResponseData = {
  id: string;
  deleted: true;
};

export type BikerPreview = {
  nickname: string;
  bikeBrand: string;
  bikeModel: string;
  distance: string;
  proficiency: string;
};

export type TLocationCoordinate = {
  lat: number;
  lng: number;
};

export type TBikerLocationSharingStatus = "off" | "foreground";

export type TBikersNearbyQuery = {
  lat: number;
  lng: number;
  radiusMeters?: number;
  limit?: number;
};

export type TUpdateMyBikerLocationBody = {
  location: TLocationCoordinate;
  accuracyMeters?: number | null;
  heading?: number | null;
  observedAt?: string;
  speedKph?: number | null;
};

export type TUpdateMyBikerSharingBody = {
  sharingStatus: TBikerLocationSharingStatus;
};

export type TBikerPresenceItem = {
  userId: string;
  nickname: string;
  bikeBrand?: string | null;
  bikeModel?: string | null;
  isMe?: boolean;
  location: TLocationCoordinate;
  accuracyMeters?: number | null;
  heading?: number | null;
  sharingStatus: TBikerLocationSharingStatus;
  speedKph?: number | null;
  updatedAt: string;
  expiresAt: string;
};

export type TBikersNearbyResponseData = {
  items: TBikerPresenceItem[];
  radiusMeters: number;
  serverNow: string;
};

export type TMyBikerLocationResponseData = {
  presence: TBikerPresenceItem | null;
};

export interface IBiker {
  nickname: string;
  bikeBrand: string;
  bikeModel: string;
  distance: string;
  proficiency: string;
}

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
  sharingSessionId: string;
  sharingSessionVersion: number;
  location: TLocationCoordinate;
  accuracyMeters?: number | null;
  heading?: number | null;
  speedKph?: number | null;
};

export type TUpdateMyBikerSharingBody = {
  sharingStatus: TBikerLocationSharingStatus;
  sharingSessionId?: string | null;
  sharingSessionVersion?: number | null;
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

export type TUpdateMyBikerLocationResponseData = {
  presence: TBikerPresenceItem;
};

export type TUpdateMyBikerSharingResponseData = {
  sharingStatus: TBikerLocationSharingStatus;
  sharingSessionId: string | null;
  sharingSessionVersion: number | null;
  expiresAt: string | null;
};

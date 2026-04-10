import { RouteRegion } from "../types/route";

export const routeRegionOptions: Array<{ label: string; value: RouteRegion }> =
  [
    { value: "all", label: "전체" },
    { value: "seoul", label: "서울" },
    { value: "busan", label: "부산" },
    { value: "daegu", label: "대구" },
    { value: "incheon", label: "인천" },
    { value: "gwangju", label: "광주" },
    { value: "daejeon", label: "대전" },
    { value: "ulsan", label: "울산" },
    { value: "sejong", label: "세종" },
    { value: "jeju", label: "제주" },
  ];

export const distanceOptions = [
  { value: "all", label: "전체" },
  { value: "50", label: "50km 이하" },
  { value: "100", label: "100km 이하" },
  { value: "200", label: "200km 이하" },
  { value: "over200", label: "200km 이상" },
];

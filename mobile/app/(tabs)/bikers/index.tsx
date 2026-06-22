import { AppText } from "@/components/common";
import type { BikerPreview } from "@/entities/bikers";
import { BikersBottomSheet } from "@/entities/bikers/ui/BikersBottomSheet";
import { AppScreen } from "@/components/shell";

const mockBikers: BikerPreview[] = [
  {
    nickname: "string",
    bikeBrand: "string",
    bikeModel: "string",
    distance: "string",
    proficiency: "string",
  },
  {
    nickname: "string",
    bikeBrand: "string",
    bikeModel: "string",
    distance: "string",
    proficiency: "string",
  },
  {
    nickname: "string",
    bikeBrand: "string",
    bikeModel: "string",
    distance: "string",
    proficiency: "string",
  },
  {
    nickname: "string",
    bikeBrand: "string",
    bikeModel: "string",
    distance: "string",
    proficiency: "string",
  },
  {
    nickname: "string",
    bikeBrand: "string",
    bikeModel: "string",
    distance: "string",
    proficiency: "string",
  },
];

export default function BikersScreen() {
  return (
    <AppScreen
      eyebrow="Mock Bikers"
      title="주변 바이커"
      description="실시간 위치 연동 전, 바텀 시트와 채팅 흐름을 먼저 점검하는 모바일 목업 화면입니다."
      containerStyle={{ paddingBottom: 220 }}
    >
      <AppText tone="muted" className="text-sm leading-6">
        하단 트리거를 눌러 주변 바이커 목록과 채팅 mock 화면으로 이동할 수 있습니다.
      </AppText>
      <BikersBottomSheet bikers={mockBikers} />
    </AppScreen>
  );
}

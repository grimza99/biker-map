import { Button } from "@/components/common";
import { AppScreen } from "../../components/shell";

export default function BikersScreen() {
  return (
    <AppScreen
      eyebrow="Expo Router shell"
      title="Biker Map"
      description="바이커 스크린"
    >
      <Button>테스트</Button>
      <Button selected>선택 상태</Button>
      <Button loading>로딩 상태</Button>
    </AppScreen>
  );
}

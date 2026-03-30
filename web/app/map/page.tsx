import { cn } from "@shared/lib";
import { PageWrapper } from "@shared/ui";
import { Search } from "lucide-react";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const detailFilters = [
  { label: "검색 반경", value: "5km", hint: "현재 위치 중심" },
  { label: "운영 상태", value: "영업중", hint: "열린 장소만" },
  { label: "주차 가능", value: "우선", hint: "바이크 주차" },
  { label: "평점", value: "4.3+", hint: "추천 기준" }
] as const;

export default function MapPage() {
  return (
    <PageWrapper className="relative overflow-hidden p-0 text-text" innerClassName="gap-0">
      <div className="relative min-h-[calc(100vh-11rem)] overflow-hidden rounded-[20px] border border-border bg-bg shadow-[0_18px_50px_rgba(5,6,7,0.34)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(229, 87, 47, 0.18), transparent 26%), radial-gradient(circle at 82% 18%, rgba(0, 194, 168, 0.14), transparent 24%), radial-gradient(circle at 50% 88%, rgba(77, 163, 255, 0.10), transparent 28%), linear-gradient(180deg, rgba(23, 26, 30, 0.96) 0%, rgba(29, 34, 40, 0.98) 46%, rgba(17, 19, 21, 0.99) 100%)"
          }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "72px 72px"
          }}
        />

        <div className="absolute inset-0">
          <div className="absolute left-[18%] top-[32%] h-24 w-24 rounded-full border border-accent/20 bg-accent/10 blur-[1px]" />
          <div className="absolute right-[22%] top-[26%] h-20 w-20 rounded-full border border-active/20 bg-active/10 blur-[1px]" />
          <div className="absolute bottom-[16%] left-[30%] h-28 w-28 rounded-full border border-info/15 bg-info/10 blur-[1px]" />
        </div>

        <div className="absolute inset-0">
          <div className="flex w-full items-start justify-between gap-4 p-5 md:p-6">
            <div className="grid max-w-2xl gap-4">
              <div className="grid gap-2 rounded-[26px] border border-border bg-panel/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="grid gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-active">
                      Map Search
                    </p>
                    <h1 className="text-3xl font-semibold tracking-[-0.05em] text-text">지도</h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted">
                      지도 UI를 배경에 꽉 채우고, 검색과 필터는 오버레이로 겹치는 구조입니다.
                    </p>
                  </div>
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    검색 우선
                  </span>
                </div>

                <label
                  className="flex items-center gap-3 rounded-2xl border border-border bg-bg/86 px-4 py-3 text-muted transition focus-within:ring-2 focus-within:ring-active/20"
                  htmlFor="map-search">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent" aria-hidden="true">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <div className="grid flex-1 gap-1">
                    <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted/80">
                      Search
                    </span>
                    <input
                      id="map-search"
                      name="map-search"
                      type="search"
                      placeholder="장소, 카테고리, 브랜드, 지역 검색"
                      className="w-full bg-transparent text-sm text-text placeholder:text-muted outline-none"
                    />
                  </div>
                  <span className="rounded-full border border-border bg-panel-solid/68 px-3 py-1 text-[11px] font-medium text-text">
                    지도 전체
                  </span>
                </label>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold tracking-[-0.02em] text-text">빠른 필터</h2>
                    <p className="text-xs text-muted">5개 핵심 카테고리를 바로 전환</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickFilters.map((filter, index) => {
                      const active = index === 0;

                      return (
                        <button
                          key={filter}
                          type="button"
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition",
                            active
                              ? "border-accent/30 bg-accent/10 text-text shadow-[0_10px_24px_rgba(229,87,47,0.28)]"
                              : "border-border bg-panel-solid/62 text-muted"
                          )}>
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <aside className="hidden w-full max-w-[22rem] md:block">
              <div className="grid gap-4 rounded-[26px] border border-border bg-panel/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted">
                      Detail Filters
                    </p>
                    <h2 className="text-base font-semibold tracking-[-0.02em] text-text">상세 필터</h2>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-text transition">
                    초기화
                  </button>
                </div>

                <div className="grid gap-3">
                  {detailFilters.map((filter) => (
                    <div
                      key={filter.label}
                      className="grid gap-2 rounded-2xl border border-border bg-bg/52 p-4 transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-1">
                          <p className="text-sm font-medium text-text">{filter.label}</p>
                          <p className="text-xs text-muted">{filter.hint}</p>
                        </div>
                        <span
                          className="rounded-full border border-border bg-panel-solid/68 px-3 py-1 text-xs font-medium text-text">
                          {filter.value}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r from-accent to-active",
                            filter.label === "검색 반경"
                              ? "w-[58%]"
                              : filter.label === "운영 상태"
                                ? "w-[72%]"
                                : filter.label === "주차 가능"
                                  ? "w-[64%]"
                                  : "w-[76%]"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-[22px] border border-border bg-panel/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted">Search Summary</p>
                {[
                  "검색 우선 노출",
                  "빠른 필터 칩 5개 고정",
                  "상세 필터는 보조 탐색",
                  "지도와 리스트는 항상 동기화"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-bg/52 px-3 py-2 text-sm text-text">
                    <span className="h-2 w-2 rounded-full bg-active" />
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

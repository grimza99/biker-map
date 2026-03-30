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
    <PageWrapper className="relative overflow-hidden p-0 text-[color:var(--color-text)]" innerClassName="gap-0">
      <div
        className="relative min-h-[calc(100vh-11rem)] overflow-hidden rounded-[20px] border"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg)",
          boxShadow: "0 18px 50px rgba(5, 6, 7, 0.34)"
        }}
      >
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
          <div className="absolute left-[18%] top-[32%] h-24 w-24 rounded-full border border-[color:var(--color-accent)]/20 bg-[color:var(--color-accent)]/10 blur-[1px]" />
          <div className="absolute right-[22%] top-[26%] h-20 w-20 rounded-full border border-[color:var(--color-active)]/20 bg-[color:var(--color-active)]/10 blur-[1px]" />
          <div className="absolute bottom-[16%] left-[30%] h-28 w-28 rounded-full border border-[color:var(--color-info)]/15 bg-[color:var(--color-info)]/8 blur-[1px]" />
        </div>

        <div className="absolute inset-0">
          <div className="flex w-full items-start justify-between gap-4 p-5 md:p-6">
            <div className="grid max-w-2xl gap-4">
              <div className="grid gap-2 rounded-[26px] border bg-[color:var(--color-panel)]/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="grid gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-active)]">
                      Map Search
                    </p>
                    <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-text)]">지도</h1>
                    <p className="max-w-2xl text-sm leading-6 text-[color:var(--color-muted)]">
                      지도 UI를 배경에 꽉 채우고, 검색과 필터는 오버레이로 겹치는 구조입니다.
                    </p>
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{
                      borderColor: "rgba(229, 87, 47, 0.22)",
                      backgroundColor: "rgba(229, 87, 47, 0.10)",
                      color: "var(--color-accent)"
                    }}
                  >
                    검색 우선
                  </span>
                </div>

                <label
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-[color:var(--color-muted)] transition focus-within:ring-2 focus-within:ring-[color:var(--color-active)]/20"
                  htmlFor="map-search"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "rgba(17, 19, 21, 0.86)"
                  }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--color-accent)]"
                    style={{ backgroundColor: "rgba(229, 87, 47, 0.12)" }}
                    aria-hidden="true"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <div className="grid flex-1 gap-1">
                    <span className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--color-muted)]/80">
                      Search
                    </span>
                    <input
                      id="map-search"
                      name="map-search"
                      type="search"
                      placeholder="장소, 카테고리, 브랜드, 지역 검색"
                      className="w-full bg-transparent text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] outline-none"
                    />
                  </div>
                  <span
                    className="rounded-full border px-3 py-1 text-[11px] font-medium"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "rgba(35, 42, 49, 0.72)",
                      color: "var(--color-text)"
                    }}
                  >
                    지도 전체
                  </span>
                </label>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">빠른 필터</h2>
                    <p className="text-xs text-[color:var(--color-muted)]">5개 핵심 카테고리를 바로 전환</p>
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
                            active ? "text-[color:var(--color-text)]" : "text-[color:var(--color-muted)]"
                          )}
                          style={{
                            borderColor: active ? "rgba(229, 87, 47, 0.30)" : "var(--color-border)",
                            backgroundColor: active ? "rgba(229, 87, 47, 0.14)" : "rgba(29, 34, 40, 0.62)",
                            boxShadow: active ? "0 10px 24px rgba(229, 87, 47, 0.28)" : undefined
                          }}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <aside className="hidden w-full max-w-[22rem] md:block">
              <div className="grid gap-4 rounded-[26px] border bg-[color:var(--color-panel)]/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--color-muted)]">
                      Detail Filters
                    </p>
                    <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--color-text)]">상세 필터</h2>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 text-xs font-medium transition"
                    style={{
                      borderColor: "rgba(229, 87, 47, 0.22)",
                      backgroundColor: "rgba(229, 87, 47, 0.08)",
                      color: "var(--color-text)"
                    }}
                  >
                    초기화
                  </button>
                </div>

                <div className="grid gap-3">
                  {detailFilters.map((filter) => (
                    <div
                      key={filter.label}
                      className="grid gap-2 rounded-2xl border p-4 transition"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "rgba(17, 19, 21, 0.52)"
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-1">
                          <p className="text-sm font-medium text-[color:var(--color-text)]">{filter.label}</p>
                          <p className="text-xs text-[color:var(--color-muted)]">{filter.hint}</p>
                        </div>
                        <span
                          className="rounded-full border px-3 py-1 text-xs font-medium"
                          style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "rgba(29, 34, 40, 0.68)",
                            color: "var(--color-text)"
                          }}
                        >
                          {filter.value}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: filter.label === "검색 반경" ? "58%" : filter.label === "운영 상태" ? "72%" : filter.label === "주차 가능" ? "64%" : "76%",
                            background: "linear-gradient(90deg, var(--color-accent), var(--color-active))"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-[22px] border bg-[color:var(--color-panel)]/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--color-muted)]">Search Summary</p>
                {[
                  "검색 우선 노출",
                  "빠른 필터 칩 5개 고정",
                  "상세 필터는 보조 탐색",
                  "지도와 리스트는 항상 동기화"
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "rgba(17, 19, 21, 0.52)",
                      color: "var(--color-text)"
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-active)" }} />
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

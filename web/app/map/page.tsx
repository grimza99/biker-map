import { cn } from "@shared/lib";
import { PageWrapper } from "@shared/ui";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const detailFilters = [
  { label: "검색 반경", value: "5km", hint: "현재 위치 중심", fill: "58%" },
  { label: "운영 상태", value: "영업중", hint: "열린 장소만", fill: "72%" },
  { label: "주차 가능", value: "우선", hint: "바이크 주차", fill: "64%" },
  { label: "평점", value: "4.3+", hint: "추천 기준", fill: "76%" }
] as const;

export default function MapPage() {
  return (
    <PageWrapper
      className="bg-[linear-gradient(180deg,rgba(23,26,30,0.98)_0%,rgba(29,34,40,0.96)_42%,rgba(17,19,21,0.98)_100%)] text-[color:var(--text)] shadow-[0_18px_50px_rgba(5,6,7,0.34)]"
      innerClassName="gap-5"
    >
      <header className="grid gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--active)]">
          Map Search
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text)]">지도</h1>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              PM 우선순위에 맞춰 검색을 먼저 두고, 빠른 필터를 즉시 전개한 뒤 상세 필터로 탐색을 좁히는 구조입니다.
            </p>
          </div>
          <span
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: "rgba(0, 194, 168, 0.22)",
              backgroundColor: "rgba(0, 194, 168, 0.10)",
              color: "var(--active)"
            }}
          >
            검색 우선
          </span>
        </div>
      </header>

      <section
        className="grid gap-3 rounded-3xl border p-4 backdrop-blur"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "rgba(23, 26, 30, 0.82)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)"
        }}
      >
        <label
          className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-[color:var(--muted)] transition focus-within:ring-2 focus-within:ring-[color:var(--active)]/20"
          htmlFor="map-search"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "rgba(17, 19, 21, 0.86)"
          }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--accent)]"
            style={{ backgroundColor: "rgba(229, 87, 47, 0.12)" }}
          >
            ⌕
          </span>
          <div className="grid flex-1 gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]/80">
              Search
            </span>
            <input
              id="map-search"
              name="map-search"
              type="search"
              placeholder="장소, 카테고리, 브랜드, 지역 검색"
              className="w-full bg-transparent text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] outline-none"
            />
          </div>
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-medium"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "rgba(35, 42, 49, 0.72)",
              color: "var(--text)"
            }}
          >
            지도 전체
          </span>
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--text)]">빠른 필터</h2>
            <p className="text-xs text-[color:var(--muted)]">5개 핵심 카테고리를 바로 전환</p>
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
                    active ? "text-[color:var(--text)]" : "text-[color:var(--muted)]"
                  )}
                  style={{
                    borderColor: active ? "rgba(229, 87, 47, 0.30)" : "var(--border)",
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
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <div
          className="relative overflow-hidden rounded-[28px] border p-4"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "rgba(23, 26, 30, 0.84)",
            boxShadow: "0 18px 50px rgba(5, 6, 7, 0.34)"
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(229, 87, 47, 0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(0, 194, 168, 0.12), transparent 26%)"
            }}
          />
          <div
            className="relative grid min-h-[340px] gap-4 rounded-[22px] border p-4"
            style={{
              borderColor: "var(--border)",
              background: "linear-gradient(180deg, rgba(29, 34, 40, 0.88), rgba(17, 19, 21, 0.96))"
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">Map Canvas</p>
                <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--text)]">지도 영역</h2>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "rgba(35, 42, 49, 0.68)",
                  color: "var(--muted)"
                }}
              >
                현재 위치 기준
              </span>
            </div>

            <div
              className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-[20px] border"
              style={{
                borderColor: "var(--border)",
                background:
                  "radial-gradient(circle at center, rgba(229, 87, 47, 0.16), transparent 38%), linear-gradient(135deg, rgba(29, 34, 40, 0.96), rgba(17, 19, 21, 0.98))"
              }}
            >
              <div
                className="absolute inset-x-0 top-1/2 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(229, 87, 47, 0.36), transparent)" }}
              />
              <div
                className="absolute inset-y-0 left-1/2 w-px"
                style={{ background: "linear-gradient(180deg, transparent, rgba(0, 194, 168, 0.22), transparent)" }}
              />

              <div className="grid place-items-center gap-3 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border text-2xl"
                  style={{
                    borderColor: "rgba(229, 87, 47, 0.28)",
                    backgroundColor: "rgba(229, 87, 47, 0.12)",
                    color: "var(--accent)",
                    boxShadow: "0 10px 24px rgba(229, 87, 47, 0.28)"
                  }}
                >
                  ◎
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-[color:var(--text)]">
                    검색 결과가 이 영역에 지도 마커로 반영됩니다.
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    빠른 필터와 상세 필터 변경에 따라 중심 위치와 리스트가 동기화됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <section
            className="rounded-[26px] border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "rgba(23, 26, 30, 0.84)",
              boxShadow: "0 18px 50px rgba(5, 6, 7, 0.34)"
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Detail Filters
                </p>
                <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--text)]">상세 필터</h2>
              </div>
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-xs font-medium transition"
                style={{
                  borderColor: "rgba(229, 87, 47, 0.22)",
                  backgroundColor: "rgba(229, 87, 47, 0.08)",
                  color: "var(--text)"
                }}
              >
                초기화
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {detailFilters.map((filter) => (
                <div
                  key={filter.label}
                  className="grid gap-2 rounded-2xl border p-4 transition"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "rgba(17, 19, 21, 0.52)"
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium text-[color:var(--text)]">{filter.label}</p>
                      <p className="text-xs text-[color:var(--muted)]">{filter.hint}</p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-medium"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "rgba(29, 34, 40, 0.68)",
                        color: "var(--text)"
                      }}
                    >
                      {filter.value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: filter.fill,
                        background: "linear-gradient(90deg, var(--accent), var(--active))"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-[26px] border p-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "rgba(23, 26, 30, 0.84)",
              boxShadow: "0 18px 50px rgba(5, 6, 7, 0.34)"
            }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">Search Summary</p>
            <div className="mt-3 grid gap-2">
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
                    borderColor: "var(--border)",
                    backgroundColor: "rgba(17, 19, 21, 0.52)",
                    color: "var(--text)"
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--active)" }} />
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </PageWrapper>
  );
}

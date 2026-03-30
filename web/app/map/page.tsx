import { PageWrapper } from "@shared/ui";
import { cn } from "@shared/lib";

const quickFilters = ["주유소", "정비소", "카페", "맛집", "휴게/쉼터"] as const;

const detailFilters = [
  {
    label: "검색 반경",
    value: "5km",
    hint: "현재 위치 중심"
  },
  {
    label: "운영 상태",
    value: "영업중",
    hint: "열린 장소만"
  },
  {
    label: "주차 가능",
    value: "우선",
    hint: "바이크 주차"
  },
  {
    label: "평점",
    value: "4.3+",
    hint: "추천 기준"
  }
] as const;

export default function MapPage() {
  return (
    <PageWrapper
      className="border-[color:var(--border)] bg-[linear-gradient(180deg,#09111f_0%,#0a0f18_44%,#0b1220_100%)] text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.48)]"
      innerClassName="gap-5"
    >
      <header className="grid gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">Map Search</p>
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">지도</h1>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              PM 우선순위에 맞춰 검색을 가장 먼저 두고, 빠른 필터를 즉시 전개한 뒤 상세 필터로 탐색을 좁히는 구조입니다.
            </p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            검색 우선
          </span>
        </div>
      </header>

      <section className="grid gap-3 rounded-3xl border border-white/8 bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur">
        <label
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-400 transition focus-within:border-cyan-400/40 focus-within:ring-2 focus-within:ring-cyan-400/20"
          htmlFor="map-search"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">⌕</span>
          <div className="grid flex-1 gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Search</span>
            <input
              id="map-search"
              name="map-search"
              type="search"
              placeholder="장소, 카테고리, 브랜드, 지역 검색"
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
            지도 전체
          </span>
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-[-0.02em] text-white">빠른 필터</h2>
            <p className="text-xs text-slate-400">5개 핵심 카테고리를 바로 전환</p>
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
                      ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/20 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-slate-950/70 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.4)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_26%)]" />
          <div className="relative grid min-h-[340px] gap-4 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(15,23,42,0.72))] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Map Canvas</p>
                <h2 className="text-base font-semibold tracking-[-0.02em] text-white">지도 영역</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                현재 위치 기준
              </span>
            </div>

            <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-[20px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(8,15,28,0.98))]">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />

              <div className="grid place-items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/12 text-2xl text-cyan-200 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
                  ◎
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-white">검색 결과가 이 영역에 지도 마커로 반영됩니다.</p>
                  <p className="text-xs text-slate-400">빠른 필터와 상세 필터 변경에 따라 중심 위치와 리스트가 동기화됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <section className="rounded-[26px] border border-white/8 bg-slate-950/70 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.38)]">
            <div className="flex items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Detail Filters</p>
                <h2 className="text-base font-semibold tracking-[-0.02em] text-white">상세 필터</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/15"
              >
                초기화
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {detailFilters.map((filter) => (
                <div
                  key={filter.label}
                  className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium text-white">{filter.label}</p>
                      <p className="text-xs text-slate-400">{filter.hint}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-100">
                      {filter.value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300/80 via-cyan-400/70 to-sky-500/80"
                      style={{ width: filter.label === "검색 반경" ? "58%" : filter.label === "운영 상태" ? "72%" : filter.label === "주차 가능" ? "64%" : "76%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/8 bg-slate-950/70 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.38)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Search Summary</p>
            <div className="mt-3 grid gap-2">
              {[
                "검색 우선 노출",
                "빠른 필터 칩 5개 고정",
                "상세 필터는 보조 탐색",
                "지도와 리스트는 항상 동기화"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
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

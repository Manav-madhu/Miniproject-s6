export function SkeletonResult() {
  return (
    <section className="mx-auto mt-8 grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel animate-pulse rounded-[28px] p-6">
        <div className="h-80 rounded-3xl bg-slate-800/70" />
      </div>
      <div className="space-y-6">
        <div className="glass-panel animate-pulse rounded-[28px] p-6">
          <div className="h-6 w-1/2 rounded bg-slate-800/70" />
          <div className="mt-4 h-4 w-11/12 rounded bg-slate-800/70" />
          <div className="mt-3 h-4 w-8/12 rounded bg-slate-800/70" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-slate-800/70" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

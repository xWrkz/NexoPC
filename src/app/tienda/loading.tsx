export default function CatalogLoading() {
  return <div className="mx-auto max-w-[90rem] px-6 py-16"><div className="h-4 w-32 animate-pulse rounded bg-orange-400/20"/><div className="mt-4 h-14 max-w-2xl animate-pulse rounded-xl bg-white/6"/><div className="mt-10 h-16 animate-pulse rounded-2xl bg-white/5"/><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[.78] animate-pulse rounded-2xl border border-white/8 bg-white/[.035]"/>)}</div></div>;
}

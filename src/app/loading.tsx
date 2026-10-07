import Image from "next/image";

export default function Loading() {
  return <div className="grid min-h-[65vh] place-items-center px-6"><div className="text-center"><div className="relative mx-auto grid size-28 place-items-center"><span className="orbital-ring absolute inset-0 rounded-full border border-dashed border-cyan-300/25"/><span className="orbital-ring-reverse absolute inset-3 rounded-full border border-orange-300/20"/><Image src="/brand/icon-mark.webp" width={64} height={42} alt="" className="animate-pulse"/></div><p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-slate-500">Preparando tu experiencia NexoPC</p></div></div>;
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Menu, Search, ShoppingBag, X, Cpu } from "lucide-react";
import { m, AnimatePresence } from "motion/react";
import { useCartStore } from "@/store/cartStore";

const links = [{ href: "/", label: "Inicio" }, { href: "/tienda", label: "Componentes" }, { href: "/arma-tu-pc", label: "Arma tu PC" }];
export default function Header() {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  const itemCount = useCartStore((s) => s.getItemCount());
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const search = (event: React.FormEvent) => { event.preventDefault(); router.push(`/tienda${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); setOpen(false); };
  return <header className="sticky top-0 z-50 border-b border-white/8 bg-[#070a11]/84 backdrop-blur-xl"><div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6">
    <Link href="/" className="focus-ring flex items-center gap-2.5 font-display text-2xl font-extrabold" aria-label="NexoPC inicio"><span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-600 text-sm text-slate-950"><Cpu size={18}/></span>Nexo<span className="text-orange-400">PC</span></Link>
    <nav className="ml-7 hidden items-center gap-1 lg:flex">{links.map((link) => <Link key={link.href} href={link.href} className={`focus-ring rounded-lg px-3 py-2 text-sm font-semibold transition ${pathname === link.href ? "bg-white/8 text-white" : "text-slate-400 hover:text-white"}`}>{link.label}</Link>)}</nav>
    <form onSubmit={search} className="ml-auto hidden w-full max-w-xs md:block"><label className="sr-only" htmlFor="site-search">Buscar productos</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/><input id="site-search" className="field py-2 pl-9 text-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca tu próximo upgrade"/></div></form>
    <Link href="/carrito" className="focus-ring relative ml-auto rounded-xl border border-white/12 bg-white/5 p-2.5 text-slate-100 transition hover:border-orange-400/70 hover:bg-orange-400/10 md:ml-0" aria-label={`Carrito, ${mounted ? itemCount : 0} productos`}><ShoppingBag size={19}/>{mounted && itemCount > 0 && <m.span initial={{scale:0}} animate={{scale:1}} className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-slate-950">{itemCount > 99 ? "99+" : itemCount}</m.span>}</Link>
    <button className="focus-ring rounded-lg p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
  </div><AnimatePresence>{open && <m.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden border-t border-white/8 bg-[#0a0e17] lg:hidden"><div className="space-y-2 px-4 py-4"><form onSubmit={search}><label className="sr-only" htmlFor="mobile-search">Buscar productos</label><input id="mobile-search" className="field" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar productos"/></form>{links.map((link)=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-slate-200 hover:bg-white/6">{link.label}</Link>)}</div></m.div>}</AnimatePresence></header>;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useCartStore } from "@/store/cartStore";
import BrandLogo from "@/components/BrandLogo";

const links = [{ href: "/", label: "Inicio" }, { href: "/tienda", label: "Componentes" }, { href: "/arma-tu-pc", label: "Arma tu PC" }];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const itemCount = useCartStore((state) => state.getItemCount());
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/tienda${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    setOpen(false);
  };

  return <header className="site-header"><div className="mx-auto flex h-[4.8rem] max-w-[90rem] items-center gap-2 px-4 sm:px-6">
    <Link href="/" className="focus-ring brand-link" aria-label="NexoPC, ir al inicio"><span className="sm:hidden"><BrandLogo compact/></span><span className="hidden sm:block"><BrandLogo light/></span><span className="brand-energy"/></Link>
    <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">{links.map((link) => { const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} className={`nav-link focus-ring ${active ? "nav-link-active" : ""}`}>{link.label}{active ? <m.span layoutId="nav-active" className="nav-active-line"/> : null}</Link>; })}</nav>
    <div className="ml-auto hidden items-center gap-2 lg:flex"><button type="button" onClick={() => setSearchOpen((value) => !value)} className={`header-icon-button focus-ring ${searchOpen ? "header-icon-button-active" : ""}`} aria-label="Buscar componentes" aria-expanded={searchOpen}><Search size={18}/></button><Link href="/arma-tu-pc?modo=guiado" className="header-guide focus-ring hidden xl:flex"><Sparkles size={15}/>Encuentra tu PC</Link></div>
    <Link href="/carrito" className="cart-button focus-ring" aria-label={`Carrito, ${mounted ? itemCount : 0} productos`}><ShoppingBag size={19}/>{mounted && itemCount > 0 ? <m.span key={itemCount} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="cart-count">{itemCount > 99 ? "99+" : itemCount}</m.span> : null}</Link>
    <button className="focus-ring rounded-xl border border-white/10 p-2.5 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
  </div>
  <AnimatePresence>{searchOpen ? <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="header-search-panel hidden lg:block"><form onSubmit={search} className="mx-auto flex max-w-[90rem] gap-3 px-6 py-3"><label className="sr-only" htmlFor="site-search">Buscar productos</label><div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/65" size={17}/><input autoFocus id="site-search" className="header-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un componente, marca o SKU…"/></div><button className="btn-primary focus-ring" type="submit">Buscar</button></form></m.div> : null}</AnimatePresence>
  <AnimatePresence>{open ? <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/8 bg-[#080c15]/98 lg:hidden"><div className="space-y-2 px-4 py-4"><form onSubmit={search} className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/60" size={16}/><input className="field pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar componentes" aria-label="Buscar productos"/></form>{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-200 hover:bg-white/6">{link.label}</Link>)}<Link href="/arma-tu-pc?modo=guiado" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full"><Sparkles size={16}/>Ayúdame a elegir</Link></div></m.div> : null}</AnimatePresence>
  </header>;
}

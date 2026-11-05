"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
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
    setSearchOpen(false);
  };

  useEffect(() => {
    if (!open && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, searchOpen]);

  return <header className="site-header"><div className="mx-auto flex h-[4.8rem] max-w-[90rem] items-center gap-2 px-4 sm:px-6">
    <Link href="/" className="focus-ring brand-link" aria-label="NexoPC, ir al inicio"><span className="min-[360px]:hidden"><BrandLogo compact/></span><span className="hidden min-[360px]:block"><BrandLogo light/></span><span className="brand-energy"/></Link>
    <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">{links.map((link) => { const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`nav-link focus-ring ${active ? "nav-link-active" : ""}`}>{link.label}{active ? <m.span layoutId="nav-active" className="nav-active-line"/> : null}</Link>; })}</nav>
    <div className="ml-auto flex items-center gap-2"><button type="button" onClick={() => { setSearchOpen((value) => !value); setOpen(false); }} className={`header-icon-button focus-ring ${searchOpen ? "header-icon-button-active" : ""}`} aria-label="Buscar componentes" aria-expanded={searchOpen}><Search size={18}/></button><Link href="/arma-tu-pc?modo=guiado" className="header-guide focus-ring hidden xl:flex"><Sparkles size={15}/>Ayúdame a elegir</Link>
    <Link href="/registro" className={`header-icon-button focus-ring ${pathname === "/registro" ? "header-icon-button-active" : ""}`} aria-label="Crear cuenta" title="Crear cuenta"><UserRound size={18}/></Link>
    <Link href="/carrito" className="cart-button focus-ring" aria-label={`Carrito, ${mounted ? itemCount : 0} productos`}><ShoppingBag size={19}/>{mounted && itemCount > 0 ? <m.span key={itemCount} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="cart-count">{itemCount > 99 ? "99+" : itemCount}</m.span> : null}</Link>
    <button type="button" className="focus-ring grid size-[2.6rem] place-items-center rounded-[.78rem] border border-white/15 text-white lg:hidden" onClick={() => { setOpen(!open); setSearchOpen(false); }} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>{open ? <X size={20}/> : <Menu size={20}/>}</button></div>
  </div>
  <AnimatePresence>{searchOpen ? <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="header-search-panel"><form onSubmit={search} className="mx-auto flex max-w-[90rem] gap-3 px-4 py-3 sm:px-6"><label className="sr-only" htmlFor="site-search">Buscar productos</label><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/65" size={17}/><input autoFocus id="site-search" type="search" enterKeyHint="search" className="header-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un componente o marca…"/></div><button className="btn-primary focus-ring" type="submit">Buscar</button></form></m.div> : null}</AnimatePresence>
  <AnimatePresence>{open ? <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/8 bg-[#080c15]/98 lg:hidden"><div className="space-y-2 px-4 py-4">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-200 hover:bg-white/6">{link.label}</Link>)}<Link href="/registro" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-200 hover:bg-white/6">Crear cuenta</Link><Link href="/arma-tu-pc?modo=guiado" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full"><Sparkles size={16}/>Ayúdame a elegir</Link></div></m.div> : null}</AnimatePresence>
  </header>;
}

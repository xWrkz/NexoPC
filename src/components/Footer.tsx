import Link from "next/link";
import { Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="focus-ring inline-block" aria-label="NexoPC, ir al inicio">
            <BrandLogo className="footer-logo" />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            E-commerce especializado en hardware de alto rendimiento y ensamblaje de PC a medida en Trujillo, Perú.
          </p>
          <Link href="/arma-tu-pc?modo=guiado" className="footer-help focus-ring">
            <Sparkles size={15} />
            Configura tu equipo paso a paso
          </Link>
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-200 mb-4">Tienda</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/tienda" className="footer-link focus-ring">
                Componentes
              </Link>
            </li>
            <li>
              <Link href="/arma-tu-pc" className="footer-link focus-ring">
                Arma tu PC
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="footer-link focus-ring">
                Mi carrito
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-200 mb-4">Soporte</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/soporte" className="footer-link focus-ring">
                Contacto y asesoría
              </Link>
            </li>
            <li>
              <Link href="/garantia" className="footer-link focus-ring">
                Política de garantía
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-200 mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/privacidad" className="footer-link focus-ring">
                Privacidad de datos
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="footer-link focus-ring">
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/8 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NexoPC · Trujillo, La Libertad, Perú. Todos los derechos reservados.
      </div>
    </footer>
  );
}
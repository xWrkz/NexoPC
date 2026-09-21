import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">
            Nexo<span className="text-orange-500">PC</span>
          </h3>
          <p className="text-gray-400 text-sm">
            E-commerce de hardware y ensamblaje gamer en Trujillo, Perú.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/tienda" className="hover:text-orange-500">Componentes</Link></li>
            <li><Link href="/arma-tu-pc" className="hover:text-orange-500">Arma tu PC</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Soporte</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/soporte" className="hover:text-orange-500">Contacto</Link></li>
            <li><Link href="/garantia" className="hover:text-orange-500">Garantía</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/privacidad" className="hover:text-orange-500">Privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-orange-500">Términos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © 2026 NexoPC. Todos los derechos reservados.
      </div>
    </footer>
  );
}

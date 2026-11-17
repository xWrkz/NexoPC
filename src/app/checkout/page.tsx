import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { loadCustomer, readSession } from "@/lib/account/session";

const LOGIN = "/ingresar?siguiente=/checkout";

// Solo compran clientes con cuenta: así cada pedido queda en su historial.
export default async function CheckoutPage() {
  const session = await readSession();
  if (!session) redirect(LOGIN);

  const customer = await loadCustomer(session);
  if (customer.status === "expired") redirect(`${LOGIN}&sesion=expirada`);

  // Si el perfil no carga, el formulario funciona igual: el backend vuelve a validar la sesión al pedir.
  return <CheckoutForm customer={customer.status === "ok" ? customer.data : null}/>;
}

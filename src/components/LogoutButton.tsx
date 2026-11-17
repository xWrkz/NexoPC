"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // refresh descarta las vistas en caché que contienen datos de la cuenta.
      router.replace("/");
      router.refresh();
    }
  };
  return <button type="button" onClick={logout} disabled={loading} className="btn-secondary focus-ring disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={17}/> : <LogOut size={17}/>}Cerrar sesión</button>;
}

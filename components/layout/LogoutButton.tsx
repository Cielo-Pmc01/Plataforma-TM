"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-soft hover:border-line-2 hover:text-text cursor-pointer"
    >
      Cerrar sesión
    </button>
  );
}

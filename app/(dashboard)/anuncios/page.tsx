import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { AnunciosView } from "@/components/anuncios/AnunciosView";

// El editor cambia anuncios reales en Meta: solo administradores.
export default async function AnunciosPage() {
  const profile = await getCurrentPlatformUser();
  if (profile?.role !== "admin") redirect("/");
  return <AnunciosView />;
}

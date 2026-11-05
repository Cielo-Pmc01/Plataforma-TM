import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { loadMapa } from "@/lib/control/portafolio";
import { ConexionesView } from "@/components/control/ConexionesView";

export const dynamic = "force-dynamic";

export default async function ConexionesPage() {
  const profile = await getCurrentPlatformUser();
  if (!isControlOwner(profile?.email)) redirect("/meta-ads");

  const { mapa, error } = await loadMapa();
  return <ConexionesView mapa={mapa} error={error} />;
}

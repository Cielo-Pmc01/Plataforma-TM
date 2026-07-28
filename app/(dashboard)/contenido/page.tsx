import { getCurrentPlatformUser } from "@/lib/platform";
import { ContenidoTabs } from "@/components/cm/ContenidoTabs";
import { SPSummaryView } from "@/components/cm/SPSummaryView";

export default async function ContenidoPage() {
  const profile = await getCurrentPlatformUser();
  const canManage = profile?.role === "cm" || profile?.role === "admin";

  if (!canManage) {
    return <SPSummaryView />;
  }

  return <ContenidoTabs />;
}

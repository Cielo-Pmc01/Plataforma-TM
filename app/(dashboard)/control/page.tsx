import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { loadControlData } from "@/lib/control/data";
import { ControlView } from "@/components/control/ControlView";

export const dynamic = "force-dynamic";

export default async function ControlPage() {
  const profile = await getCurrentPlatformUser();
  if (!isControlOwner(profile?.email)) redirect("/meta-ads");

  const data = await loadControlData();
  return <ControlView data={data} />;
}

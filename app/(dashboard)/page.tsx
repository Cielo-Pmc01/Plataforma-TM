import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { Card, CardHeader, CardTitle, CardSub } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SECTIONS = [
  {
    href: "/meta-ads",
    title: "Meta Ads",
    sub: "Campañas, cuentas e inversión de las marcas",
    color: "var(--color-cyan)",
    label: "Activo",
  },
  {
    href: "/contenido",
    title: "Contenido (CM)",
    sub: "Pipeline editorial y generador de piezas para redes",
    color: "var(--color-violet)",
    label: "Activo",
  },
];

export default async function DashboardHome() {
  const profile = await getCurrentPlatformUser();
  if (isControlOwner(profile?.email)) redirect("/control");

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <div>
                <h1 className="text-2xl font-extrabold mt-1">¿Qué querés abrir?</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:border-line-2 transition cursor-pointer h-full">
              <CardHeader>
                <div>
                  <CardTitle>{s.title}</CardTitle>
                  <CardSub>{s.sub}</CardSub>
                </div>
                <Badge label={s.label} color={s.color} />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

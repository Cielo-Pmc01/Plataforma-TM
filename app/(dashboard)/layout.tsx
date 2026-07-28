import Link from "next/link";
import { getCurrentPlatformUser } from "@/lib/platform";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { HeaderNav } from "@/components/layout/HeaderNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentPlatformUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan to-lime flex items-center justify-center text-[#061014] font-extrabold text-sm">
            TM
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold">Plataforma TM</span>
            <span className="text-[11px] text-muted">Meta Ads + Contenido</span>
          </div>
        </Link>
        <HeaderNav />
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-xs font-bold text-soft">{profile?.email ?? ""}</div>
            <div className="text-[10px] text-muted uppercase">{profile?.role ?? ""}</div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

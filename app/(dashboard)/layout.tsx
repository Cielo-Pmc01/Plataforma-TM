import Link from "next/link";
import { getCurrentPlatformUser } from "@/lib/platform";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { HeaderNav } from "@/components/layout/HeaderNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentPlatformUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 border-b border-line">
        <div className="flex items-center justify-between gap-3 sm:contents">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan to-lime flex items-center justify-center text-[#061014] font-extrabold text-sm flex-shrink-0">
              TM
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold">Plataforma TM</span>
              <span className="text-[11px] text-muted hidden sm:inline">Meta Ads + Contenido</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:hidden">
            <div className="text-right leading-tight">
              <div className="text-[11px] font-bold text-soft truncate max-w-[140px]">{profile?.email ?? ""}</div>
              <div className="text-[9px] text-muted uppercase">{profile?.role ?? ""}</div>
            </div>
            <LogoutButton />
          </div>
        </div>
        <div className="overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
          <HeaderNav />
        </div>
        <div className="hidden sm:flex items-center gap-3">
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

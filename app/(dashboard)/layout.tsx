import Link from "next/link";
import { getCurrentPlatformUser } from "@/lib/platform";
import { isControlOwner } from "@/lib/control/owner";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { MiAgenteButton } from "@/components/layout/MiAgenteButton";

function Mark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="8" fill="#172a34" stroke="#35596a" />
        <path d="M5 21 L12 11 L16 16 L19 12.5 L25 21 Z" fill="#6fd3c7" />
        <path d="M10.4 13.3 L12 11 L13.6 13 Z" fill="#e9f0f2" />
      </svg>
      <span className="leading-tight">
        <span className="block text-[14px] font-bold">Plataforma TM</span>
        <span className="block text-[11px] text-muted">Adventure Center</span>
      </span>
    </Link>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentPlatformUser();
  const owner = isControlOwner(profile?.email);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="border-b border-line bg-bg/80 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-6 lg:px-4 lg:py-5 lg:h-full">
          <Mark />
          <div className="hidden lg:block lg:flex-1">
            <HeaderNav showControl={owner} />
          </div>
          {owner && (
            <div className="hidden lg:block">
              <MiAgenteButton />
            </div>
          )}
          <div className="flex items-center gap-3 lg:flex-col lg:items-stretch lg:gap-2 lg:border-t lg:border-line lg:pt-4">
            {owner && (
              <div className="lg:hidden">
                <MiAgenteButton compacto />
              </div>
            )}
            <div className="text-right leading-tight lg:text-left">
              <div className="max-w-[160px] truncate text-[12px] font-semibold text-soft">{profile?.email ?? ""}</div>
              <div className="text-[11px] text-muted">{profile?.role ?? ""}</div>
            </div>
            <LogoutButton />
          </div>
        </div>
        <div className="overflow-x-auto px-4 pb-3 lg:hidden">
          <HeaderNav showControl={owner} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

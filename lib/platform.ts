import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "viewer" | "cm";

export interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export async function getCurrentPlatformUser(): Promise<PlatformUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .schema("platform")
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as PlatformUser;
}

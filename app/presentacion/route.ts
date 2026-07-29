import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.PRESENTATION_EMAIL!,
    password: process.env.PRESENTATION_PASSWORD!,
  });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo iniciar la vista de presentación" },
      { status: 500 },
    );
  }

  const base = process.env.PUBLIC_SITE_URL || request.nextUrl.origin;
  return NextResponse.redirect(new URL("/meta-ads", base));
}

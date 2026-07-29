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

  const url = request.nextUrl.clone();
  url.pathname = "/meta-ads";
  return NextResponse.redirect(url);
}

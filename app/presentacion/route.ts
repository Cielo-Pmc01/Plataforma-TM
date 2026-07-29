import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  return NextResponse.redirect(new URL("/meta-ads", request.url));
}

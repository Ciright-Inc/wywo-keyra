import { NextResponse } from "next/server";
import { ADMIN_JWT_COOKIE } from "@/lib/adminJwt";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_JWT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

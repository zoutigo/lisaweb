import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = {
  email?: string | null;
  isAdmin?: boolean;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email)
      return NextResponse.json({ isAdmin: false });

    const user = session.user as SessionUser;
    return NextResponse.json({ isAdmin: Boolean(user?.isAdmin) });
  } catch (e) {
    console.error("admin/me error", e);
    return NextResponse.json({ isAdmin: false });
  }
}

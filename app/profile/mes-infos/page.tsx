export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileInfosClient from "./profile-infos-client";
import type { Session } from "next-auth";

export const metadata = {
  title: "Mes informations",
};

export default async function ProfileInfosPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isAdmin: true,
    },
  });

  if (!user) redirect("/");

  return (
    <ProfileInfosClient
      initialUser={{
        id: user.id,
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
        isAdmin: user.isAdmin,
      }}
    />
  );
}

export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompleteRdvClient from "./complete-rdv-client";
import type { Session } from "next-auth";

export const metadata = {
  title: "Compléter mes informations",
};

export default async function CompleteRdvPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session || !session.user?.email) redirect("/");
  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
  });

  if (!user) redirect("/");

  return (
    <CompleteRdvClient
      initialUser={{
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      }}
    />
  );
}

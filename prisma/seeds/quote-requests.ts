import { prisma } from "@/lib/prisma";

export async function seedQuoteRequests() {
  const offers = await prisma.serviceOffer.findMany({
    orderBy: { order: "asc" },
  });
  const options = await prisma.offerOption.findMany({
    orderBy: { order: "asc" },
  });
  const firstOffer = offers[0];
  const optIds = options.slice(0, 2).map((o) => ({ id: o.id }));

  const existing = await prisma.quoteRequest.count();
  if (existing > 0) return;

  await prisma.quoteRequest.create({
    data: {
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.com",
      phone: "+33600000000",
      projectDescription:
        "Site vitrine pour présenter mon activité locale, besoin d'un design moderne et d'options de paiement simple.",
      serviceOfferId: firstOffer?.id,
      offerOptions: {
        connect: optIds,
      },
      status: "NEW",
    },
  });
}

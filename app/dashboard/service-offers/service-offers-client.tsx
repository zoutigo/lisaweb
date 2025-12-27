"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";

type OfferListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  featuresCount: number;
};

type Props = {
  initialOffers: OfferListItem[];
};

export default function ServiceOffersClient({ initialOffers }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<OfferListItem[]>(initialOffers);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const onDelete = async (id: string) => {
    setConfirmId(null);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/dashboard/service-offers/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setItems((prev) => prev.filter((o) => o.id !== id));
    setPage(1);
    setMessage("Offre supprimée.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Formats d&apos;accompagnement
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Liste des offres avec accès à la fiche, à la modification ou à la
            suppression.
          </p>
        </div>
        <div className="flex gap-2">
          <BackLink className="hidden sm:inline-flex" />
          <ActionIconButton
            action="create"
            label="Nouvelle offre"
            tone="primary"
            onClick={() => router.push("/dashboard/service-offers/new")}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des offres
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {items.length} au total
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Aucune offre pour le moment.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.12em] text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Description courte</th>
                  <th className="px-4 py-3 text-left">Features</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((offer) => (
                    <tr key={offer.id} className="align-top">
                      <td className="px-4 py-3 text-gray-800">
                        <p className="font-semibold text-gray-900">
                          {offer.slug}
                        </p>
                        <p className="text-xs text-gray-500">{offer.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {offer.shortDescription}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {offer.featuresCount} éléments
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionIconButton
                            action="view"
                            label="Voir"
                            onClick={() =>
                              router.push(
                                `/dashboard/service-offers/${offer.id}`,
                              )
                            }
                          />
                          <ActionIconButton
                            action="edit"
                            label="Modifier"
                            tone="primary"
                            onClick={() =>
                              router.push(
                                `/dashboard/service-offers/${offer.id}/edit`,
                              )
                            }
                          />
                          <ActionIconButton
                            action="delete"
                            label="Supprimer"
                            tone="danger"
                            onClick={() => setConfirmId(offer.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > pageSize ? (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={items.length}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {message ? (
          <div className="mt-4">
            <ConfirmMessage type="success" message={message} />
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <ConfirmMessage type="error" message={error} />
          </div>
        ) : null}
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && onDelete(confirmId)}
        title="Supprimer cette offre ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";
import { Pagination } from "@/components/ui/pagination";

type QuoteItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  projectDescription: string;
  serviceOffer?: { title: string } | null;
  offerOptions: { id: string; title: string }[];
  status: string;
  createdAt: Date;
};

export default function QuotesClient({
  initialQuotes,
}: {
  initialQuotes: QuoteItem[];
}) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 6;

  const onDelete = async (id: string) => {
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/dashboard/quotes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setMessage("Devis supprimé.");
  };

  const paginated = quotes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Devis
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des devis</h1>
        <p className="text-sm text-gray-600">
          Liste des demandes de devis avec le format choisi et les options.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {quotes.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun devis pour le moment.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.12em] text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Format</th>
                  <th className="px-4 py-3 text-left">Options</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginated.map((q) => (
                  <tr key={q.id} className="align-top">
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {[q.firstName, q.lastName].filter(Boolean).join(" ") ||
                        "N/A"}
                      <div className="text-xs text-gray-500">
                        {new Date(q.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{q.email}</div>
                      <div className="text-xs text-gray-500">
                        {q.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {q.serviceOffer?.title || "Non précisé"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {q.offerOptions.length
                        ? q.offerOptions.map((o) => o.title).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{q.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ActionIconButton
                          action="view"
                          label="Voir"
                          onClick={() => {
                            alert(q.projectDescription);
                          }}
                        />
                        <ActionIconButton
                          action="delete"
                          tone="danger"
                          label="Supprimer"
                          onClick={() => setConfirmId(q.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={quotes.length}
            onPageChange={setPage}
          />
        </div>
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
        title="Supprimer ce devis ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

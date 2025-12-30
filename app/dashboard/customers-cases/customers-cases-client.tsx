"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/confirm-modal";
import { ConfirmMessage } from "@/components/confirm-message";
import { Pagination } from "@/components/ui/pagination";
import { BackLink } from "@/components/back-link";
import { ActionIconButton } from "@/components/ui/action-icon-button";

type CustomerCaseItem = {
  id: string;
  title: string;
  customer?: string;
  description: string;
  url?: string;
  createdAt: string;
  isActive: boolean;
};

type Props = {
  initialCases: CustomerCaseItem[];
};

export default function CustomersCasesClient({ initialCases }: Props) {
  const [items, setItems] = useState<CustomerCaseItem[]>(initialCases);
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pageSize = 6;

  const onDelete = async (id: string) => {
    setConfirmId(null);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/dashboard/customer-cases/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Suppression impossible.");
      return;
    }
    setItems((prev) => prev.filter((f) => f.id !== id));
    setPage(1);
    setMessage("Cas client supprimé.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Cas clients
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Gérez vos réalisations
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Liste des cas clients avec accès rapide à la fiche, à la
            modification ou à la suppression.
          </p>
        </div>
        <div className="flex gap-2">
          <BackLink className="hidden sm:inline-flex" />
          <ActionIconButton
            action="create"
            label="Nouveau cas client"
            tone="primary"
            onClick={() => router.push("/dashboard/customers-cases/new")}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des cas clients
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {items.length} au total
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            Aucun cas client pour le moment.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.12em] text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">URL</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-3 text-gray-800">
                        {item.customer || "—"}
                        <div className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-blue-600 break-words">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer">
                            {item.url}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.isActive ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            aria-hidden
                          />
                          {item.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ActionIconButton
                            action="view"
                            label="Voir"
                            onClick={() =>
                              router.push(
                                `/dashboard/customers-cases/${item.id}`,
                              )
                            }
                          />
                          <ActionIconButton
                            action="edit"
                            label="Modifier"
                            onClick={() =>
                              router.push(
                                `/dashboard/customers-cases/${item.id}/edit`,
                              )
                            }
                            tone="primary"
                          />
                          <ActionIconButton
                            action="delete"
                            label="Supprimer"
                            tone="danger"
                            onClick={() => setConfirmId(item.id)}
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
            totalCount={items.length}
            onPageChange={(p) => setPage(p)}
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
        title="Supprimer ce cas client ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
      />
    </div>
  );
}

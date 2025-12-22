"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  partnerId: number;
};

export function PartnerActions({ partnerId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/dashboard/partners/${partnerId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (!res.ok) {
      setError("La suppression a échoué.");
      return;
    }
    setConfirmOpen(false);
    router.push("/dashboard/partners");
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link
          href={`/dashboard/partners/${partnerId}/edit`}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Modifier
        </Link>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60"
        >
          Supprimer
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onCancel={() => {
          if (loading) return;
          setConfirmOpen(false);
        }}
        onConfirm={handleDelete}
        loading={loading}
        title="Supprimer ce partenaire ?"
        description="Cette action est définitive et retirera le partenaire de la liste."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </>
  );
}

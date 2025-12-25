"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionIconButton } from "@/components/ui/action-icon-button";

type Props = {
  partnerId: string;
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
        <ActionIconButton
          action="edit"
          label="Modifier"
          tone="primary"
          onClick={() => router.push(`/dashboard/partners/${partnerId}/edit`)}
        />
        <ActionIconButton
          action="delete"
          label="Supprimer"
          tone="danger"
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
        />
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

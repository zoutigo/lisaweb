"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/confirm-modal";
import { ActionIconButton } from "@/components/ui/action-icon-button";

type Props = {
  userId: string;
};

export function UserActions({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/dashboard/users/${userId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (!res.ok) {
      setError("La suppression a échoué.");
      return;
    }
    setConfirmOpen(false);
    router.push("/dashboard/users");
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
          onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
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
        title="Supprimer cet utilisateur ?"
        description="Cette action est définitive et supprimera l'utilisateur et ses données associées."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </>
  );
}

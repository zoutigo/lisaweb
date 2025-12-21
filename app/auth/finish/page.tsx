"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthFinishPage() {
  const [message, setMessage] = useState("Finalisation en cours...");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pendingToken = params.get("pendingToken");
    if (!pendingToken) {
      setMessage("Token manquant.");
      setTimeout(() => router.push("/rendezvous"), 3000);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/rendezvous/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendingToken }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || "Erreur de finalisation");
        }

        setMessage("Rendez-vous confirmé — un email vous a été envoyé.");
        setTimeout(() => router.push("/rendezvous"), 2500);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Erreur inconnue");
        setTimeout(() => router.push("/rendezvous"), 4000);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow">{message}</div>
    </div>
  );
}

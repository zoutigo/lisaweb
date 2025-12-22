"use client";
import { useEffect } from "react";

export default function PopupCallback() {
  useEffect(() => {
    try {
      // Notify opener that auth completed
      if (window.opener) {
        window.opener.postMessage(
          { nextauth: "success" },
          window.location.origin,
        );
        window.close();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div>Authentification terminée. Vous pouvez fermer cette fenêtre.</div>
  );
}

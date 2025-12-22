/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { ConfirmMessage } from "@/components/confirm-message";

describe("ConfirmMessage", () => {
  it("affiche un message de succès", () => {
    render(<ConfirmMessage type="success" message="Opération ok" />);
    expect(screen.getByText("Opération ok")).toHaveClass("bg-green-50");
  });

  it("affiche un message d'erreur", () => {
    render(<ConfirmMessage type="error" message="Erreur" />);
    expect(screen.getByText("Erreur")).toHaveClass("bg-red-50");
  });
});

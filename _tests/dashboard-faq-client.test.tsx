/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqClient from "@/app/dashboard/faq/faq-client";

describe("Dashboard FAQ client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it("désactive le submit tant que le formulaire est invalide puis crée une FAQ", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          question: "Question valide",
          answer: "Réponse valide",
          createdAt: new Date().toISOString(),
        }),
    });

    render(<FaqClient initialFaqs={[]} />);

    const submit = screen.getByRole("button", { name: /Ajouter/i });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText(/procédure/),
      "Comment faire un test ?",
    );
    await user.type(
      screen.getByPlaceholderText(/Expliquez clairement/),
      "En écrivant une réponse complète.",
    );

    await waitFor(() => expect(submit).toBeEnabled());

    await user.click(submit);

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      "/api/dashboard/faq",
    );
    await waitFor(() =>
      expect(screen.getByText(/FAQ ajoutée/i)).toBeInTheDocument(),
    );
  });

  it("préfille une FAQ, met à jour et gère la suppression avec confirmation", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            question: "Q mise à jour",
            answer: "R mise à jour",
            createdAt: new Date().toISOString(),
          }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    render(
      <FaqClient
        initialFaqs={[
          {
            id: 1,
            question: "Question existante",
            answer: "Réponse existante",
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Modifier/i }));

    const submit = screen.getByRole("button", { name: /Mettre à jour/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      "/api/dashboard/faq/1",
    );

    await user.click(screen.getByRole("button", { name: /Supprimer/i }));
    await waitFor(() =>
      expect(screen.getByText(/Supprimer la question/i)).toBeInTheDocument(),
    );
    await user.click(screen.getAllByRole("button", { name: /Supprimer/i })[1]);

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(
      "/api/dashboard/faq/1",
    );
    await waitFor(() =>
      expect(screen.getByText(/FAQ supprimée/i)).toBeInTheDocument(),
    );
  });
});

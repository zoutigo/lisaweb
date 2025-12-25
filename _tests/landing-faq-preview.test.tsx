/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingFaqPreview } from "@/components/landing-faq-preview";

describe("LandingFaqPreview", () => {
  it("affiche les questions issues de l'API et le lien vers la FAQ", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    (global.fetch as unknown) = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          categories: [
            {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Général",
              order: 1,
            },
          ],
          faqs: [
            {
              id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
              question: "Combien ça coûte ?",
              answer: "Une fourchette selon vos besoins.",
              category: {
                id: "11111111-1111-1111-1111-111111111111",
                name: "Général",
              },
              createdAt: new Date().toISOString(),
              categoryId: "11111111-1111-1111-1111-111111111111",
            },
          ],
        }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LandingFaqPreview />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Combien ça coûte/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: /questions fréquentes/i }),
    ).toHaveAttribute("href", "/faq");
  });
});

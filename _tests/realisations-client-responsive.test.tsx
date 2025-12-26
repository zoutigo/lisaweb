/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import RealisationsClient from "@/app/realisations/realisations-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const cases = [
  {
    id: "c1",
    title: "Titre 1",
    customer: "Client 1",
    description: "Desc 1",
    imageUrl: "/img1.png",
    result1: "Résultat 1",
    feature1: "Feature 1",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "c2",
    title: "Titre 2",
    customer: "Client 2",
    description: "Desc 2",
    imageUrl: "/img2.png",
    result1: "Résultat 2",
    feature1: "Feature 2",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "c3",
    title: "Titre 3",
    customer: "Client 3",
    description: "Desc 3",
    imageUrl: "/img3.png",
    result1: "Résultat 3",
    feature1: "Feature 3",
    createdAt: "2024-01-03T00:00:00.000Z",
  },
  {
    id: "c4",
    title: "Titre 4",
    customer: "Client 4",
    description: "Desc 4",
    imageUrl: "/img4.png",
    result1: "Résultat 4",
    feature1: "Feature 4",
    createdAt: "2024-01-04T00:00:00.000Z",
  },
];

describe("RealisationsClient responsive & pagination", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => cases,
    }) as unknown as typeof fetch;
  });

  const renderWithQC = (ui: React.ReactElement) => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  };

  it("affiche 3 cartes par page et la pagination pour 4 cas", () => {
    renderWithQC(<RealisationsClient initialCases={cases} />);

    expect(screen.getAllByText(/Titre/i).length).toBe(3);
    expect(
      screen.getByRole("button", { name: /suivant/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(screen.getByText("Titre 4")).toBeInTheDocument();
  });

  it("respecte l'ordre mobile (customer, titre, description, image, résultats)", () => {
    renderWithQC(<RealisationsClient initialCases={[cases[0]]} />);

    const customer = screen.getByText("Client 1");
    const title = screen.getByText("Titre 1");
    const description = screen.getByText("Desc 1");
    const image = screen.getByAltText("Titre 1");
    const result = screen.getByText("Résultat 1");

    expect(
      customer.compareDocumentPosition(title) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      title.compareDocumentPosition(description) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      description.compareDocumentPosition(image) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      image.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

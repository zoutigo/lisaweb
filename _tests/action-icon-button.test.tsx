import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionIconButton } from "@/components/ui/action-icon-button";

describe("ActionIconButton", () => {
  it("affiche l'icône et le label par défaut selon l'action", () => {
    render(<ActionIconButton action="view" />);

    const label = screen.getByTestId("view-tooltip");
    expect(label).toBeInTheDocument();
    expect(label.className).toContain("opacity-0");
    expect(screen.getByTestId("view-icon")).toBeInTheDocument();
  });

  it("déclenche le callback onClick", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<ActionIconButton action="edit" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /modifier/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it("empêche le clic lorsque disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<ActionIconButton action="delete" onClick={onClick} disabled />);

    await user.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

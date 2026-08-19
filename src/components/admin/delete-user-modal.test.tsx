import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DeleteUserModal } from "./delete-user-modal";

describe("DeleteUserModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeleteUserModal
        isOpen={false}
        targetUser={{ id: "u-1", username: "max" }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("does not render when targetUser is null", () => {
    const { container } = render(
      <DeleteUserModal
        isOpen={true}
        targetUser={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders username and warning text when open", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        targetUser={{ id: "u-1", username: "max.mustermann" }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Benutzer löschen")).toBeInTheDocument();
    expect(screen.getByText("max.mustermann")).toBeInTheDocument();
    expect(
      screen.getByText(/Alle zugehörigen Daten, Konten und Buchungen werden rückstandslos bereinigt/i)
    ).toBeInTheDocument();
  });

  it("triggers onClose on cancel button click", () => {
    const handleClose = vi.fn();
    render(
      <DeleteUserModal
        isOpen={true}
        targetUser={{ id: "u-1", username: "max" }}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /abbrechen/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onConfirm on confirm delete button click", () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteUserModal
        isOpen={true}
        targetUser={{ id: "u-1", username: "max" }}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /endgültig löschen/i })
    );
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables buttons and shows loading text during deletion", () => {
    render(
      <DeleteUserModal
        isOpen={true}
        targetUser={{ id: "u-1", username: "max" }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /abbrechen/i });
    const deleteBtn = screen.getByRole("button", { name: /wird gelöscht/i });

    expect(cancelBtn).toBeDisabled();
    expect(deleteBtn).toBeDisabled();
  });
});

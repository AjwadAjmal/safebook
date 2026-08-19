import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminUserForm } from "./admin-user-form";
import { createManagedUserAction } from "@/lib/actions/admin";

vi.mock("@/lib/actions/admin", () => ({
  createManagedUserAction: vi.fn(),
}));

describe("AdminUserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form inputs and submit button", () => {
    render(<AdminUserForm showToast={vi.fn()} />);

    expect(screen.getByLabelText("Benutzername")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Benutzer anlegen" })
    ).toBeInTheDocument();
  });

  it("shows client validation errors when inputs are empty or too short", async () => {
    const showToast = vi.fn();
    render(<AdminUserForm showToast={showToast} />);

    fireEvent.click(screen.getByRole("button", { name: "Benutzer anlegen" }));

    expect(
      screen.getByText("Benutzername muss mindestens 3 Zeichen lang sein.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Passwort muss mindestens 6 Zeichen lang sein.")
    ).toBeInTheDocument();
    expect(createManagedUserAction).not.toHaveBeenCalled();
  });

  it("shows error toast when server action fails", async () => {
    const showToast = vi.fn();
    vi.mocked(createManagedUserAction).mockResolvedValue({
      success: false,
      error: "Benutzername ist bereits vergeben.",
    });

    render(<AdminUserForm showToast={showToast} />);

    fireEvent.change(screen.getByLabelText("Benutzername"), {
      target: { value: "duplicateUser" },
    });
    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Benutzer anlegen" }));

    await waitFor(() => {
      expect(createManagedUserAction).toHaveBeenCalledWith({
        username: "duplicateUser",
        password: "secret123",
      });
      expect(showToast).toHaveBeenCalledWith(
        "Benutzername ist bereits vergeben.",
        "error"
      );
    });
  });

  it("shows success toast, clears fields, and calls onUserCreated callback on success", async () => {
    const showToast = vi.fn();
    const onUserCreated = vi.fn();
    vi.mocked(createManagedUserAction).mockResolvedValue({
      success: true,
      user: {
        id: "u-99",
        username: "newuser",
        role: "member",
      },
    });

    render(
      <AdminUserForm
        showToast={showToast}
        onUserCreated={onUserCreated}
      />
    );

    const usernameInput = screen.getByLabelText("Benutzername") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Passwort") as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    fireEvent.click(screen.getByRole("button", { name: "Benutzer anlegen" }));

    await waitFor(() => {
      expect(createManagedUserAction).toHaveBeenCalledWith({
        username: "newuser",
        password: "secret123",
      });
      expect(showToast).toHaveBeenCalledWith(
        "Benutzer erfolgreich erstellt.",
        "success"
      );
      expect(onUserCreated).toHaveBeenCalledTimes(1);
      expect(usernameInput.value).toBe("");
      expect(passwordInput.value).toBe("");
    });
  });
});

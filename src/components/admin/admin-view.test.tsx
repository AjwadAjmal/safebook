import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminView } from "./admin-view";
import { deleteUserAction } from "@/lib/actions/admin";
import { type AdminUserListItem } from "@/lib/admin-db";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/actions/admin", () => ({
  deleteUserAction: vi.fn(),
}));

describe("AdminView Integration", () => {
  const mockUsers: AdminUserListItem[] = [
    {
      id: "super-1",
      username: "dev",
      role: "superadmin",
      householdId: "hh-1",
      householdName: "Admin Home",
      accountsCount: 2,
      createdAt: new Date("2026-08-01"),
    },
    {
      id: "user-2",
      username: "bob",
      role: "member",
      householdId: null,
      householdName: null,
      accountsCount: 0,
      createdAt: new Date("2026-08-10"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user form and user list", () => {
    render(<AdminView users={mockUsers} currentUserId="super-1" />);

    expect(screen.getByText("Neuen Benutzer anlegen")).toBeInTheDocument();
    expect(screen.getByText("Registrierte Benutzer")).toBeInTheDocument();
    expect(screen.getByText("dev")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
  });

  it("opens modal and allows cancelling deletion without calling deleteUserAction", () => {
    render(<AdminView users={mockUsers} currentUserId="super-1" />);

    const bobCard = screen.getByTestId("user-card-user-2");
    const deleteBtn = bobCard.querySelector("button")!;
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId("delete-user-modal")).toBeInTheDocument();
    expect(screen.getByText(/Möchtest du den Benutzer/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /abbrechen/i }));

    expect(screen.queryByTestId("delete-user-modal")).not.toBeInTheDocument();
    expect(deleteUserAction).not.toHaveBeenCalled();
  });

  it("executes deleteUserAction and shows success toast on modal confirm", async () => {
    vi.mocked(deleteUserAction).mockResolvedValue({ success: true });

    render(<AdminView users={mockUsers} currentUserId="super-1" />);

    const bobCard = screen.getByTestId("user-card-user-2");
    const deleteBtn = bobCard.querySelector("button")!;
    fireEvent.click(deleteBtn);

    fireEvent.click(screen.getByRole("button", { name: /endgültig löschen/i }));

    await waitFor(() => {
      expect(deleteUserAction).toHaveBeenCalledWith("user-2");
      expect(screen.getByText("Benutzer erfolgreich gelöscht.")).toBeInTheDocument();
      expect(mockRefresh).toHaveBeenCalled();
      expect(screen.queryByTestId("delete-user-modal")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when deleteUserAction returns error", async () => {
    vi.mocked(deleteUserAction).mockResolvedValue({
      success: false,
      error: "Selbstlöschung ist nicht erlaubt.",
    });

    render(<AdminView users={mockUsers} currentUserId="super-1" />);

    const bobCard = screen.getByTestId("user-card-user-2");
    const deleteBtn = bobCard.querySelector("button")!;
    fireEvent.click(deleteBtn);

    fireEvent.click(screen.getByRole("button", { name: /endgültig löschen/i }));

    await waitFor(() => {
      expect(deleteUserAction).toHaveBeenCalledWith("user-2");
      expect(
        screen.getByText("Selbstlöschung ist nicht erlaubt.")
      ).toBeInTheDocument();
    });
  });
});

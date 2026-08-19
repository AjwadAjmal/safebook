import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminUserList } from "./admin-user-list";
import { type AdminUserListItem } from "@/lib/admin-db";

describe("AdminUserList", () => {
  const mockUsers: AdminUserListItem[] = [
    {
      id: "super-1",
      username: "dev",
      role: "superadmin",
      householdId: "hh-1",
      householdName: "Admin Home",
      accountsCount: 3,
      createdAt: new Date("2026-08-01"),
    },
    {
      id: "user-2",
      username: "alice",
      role: "admin",
      householdId: "hh-2",
      householdName: "Alice Home",
      accountsCount: 1,
      createdAt: new Date("2026-08-05"),
    },
    {
      id: "user-3",
      username: "bob",
      role: "member",
      householdId: null,
      householdName: null,
      accountsCount: 0,
      createdAt: new Date("2026-08-10"),
    },
  ];

  it("renders empty state message when no users are provided", () => {
    render(
      <AdminUserList
        users={[]}
        currentUserId="super-1"
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Keine Benutzer registriert.")).toBeInTheDocument();
  });

  it("renders all users with correct role badges, household names, and accounts count", () => {
    render(
      <AdminUserList
        users={mockUsers}
        currentUserId="super-1"
        onRequestDelete={vi.fn()}
      />
    );

    expect(screen.getByText("dev")).toBeInTheDocument();
    expect(screen.getByText("Superadmin")).toBeInTheDocument();
    expect(screen.getByText("Admin Home")).toBeInTheDocument();
    expect(screen.getByText("3 Konten")).toBeInTheDocument();

    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Alice Home")).toBeInTheDocument();
    expect(screen.getByText("1 Konto")).toBeInTheDocument();

    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("Mitglied")).toBeInTheDocument();
    expect(screen.getByText("Kein Haushalt")).toBeInTheDocument();
    expect(screen.getByText("0 Konten")).toBeInTheDocument();
  });

  it("disables delete button for the current logged-in Superadmin (self-deletion guard)", () => {
    render(
      <AdminUserList
        users={mockUsers}
        currentUserId="super-1"
        onRequestDelete={vi.fn()}
      />
    );

    const devCard = screen.getByTestId("user-card-super-1");
    const devDeleteBtn = devCard.querySelector("button");
    expect(devDeleteBtn).toBeDisabled();
    expect(devDeleteBtn).toHaveAttribute(
      "title",
      "Eigenes Superadmin-Konto kann nicht gelöscht werden"
    );
  });

  it("triggers onRequestDelete with target user when delete button is clicked on other users", () => {
    const onRequestDelete = vi.fn();
    render(
      <AdminUserList
        users={mockUsers}
        currentUserId="super-1"
        onRequestDelete={onRequestDelete}
      />
    );

    const aliceCard = screen.getByTestId("user-card-user-2");
    const aliceDeleteBtn = aliceCard.querySelector("button")!;
    expect(aliceDeleteBtn).not.toBeDisabled();

    fireEvent.click(aliceDeleteBtn);

    expect(onRequestDelete).toHaveBeenCalledTimes(1);
    expect(onRequestDelete).toHaveBeenCalledWith(mockUsers[1]);
  });
});

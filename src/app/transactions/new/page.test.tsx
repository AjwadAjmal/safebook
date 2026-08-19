import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewTransactionPage from "./page";
import { auth } from "@/auth";
import { getHouseholdById } from "@/lib/household-utils";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import { getCategoriesForHousehold, seedStandardCategories } from "@/lib/category-db";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/household-utils", () => ({
  getHouseholdById: vi.fn(),
}));

vi.mock("@/lib/account-db", () => ({
  getAccountsByHouseholdId: vi.fn(),
}));

vi.mock("@/lib/category-db", () => ({
  getCategoriesForHousehold: vi.fn(),
  seedStandardCategories: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
  usePathname: vi.fn(() => "/transactions/new"),
}));

describe("NewTransactionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login if user is not authenticated or has no householdId", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(NewTransactionPage()).rejects.toThrow("NEXT_REDIRECT: /login");
  });

  it("redirects to /login if household cannot be found", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u-1", householdId: "hh-1", role: "member" },
      expires: "2026-08-09",
    });
    vi.mocked(getHouseholdById).mockResolvedValue(null);

    await expect(NewTransactionPage()).rejects.toThrow("NEXT_REDIRECT: /login");
  });

  it("redirects to /createprofile if household has no accounts", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u-1", householdId: "hh-1", role: "member" },
      expires: "2026-08-09",
    });
    vi.mocked(getHouseholdById).mockResolvedValue({
      id: "hh-1",
      name: "Haushalt Schmidt",
      inviteCode: "INV123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getAccountsByHouseholdId).mockResolvedValue([]);
    vi.mocked(getCategoriesForHousehold).mockResolvedValue([]);

    await expect(NewTransactionPage()).rejects.toThrow("NEXT_REDIRECT: /createprofile");
  });

  it("renders SidebarNavigation and transaction form when user is authenticated with accounts and categories", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u-1", householdId: "hh-1", role: "member" },
      expires: "2026-08-09",
    });

    vi.mocked(getHouseholdById).mockResolvedValue({
      id: "hh-1",
      name: "Haushalt Schmidt",
      inviteCode: "INV123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(getAccountsByHouseholdId).mockResolvedValue([
      {
        id: "acc-1",
        userId: "u-1",
        householdId: "hh-1",
        type: "giro" as const,
        name: "Girokonto Main",
        institution: "Sparkasse",
        currentValue: "1250.00",
        investedCapital: null,
        initialDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    vi.mocked(getCategoriesForHousehold).mockResolvedValue([
      {
        id: "cat-1",
        name: "Lebensmittel",
        icon: "shopping-cart",
        isSystem: true,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const jsx = await NewTransactionPage();
    render(jsx);

    // Verify SidebarNavigation integration
    expect(screen.getAllByText("Haushalt Schmidt").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Menü öffnen" })).toBeInTheDocument();
    expect(screen.getAllByText("Neue Transaktion").length).toBeGreaterThan(0);

    // Verify TransactionForm contents
    expect(screen.getByText(/Girokonto Main/i)).toBeInTheDocument();
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(seedStandardCategories).toHaveBeenCalled();
  });
});

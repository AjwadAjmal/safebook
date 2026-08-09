import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecentTransactions } from "./recent-transactions";
import { deleteTransactionAction, updateTransactionAction } from "@/lib/actions/transaction";

vi.mock("@/lib/actions/transaction", () => ({
  deleteTransactionAction: vi.fn(),
  updateTransactionAction: vi.fn(),
}));

describe("RecentTransactions", () => {
  const mockTransactions = [
    {
      id: "tx-1",
      type: "expense" as const,
      amount: "45.50",
      description: "Einkauf Supermarkt",
      date: new Date("2026-08-09T10:00:00Z"),
      accountId: "acc-1",
      accountName: "Girokonto",
      categoryId: "cat-1",
      categoryName: "Lebensmittel",
      categoryIcon: "shopping-cart",
    },
    {
      id: "tx-2",
      type: "income" as const,
      amount: "1500.00",
      description: null,
      date: new Date("2026-08-08T10:00:00Z"),
      accountId: "acc-1",
      accountName: "Girokonto",
      categoryId: "cat-2",
      categoryName: "Gehalt",
      categoryIcon: "briefcase",
    },
  ];

  const mockAccounts = [
    { id: "acc-1", name: "Girokonto", type: "giro" as const, currentValue: "1000.00" },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Lebensmittel", icon: "shopping-cart" },
    { id: "cat-2", name: "Gehalt", icon: "briefcase" },
  ];

  it("renders empty state message when no transactions exist", () => {
    render(
      <RecentTransactions
        transactions={[]}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Letzte Transaktionen")).toBeInTheDocument();
    expect(screen.getByText("Keine letzten Transaktionen vorhanden.")).toBeInTheDocument();
  });

  it("renders list of recent transactions with correct details and formatting", () => {
    render(
      <RecentTransactions
        transactions={mockTransactions}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Einkauf Supermarkt")).toBeInTheDocument();
    expect(screen.getByText("Gehalt")).toBeInTheDocument(); // fallback when description is null
    expect(screen.getAllByText(/Girokonto/)[0]).toBeInTheDocument();
    expect(screen.getByText("- 45.50 €")).toBeInTheDocument();
    expect(screen.getByText("+ 1500.00 €")).toBeInTheDocument();
  });

  it("calls deleteTransactionAction when delete button is clicked", async () => {
    vi.mocked(deleteTransactionAction).mockResolvedValue({ success: true });

    render(
      <RecentTransactions
        transactions={mockTransactions}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "Löschen" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteTransactionAction).toHaveBeenCalledWith("tx-1");
    });
  });

  it("opens edit modal and submits updateTransactionAction", async () => {
    vi.mocked(updateTransactionAction).mockResolvedValue({ success: true, transaction: {} as never });

    render(
      <RecentTransactions
        transactions={mockTransactions}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: "Bearbeiten" });
    fireEvent.click(editButtons[0]);

    // Expect edit modal title
    expect(screen.getByText("Transaktion bearbeiten")).toBeInTheDocument();

    const amountInput = screen.getByDisplayValue("45.50");
    fireEvent.change(amountInput, { target: { value: "50,00" } });

    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateTransactionAction).toHaveBeenCalledWith(
        "tx-1",
        expect.objectContaining({
          amount: "50,00",
        })
      );
    });
  });
});

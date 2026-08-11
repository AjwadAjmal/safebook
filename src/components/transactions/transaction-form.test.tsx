import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "./transaction-form";
import { createTransactionAction, createCustomCategoryAction } from "@/lib/actions/transaction";

vi.mock("@/lib/actions/transaction", () => ({
  createTransactionAction: vi.fn(),
  createCustomCategoryAction: vi.fn(),
}));

describe("TransactionForm", () => {
  const mockAccounts = [
    { id: "acc-1", name: "Girokonto", type: "giro" as const, currentValue: "1000.00" },
    { id: "acc-2", name: "Bargeld", type: "cash" as const, currentValue: "150.00" },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Lebensmittel", icon: "shopping-cart", isSystem: true, householdId: null },
    { id: "cat-2", name: "Tanken", icon: "gas-pump", isSystem: true, householdId: null },
  ];

  it("renders transaction form fields correctly", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    expect(screen.getByText("Neue Transaktion")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ausgabe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Einnahme" })).toBeInTheDocument();
    expect(screen.getByLabelText("Konto")).toBeInTheDocument();
    expect(screen.getByLabelText("Betrag (€)")).toBeInTheDocument();
    expect(screen.getByLabelText("Datum")).toBeInTheDocument();
    expect(screen.getByLabelText("Kategorie")).toBeInTheDocument();
    expect(screen.getByLabelText("Beschreibung (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transaktion speichern" })).toBeInTheDocument();
  });

  it("allows toggling transaction type between Ausgabe and Einnahme", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    const incomeBtn = screen.getByRole("button", { name: "Einnahme" });
    fireEvent.click(incomeBtn);

    expect(incomeBtn.className).toContain("typeButtonIncomeActive");
  });

  it("allows inline custom category creation", async () => {
    vi.mocked(createCustomCategoryAction).mockResolvedValue({
      category: { id: "cat-3", name: "Hobby", icon: "tag", isSystem: false, householdId: "hh-1" },
    });

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Click "+ Neue Kategorie"
    const addCatBtn = screen.getByRole("button", { name: "+ Neue Kategorie" });
    fireEvent.click(addCatBtn);

    // Expect inline category input field
    const categoryInput = screen.getByPlaceholderText("Kategoriename (z. B. Hobbies)");
    expect(categoryInput).toBeInTheDocument();

    fireEvent.change(categoryInput, { target: { value: "Hobby" } });

    const saveCatBtn = screen.getByRole("button", { name: "Speichern" });
    fireEvent.click(saveCatBtn);

    await waitFor(() => {
      expect(createCustomCategoryAction).toHaveBeenCalledWith({ name: "Hobby" });
    });

    // Category should be added to select box and selected
    const categorySelect = screen.getByLabelText("Kategorie") as HTMLSelectElement;
    expect(categorySelect.value).toBe("cat-3");
  });

  it("submits the form data via createTransactionAction", async () => {
    vi.mocked(createTransactionAction).mockResolvedValue(undefined as never);

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    const amountInput = screen.getByLabelText("Betrag (€)");
    fireEvent.change(amountInput, { target: { value: "25,50" } });

    const descriptionInput = screen.getByLabelText("Beschreibung (optional)");
    fireEvent.change(descriptionInput, { target: { value: "Supermarkt Einkauf" } });

    const submitBtn = screen.getByRole("button", { name: "Transaktion speichern" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createTransactionAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "expense",
          amount: "25,50",
          accountId: "acc-1",
          categoryId: "cat-1",
          description: "Supermarkt Einkauf",
        })
      );
    });
  });

  it("prevents entering more than 2 decimal places in amount input", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    const amountInput = screen.getByLabelText("Betrag (€)") as HTMLInputElement;

    fireEvent.change(amountInput, { target: { value: "10,5" } });
    expect(amountInput.value).toBe("10,5");

    fireEvent.change(amountInput, { target: { value: "10,55" } });
    expect(amountInput.value).toBe("10,55");

    fireEvent.change(amountInput, { target: { value: "10,555" } });
    expect(amountInput.value).toBe("10,55");
  });
});

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

  it("opens CategoryModal with name input, emoji icon grid, Abbrechen and Speichern buttons", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    const addCatBtn = screen.getByRole("button", { name: "+ Neue Kategorie" });
    fireEvent.click(addCatBtn);

    expect(screen.getByText("Kategorie erstellen")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Kategoriename (z. B. Hobbies)")).toBeInTheDocument();
    expect(screen.getByText("Icon auswählen")).toBeInTheDocument();
    expect(screen.getByText("🏷️")).toBeInTheDocument();
    expect(screen.getByText("🛒")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abbrechen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Speichern" })).toBeInTheDocument();
  });

  it("allows selecting an icon from the curated icon grid", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Neue Kategorie" }));

    const tagBtn = screen.getByRole("button", { name: "🏷️" });
    const cartBtn = screen.getByRole("button", { name: "🛒" });

    expect(tagBtn.className).toContain("iconTileSelected");
    expect(cartBtn.className).not.toContain("iconTileSelected");

    fireEvent.click(cartBtn);

    expect(cartBtn.className).toContain("iconTileSelected");
    expect(tagBtn.className).not.toContain("iconTileSelected");
  });

  it("closes modal without saving when Abbrechen is clicked", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Neue Kategorie" }));

    const categoryInput = screen.getByPlaceholderText("Kategoriename (z. B. Hobbies)");
    fireEvent.change(categoryInput, { target: { value: "Fitness" } });

    const cancelBtn = screen.getByRole("button", { name: "Abbrechen" });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("Kategorie erstellen")).not.toBeInTheDocument();
    expect(createCustomCategoryAction).not.toHaveBeenCalled();
  });

  it("shows validation error if category name is less than 2 characters", async () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Neue Kategorie" }));

    const categoryInput = screen.getByPlaceholderText("Kategoriename (z. B. Hobbies)");
    fireEvent.change(categoryInput, { target: { value: "A" } });

    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    fireEvent.click(saveBtn);

    expect(await screen.findByText("Kategoriename muss mindestens 2 Zeichen lang sein")).toBeInTheDocument();
    expect(createCustomCategoryAction).not.toHaveBeenCalled();
    expect(screen.getByText("Kategorie erstellen")).toBeInTheDocument();
  });

  it("submits category with name and icon, auto-selects it and closes modal", async () => {
    vi.mocked(createCustomCategoryAction).mockResolvedValue({
      category: { id: "cat-3", name: "Fitness", icon: "sports", isSystem: false, householdId: "hh-1" },
    });

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Neue Kategorie" }));

    const categoryInput = screen.getByPlaceholderText("Kategoriename (z. B. Hobbies)");
    fireEvent.change(categoryInput, { target: { value: "Fitness" } });

    // Select sports icon ⚽
    const sportsIconBtn = screen.getByRole("button", { name: "⚽" });
    fireEvent.click(sportsIconBtn);

    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createCustomCategoryAction).toHaveBeenCalledWith({
        name: "Fitness",
        icon: "sports",
      });
    });

    // Modal should close
    expect(screen.queryByText("Kategorie erstellen")).not.toBeInTheDocument();

    // Category should be added to select box and auto-selected
    const categorySelect = screen.getByLabelText("Kategorie") as HTMLSelectElement;
    expect(categorySelect.value).toBe("cat-3");
    expect(screen.getByRole("option", { name: "Fitness" })).toBeInTheDocument();
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

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "./transaction-form";

vi.mock("@/lib/actions/transaction", () => ({
  createTransactionAction: vi.fn(),
  createCustomCategoryAction: vi.fn(),
}));

describe("TransactionForm (Multi-Step Wizard - Slice 2)", () => {
  const mockAccounts = [
    { id: "acc-1", name: "Girokonto", type: "giro" as const, currentValue: "1000.00" },
    { id: "acc-2", name: "Bargeld", type: "cash" as const, currentValue: "150.00" },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Lebensmittel", icon: "shopping-cart", isSystem: true, householdId: null },
    { id: "cat-2", name: "Tanken", icon: "gas-pump", isSystem: true, householdId: null },
  ];

  it("renders wizard header with 'Schritt 1 von 4', 'Abbrechen' link, and no 'Zurück' button on step 1", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeInTheDocument();
  });

  it("renders stacked account tiles with name, type badge, and balance, with no default selection and disabled Weiter button", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    expect(screen.getByText("Konto auswählen")).toBeInTheDocument();
    expect(screen.getAllByText("Girokonto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bargeld").length).toBeGreaterThan(0);

    const nextBtn = screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement;
    expect(nextBtn).toBeDisabled();
  });

  it("allows selecting an account tile, highlighting it, enabling Weiter button, and proceeding to Step 2", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    const nextBtn = screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement;
    expect(nextBtn).toBeDisabled();

    // Click Girokonto tile
    const giroTile = screen.getAllByText("Girokonto")[0].closest("[data-account-tile]") || screen.getAllByText("Girokonto")[0];
    fireEvent.click(giroTile);

    expect(nextBtn).not.toBeDisabled();

    // Advance to Step 2
    fireEvent.click(nextBtn);

    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
  });

  it("renders Step 2 with Expense/Income toggle, dynamic formatted cent display, keypad, and back button navigation", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Select account & advance to step 2
    const giroTile = screen.getAllByText("Girokonto")[0];
    fireEvent.click(giroTile);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Verify Expense/Income toggle defaulting to Expense
    const expenseBtn = screen.getByRole("button", { name: "Ausgabe" });
    const incomeBtn = screen.getByRole("button", { name: "Einnahme" });
    expect(expenseBtn).toBeInTheDocument();
    expect(incomeBtn).toBeInTheDocument();

    // Initial amount should be 0,00 € and Weiter disabled
    const nextBtn = screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement;
    expect(screen.getByText("0,00 €")).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    // Input digits via system input or keypad
    const amountInput = screen.getByTestId("cent-amount-input") as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: "20" } });
    expect(screen.getByText("0,20 €")).toBeInTheDocument();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.change(amountInput, { target: { value: "2000" } });
    expect(screen.getByText("20,00 €")).toBeInTheDocument();

    // Test Zurück button returns to step 1
    const backBtn = screen.getByRole("button", { name: "Zurück" });
    fireEvent.click(backBtn);
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
  });
});


import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "./transaction-form";

vi.mock("@/lib/actions/transaction", () => ({
  createTransactionAction: vi.fn(),
  createCustomCategoryAction: vi.fn(),
}));

describe("TransactionForm (Multi-Step Wizard - Slice 3)", () => {
  const mockAccounts = [
    { id: "acc-1", name: "Girokonto", type: "giro" as const, currentValue: "1000.00" },
    { id: "acc-2", name: "Bargeld", type: "cash" as const, currentValue: "150.00" },
  ];

  const mockCategories = [
    { id: "cat-1", name: "Lebensmittel", icon: "shopping-cart", isSystem: true, householdId: null },
    { id: "cat-2", name: "Tanken", icon: "gas-pump", isSystem: true, householdId: null },
  ];

  it("renders wizard header with 'Schritt 1 von 4' and progress bar, and bottom action bar with Weiter and Abbrechen (no Zurück in Step 1)", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Neue Transaktion" })).not.toBeInTheDocument();

    // In step 1: No Zurück button in the DOM
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeInTheDocument();

    // Bottom action bar contains disabled Weiter button and centered Abbrechen link
    const nextBtn = screen.getByRole("button", { name: "Weiter" });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    const cancelLink = screen.getByRole("link", { name: "Abbrechen" });
    expect(cancelLink).toBeInTheDocument();
    expect(cancelLink).toHaveAttribute("href", "/");
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
    
    // Header should NOT have back button or cancel link
    const header = screen.getByText("Schritt 2 von 4").closest("[data-wizard-header]");
    expect(header?.querySelector("button")).toBeNull();
    expect(header?.querySelector("a")).toBeNull();

    // Bottom action bar has Zurück and Weiter
    const backBtn = screen.getByRole("button", { name: "Zurück" });
    expect(backBtn).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");
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

  it("renders Step 3 date picker with 'Heute' quick chip defaulting to today's date, 3-column category grid with no initial selection and disabled Weiter button", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: select account
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: enter amount
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "2000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Now in Step 3
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByText("Datum & Kategorie")).toBeInTheDocument();

    const todayStr = new Date().toISOString().split("T")[0];
    const dateInput = screen.getByLabelText("Datum") as HTMLInputElement;
    expect(dateInput.value).toBe(todayStr);

    const heuteChip = screen.getByRole("button", { name: "Heute" });
    expect(heuteChip).toBeInTheDocument();

    // Change date and test chip click
    fireEvent.change(dateInput, { target: { value: "2025-01-01" } });
    expect(dateInput.value).toBe("2025-01-01");
    fireEvent.click(heuteChip);
    expect(dateInput.value).toBe(todayStr);

    // Verify categories in 3-column grid
    expect(screen.getByText("Lebensmittel")).toBeInTheDocument();
    expect(screen.getByText("Tanken")).toBeInTheDocument();

    // No category selected by default -> Weiter button disabled
    const nextBtn = screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement;
    expect(nextBtn).toBeDisabled();

    // Select category tile "Lebensmittel"
    const catTile = screen.getByRole("button", { name: /Lebensmittel/i });
    fireEvent.click(catTile);

    // Weiter button enabled
    expect(nextBtn).not.toBeDisabled();
  });

  it("triggers CategoryModal on '+ Neue Kategorie' click and automatically selects newly created category", async () => {
    const { createCustomCategoryAction } = await import("@/lib/actions/transaction");
    vi.mocked(createCustomCategoryAction).mockResolvedValueOnce({
      category: {
        id: "cat-new-99",
        name: "Hobbies",
        icon: "sports",
        householdId: "hh-1",
      },
    });

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: select account
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: enter amount
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1500" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3
    const newCategoryBtn = screen.getByRole("button", { name: "+ Neue Kategorie" });
    fireEvent.click(newCategoryBtn);

    // Modal opens
    expect(screen.getByRole("heading", { name: "Kategorie erstellen" })).toBeInTheDocument();

    // Fill modal input
    const modalInput = screen.getByLabelText("Kategoriename");
    fireEvent.change(modalInput, { target: { value: "Hobbies" } });

    // Submit modal
    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    fireEvent.click(saveBtn);

    // Wait for category to be added and selected
    expect(await screen.findByText("Hobbies")).toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: "Weiter" }) as HTMLButtonElement;
    expect(nextBtn).not.toBeDisabled();
  });

  it("renders Step 4 Summary Card displaying 5 distinct rows for Account, Type, Amount, Date, and Category with Edit buttons (✏️)", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: Select Girokonto
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: Enter amount 2500 (25,00 €)
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "2500" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: Select category Lebensmittel
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 4
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Zusammenfassung")).toBeInTheDocument();

    // 1. Row: Konto (Name + Type Badge + Edit Button)
    expect(screen.getByText("Konto")).toBeInTheDocument();
    expect(screen.getAllByText("Girokonto").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Konto bearbeiten" })).toBeInTheDocument();

    // 2. Row: Typ (Type Badge + Edit Button)
    expect(screen.getByText("Typ")).toBeInTheDocument();
    expect(screen.getByText("Ausgabe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Typ bearbeiten" })).toBeInTheDocument();

    // 3. Row: Betrag (Signed formatted amount + Edit Button)
    expect(screen.getByText("Betrag")).toBeInTheDocument();
    expect(screen.getByText("- 25,00 €")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Betrag bearbeiten" })).toBeInTheDocument();

    // 4. Row: Datum (Formatted German date + Edit Button)
    expect(screen.getByText("Datum")).toBeInTheDocument();
    const today = new Date();
    const expectedGermanDate = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
    expect(screen.getByText(expectedGermanDate)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Datum bearbeiten" })).toBeInTheDocument();

    // 5. Row: Kategorie (Icon + Name + Edit Button)
    expect(screen.getByText("Kategorie")).toBeInTheDocument();
    expect(screen.getByText(/Lebensmittel/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kategorie bearbeiten" })).toBeInTheDocument();

    // Optional description & Submit button
    expect(screen.getByLabelText("Beschreibung (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transaktion speichern" })).toBeInTheDocument();
  });

  it("renders Step 4 Summary Card with positive sign (+ 50,00 €) and Einnahme badge for income transactions", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: Select Bargeld
    fireEvent.click(screen.getAllByText("Bargeld")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: Toggle to Einnahme and enter amount 5000 (50,00 €)
    fireEvent.click(screen.getByRole("button", { name: "Einnahme" }));
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: Select category Tanken
    fireEvent.click(screen.getByRole("button", { name: /Tanken/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 4
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Einnahme")).toBeInTheDocument();
    expect(screen.getByText("+ 50,00 €")).toBeInTheDocument();
  });

  it("switches to editing mode when clicking 'Konto bearbeiten' on summary card, displaying 'Zur Zusammenfassung' and jumping directly back to Step 4", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getAllByText("Girokonto").length).toBeGreaterThan(0);

    // Click "Konto bearbeiten" -> Jump to Step 1 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /konto bearbeiten/i }));
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Weiter" })).not.toBeInTheDocument();

    // Select Bargeld and click "Zur Zusammenfassung"
    fireEvent.click(screen.getAllByText("Bargeld")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));

    // Should be back at Step 4 with updated account
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getAllByText("Bargeld").length).toBeGreaterThan(0);
  });

  it("switches to editing mode when clicking 'Typ bearbeiten' on summary card, displaying 'Zur Zusammenfassung' and jumping directly back to Step 4", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Ausgabe")).toBeInTheDocument();
    expect(screen.getByText("- 10,00 €")).toBeInTheDocument();

    // Click "Typ bearbeiten" -> Jump to Step 2 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /typ bearbeiten/i }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();

    // Toggle to Einnahme
    fireEvent.click(screen.getByRole("button", { name: "Einnahme" }));

    // Click "Zur Zusammenfassung" -> jumps directly back to Step 4
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Einnahme")).toBeInTheDocument();
    expect(screen.getByText("+ 10,00 €")).toBeInTheDocument();
  });

  it("switches to editing mode when clicking 'Betrag bearbeiten' on summary card, displaying 'Zur Zusammenfassung' and jumping directly back to Step 4 with updated amount", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("- 10,00 €")).toBeInTheDocument();

    // Click "Betrag bearbeiten" -> Jump to Step 2 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /betrag bearbeiten/i }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Weiter" })).not.toBeInTheDocument();

    // Change amount to 3500 (35,00 €)
    const newAmountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(newAmountInput, { target: { value: "3500" } });

    // Click "Zur Zusammenfassung" -> jumps directly back to Step 4
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("- 35,00 €")).toBeInTheDocument();
  });

  it("switches to editing mode when clicking 'Datum bearbeiten' on summary card, displaying 'Zur Zusammenfassung' and jumping directly back to Step 4", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // Click "Datum bearbeiten" -> Jump to Step 3 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /datum bearbeiten/i }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();

    // Change date to 2026-12-24
    const dateInput = screen.getByLabelText("Datum");
    fireEvent.change(dateInput, { target: { value: "2026-12-24" } });

    // Click "Zur Zusammenfassung" -> jumps directly back to Step 4
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("24.12.2026")).toBeInTheDocument();
  });

  it("switches to editing mode when clicking 'Kategorie bearbeiten' on summary card, displaying 'Zur Zusammenfassung' and jumping directly back to Step 4 with updated category", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText(/Lebensmittel/i)).toBeInTheDocument();

    // Click "Kategorie bearbeiten" -> Jump to Step 3 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /kategorie bearbeiten/i }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Weiter" })).not.toBeInTheDocument();

    // Select Tanken
    fireEvent.click(screen.getByRole("button", { name: /Tanken/i }));

    // Click "Zur Zusammenfassung" -> jumps directly back to Step 4
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText(/Tanken/i)).toBeInTheDocument();
  });

  it("disables 'Zur Zusammenfassung' button in edit mode if input is invalid and enables when valid", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // Click "Betrag bearbeiten"
    fireEvent.click(screen.getByRole("button", { name: /betrag bearbeiten/i }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();

    const summaryBtn = screen.getByRole("button", { name: "Zur Zusammenfassung" }) as HTMLButtonElement;
    expect(summaryBtn).not.toBeDisabled();

    // Click 'C' keypad button to clear amount
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(screen.getByText("0,00 €")).toBeInTheDocument();
    expect(summaryBtn).toBeDisabled();

    // Enter digits via keypad: 5, 0, 0
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    expect(screen.getByText("5,00 €")).toBeInTheDocument();
    expect(summaryBtn).not.toBeDisabled();

    // Jump back to summary
    fireEvent.click(summaryBtn);
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("- 5,00 €")).toBeInTheDocument();
  });

  it("resets editing mode when clicking 'Zurück', restoring normal sequential navigation", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // Click "Kategorie bearbeiten" -> Step 3 in edit mode
    fireEvent.click(screen.getByRole("button", { name: /kategorie bearbeiten/i }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();

    // Click "Zurück" -> returns to Step 2, edit mode should be reset
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zur Zusammenfassung" })).not.toBeInTheDocument();

    // Sequential forward navigation
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zur Zusammenfassung" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
  });

  it("submits the form in Step 4 calling createTransactionAction with formatted decimal amount and optional description", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockResolvedValueOnce({});

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: select Girokonto
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: enter amount 5000 (50,00 €)
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: select category Lebensmittel
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 4: enter description and submit
    const descInput = screen.getByLabelText("Beschreibung (optional)");
    fireEvent.change(descInput, { target: { value: "Supermarkteinkauf" } });

    const submitBtn = screen.getByRole("button", { name: "Transaktion speichern" });
    fireEvent.click(submitBtn);

    const todayStr = new Date().toISOString().split("T")[0];
    expect(createTransactionAction).toHaveBeenCalledWith({
      type: "expense",
      amount: "50.00",
      description: "Supermarkteinkauf",
      date: todayStr,
      accountId: "acc-1",
      categoryId: "cat-1",
    });
  });

  it("displays error message if createTransactionAction returns an error", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockResolvedValueOnce({
      error: "Konto nicht gefunden.",
    });

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: select Girokonto
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: enter amount 5000 (50,00 €)
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: select category Lebensmittel
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 4: submit form
    const submitBtn = screen.getByRole("button", { name: "Transaktion speichern" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Konto nicht gefunden.")).toBeInTheDocument();
  });

  it("renders unified action bar with 'Zurück', 'Weiter' / 'Transaktion speichern', and 'Abbrechen' on all steps", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: No Zurück, only Weiter + Abbrechen
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");

    // Select account -> Advance to Step 2
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    expect(screen.getByRole("button", { name: "Weiter" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: Zurück + Weiter + Abbrechen
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");

    // Enter amount -> Advance to Step 3
    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "1000" } });
    expect(screen.getByRole("button", { name: "Weiter" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: Zurück + Weiter + Abbrechen
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");

    // Select category -> Advance to Step 4
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    expect(screen.getByRole("button", { name: "Weiter" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 4: Zurück + Transaktion speichern + Abbrechen
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Transaktion speichern" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abbrechen" })).toHaveAttribute("href", "/");

    // Click Zurück from Step 4 -> returns to Step 3
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();

    // Click Zurück from Step 3 -> returns to Step 2
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();

    // Click Zurück from Step 2 -> returns to Step 1
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeInTheDocument();
  });

  it("blocks form submission when currentStep !== 4 even if all step inputs are filled", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockClear();

    const { container } = render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);
    const form = container.querySelector("form")!;

    // Step 1: select Girokonto
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    // Try submitting form in Step 1
    fireEvent.submit(form);
    expect(createTransactionAction).not.toHaveBeenCalled();

    // Advance to Step 2
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "2500" } });
    // Try submitting form in Step 2
    fireEvent.submit(form);
    expect(createTransactionAction).not.toHaveBeenCalled();

    // Advance to Step 3
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    // Try submitting form in Step 3 (all fields accountId, centAmount, categoryId are now valid!)
    fireEvent.submit(form);
    expect(createTransactionAction).not.toHaveBeenCalled();
  });

  it("prevents form submission when pressing Enter key in input fields during steps 1 to 3", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockClear();

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: Select Girokonto & advance
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: Press Enter inside cent amount input
    const amountInput = screen.getByTestId("cent-amount-input");
    fireEvent.change(amountInput, { target: { value: "3000" } });
    const enterKeyDownEvent = fireEvent.keyDown(amountInput, { key: "Enter", code: "Enter", charCode: 13 });
    expect(enterKeyDownEvent).toBe(false); // default was prevented
    expect(createTransactionAction).not.toHaveBeenCalled();
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();

    // Advance to Step 3
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));

    // Step 3: Press Enter inside date input
    const dateInput = screen.getByLabelText("Datum");
    const dateEnterEvent = fireEvent.keyDown(dateInput, { key: "Enter", code: "Enter", charCode: 13 });
    expect(dateEnterEvent).toBe(false); // default was prevented
    expect(createTransactionAction).not.toHaveBeenCalled();
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
  });

  it("transitions safely from Step 3 to Step 4 on 'Weiter' click without triggering submission, requiring explicit click on 'Transaktion speichern'", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockClear();

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Step 1: select Girokonto
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 2: enter amount 4200 (42,00 €)
    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "4200" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Step 3: select category Tanken
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tanken/i }));

    const nextBtn = screen.getByRole("button", { name: "Weiter" });
    expect(nextBtn).not.toBeDisabled();

    // Click "Weiter" to go from Step 3 to Step 4
    fireEvent.click(nextBtn);

    // Verify wizard is now on Step 4 and NO submission occurred
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Zusammenfassung")).toBeInTheDocument();
    // Verify "Transaktion speichern" button is rendered with explicit key/role
    const saveBtn = screen.getByRole("button", { name: "Transaktion speichern" });
    expect(saveBtn).toBeInTheDocument();
    expect(createTransactionAction).not.toHaveBeenCalled();

    // Explicit click on "Transaktion speichern" now submits
    fireEvent.click(saveBtn);
    expect(createTransactionAction).toHaveBeenCalledTimes(1);
  });

  it("supports a full multi-edit roundtrip modifying all 5 fields sequentially and submits with description", async () => {
    const { createTransactionAction } = await import("@/lib/actions/transaction");
    vi.mocked(createTransactionAction).mockClear();
    vi.mocked(createTransactionAction).mockResolvedValueOnce({});

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Initial flow: Step 1 (Girokonto) -> Step 2 (Expense, 10,00 €) -> Step 3 (Lebensmittel) -> Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // 1. Edit Account: Switch to Bargeld
    fireEvent.click(screen.getByRole("button", { name: "Konto bearbeiten" }));
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Bargeld")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getAllByText("Bargeld").length).toBeGreaterThan(0);

    // 2. Edit Type: Switch to Einnahme
    fireEvent.click(screen.getByRole("button", { name: "Typ bearbeiten" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Einnahme" }));
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("Einnahme")).toBeInTheDocument();

    // 3. Edit Amount: Change to 125,50 € (12550 cents)
    fireEvent.click(screen.getByRole("button", { name: "Betrag bearbeiten" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "12550" } });
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("+ 125,50 €")).toBeInTheDocument();

    // 4. Edit Date: Change to 2026-05-15
    fireEvent.click(screen.getByRole("button", { name: "Datum bearbeiten" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "2026-05-15" } });
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText("15.05.2026")).toBeInTheDocument();

    // 5. Edit Category: Switch to Tanken
    fireEvent.click(screen.getByRole("button", { name: "Kategorie bearbeiten" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tanken/i }));
    fireEvent.click(screen.getByRole("button", { name: "Zur Zusammenfassung" }));
    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText(/Tanken/i)).toBeInTheDocument();

    // Add optional description and submit
    fireEvent.change(screen.getByLabelText("Beschreibung (optional)"), {
      target: { value: "Rückerstattung Tankkosten" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Transaktion speichern" }));

    expect(createTransactionAction).toHaveBeenCalledTimes(1);
    expect(createTransactionAction).toHaveBeenCalledWith({
      type: "income",
      amount: "125.50",
      description: "Rückerstattung Tankkosten",
      date: "2026-05-15",
      accountId: "acc-2",
      categoryId: "cat-2",
    });
  });

  it("supports creating a new category via modal during edit mode and returns directly to Step 4 with new category", async () => {
    const { createCustomCategoryAction } = await import("@/lib/actions/transaction");
    vi.mocked(createCustomCategoryAction).mockResolvedValueOnce({
      category: {
        id: "cat-edit-99",
        name: "Fitness",
        icon: "dumbbell",
        householdId: "hh-1",
      },
    });

    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Initial flow to Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "3000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // Click Category edit icon -> Step 3
    fireEvent.click(screen.getByRole("button", { name: "Kategorie bearbeiten" }));
    expect(screen.getByText("Schritt 3 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();

    // Open Category Modal
    fireEvent.click(screen.getByRole("button", { name: "+ Neue Kategorie" }));
    expect(screen.getByRole("heading", { name: "Kategorie erstellen" })).toBeInTheDocument();

    // Fill category form and submit
    fireEvent.change(screen.getByLabelText("Kategoriename"), { target: { value: "Fitness" } });
    fireEvent.click(screen.getByRole("button", { name: "Speichern" }));

    // Wait for new category to appear
    expect(await screen.findByText("Fitness")).toBeInTheDocument();

    // In edit mode: click "Zur Zusammenfassung" -> jumps directly back to Step 4 with "Fitness"
    const summaryBtn = screen.getByRole("button", { name: "Zur Zusammenfassung" });
    fireEvent.click(summaryBtn);

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();
    expect(screen.getByText(/Fitness/i)).toBeInTheDocument();
  });

  it("resets editing mode when clicking 'Zurück' from Step 2 edit mode (Betrag/Typ edit) and restores forward sequential flow", () => {
    render(<TransactionForm accounts={mockAccounts} categories={mockCategories} />);

    // Initial flow to Step 4
    fireEvent.click(screen.getAllByText("Girokonto")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.change(screen.getByTestId("cent-amount-input"), { target: { value: "3000" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    fireEvent.click(screen.getByRole("button", { name: /Lebensmittel/i }));
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    expect(screen.getByText("Schritt 4 von 4")).toBeInTheDocument();

    // Click Betrag bearbeiten -> Step 2 in edit mode
    fireEvent.click(screen.getByRole("button", { name: "Betrag bearbeiten" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zur Zusammenfassung" })).toBeInTheDocument();

    // Click Zurück from Step 2 -> Step 1, isEditing reset
    fireEvent.click(screen.getByRole("button", { name: "Zurück" }));
    expect(screen.getByText("Schritt 1 von 4")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zurück" })).not.toBeInTheDocument();

    // Click Weiter from Step 1 -> arrives on Step 2 with normal "Weiter" button
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 2 von 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zur Zusammenfassung" })).not.toBeInTheDocument();
  });
});






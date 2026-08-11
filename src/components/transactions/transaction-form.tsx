"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./transaction-form.module.css";
import { createTransactionAction } from "@/lib/actions/transaction";
import {
  appendDigitToCentAmount,
  removeDigitFromCentAmount,
  formatCentAmount,
  centAmountToDecimalString,
  isAccountStepValid,
  isAmountStepValid,
  isCategoryStepValid,
} from "@/lib/transaction-utils";
import { CategoryModal, getCategoryEmoji } from "./category-modal";

export interface AccountOption {
  id: string;
  name: string;
  type: string;
  currentValue: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon?: string | null;
  isSystem?: boolean;
  householdId?: string | null;
}

interface TransactionFormProps {
  accounts: AccountOption[];
  categories: CategoryOption[];
}

function formatAccountTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "giro":
      return "Girokonto";
    case "cash":
      return "Bargeld";
    case "depot":
      return "Depot";
    case "savings":
      return "Sparkonto";
    default:
      return type;
  }
}

function formatCurrency(val: string | number): string {
  const num = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(num)) return "0,00 €";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(num).replace(/\s/g, " ");
}

export function TransactionForm({ accounts, categories: initialCategories }: TransactionFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);

  // Form fields state
  const [accountId, setAccountId] = useState<string>("");
  const [centAmount, setCentAmount] = useState<string>("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form submit state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAccountStepValid(accountId)) {
      setError("Bitte ein Konto auswählen.");
      return;
    }

    if (!isAmountStepValid(centAmount)) {
      setError("Bitte einen gültigen Betrag eingeben.");
      return;
    }

    if (!isCategoryStepValid(categoryId)) {
      setError("Bitte eine Kategorie auswählen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedAmount = centAmountToDecimalString(centAmount);
      const res = await createTransactionAction({
        type,
        amount: formattedAmount,
        description: description.trim() || null,
        date,
        accountId,
        categoryId,
      });

      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const errorObj = err as { digest?: string };
      if (!errorObj.digest?.startsWith("NEXT_REDIRECT")) {
        console.error(err);
        setError("Ein unerwarteter Fehler ist aufgetreten.");
        setIsSubmitting(false);
      }
    }
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {/* Wizard Progress Header */}
        <div className={styles.headerContainer}>
          <div className={styles.progressRow}>
            {currentStep > 1 ? (
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              >
                Zurück
              </button>
            ) : (
              <h1 className={styles.title}>Neue Transaktion</h1>
            )}
            <span className={styles.stepIndicator}>Schritt {currentStep} von 4</span>
            <Link href="/" className={styles.cancelLink}>
              Abbrechen
            </Link>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* STEP 1: Account Selection */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Konto auswählen</h2>
            <div className={styles.accountList}>
              {accounts.map((acc) => {
                const isSelected = acc.id === accountId;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    data-account-tile
                    className={`${styles.accountTile} ${isSelected ? styles.accountTileSelected : ""}`}
                    onClick={() => setAccountId(acc.id)}
                  >
                    <div className={styles.accountTileHeader}>
                      <span className={styles.accountTileName}>{acc.name}</span>
                      <span className={styles.accountTypeBadge}>
                        {formatAccountTypeLabel(acc.type)}
                      </span>
                    </div>
                    <div className={`${styles.accountTileBalance} tabular-nums`}>
                      {formatCurrency(acc.currentValue)}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!isAccountStepValid(accountId)}
              onClick={() => setCurrentStep(2)}
            >
              Weiter
            </button>
          </div>
        )}

        {/* STEP 2: Betrag & Typ */}
        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Betrag & Typ</h2>

            {/* Segmented Expense/Income Switch */}
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeButton} ${
                  type === "expense" ? styles.typeButtonExpenseActive : ""
                }`}
                onClick={() => setType("expense")}
              >
                Ausgabe
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${
                  type === "income" ? styles.typeButtonIncomeActive : ""
                }`}
                onClick={() => setType("income")}
              >
                Einnahme
              </button>
            </div>

            {/* Prominent Cent Amount Display */}
            <div className={styles.amountCard}>
              <div className={`${styles.amountDisplay} tabular-nums`}>
                {formatCentAmount(centAmount)}
              </div>
              <input
                data-testid="cent-amount-input"
                type="text"
                inputMode="numeric"
                value={centAmount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "");
                  if (clean.length <= 9) {
                    setCentAmount(clean);
                  }
                }}
                className={styles.srInput}
              />
            </div>

            {/* Numeric Keypad */}
            <div className={styles.keypadGrid}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className={styles.keypadBtn}
                  onClick={() => setCentAmount((prev) => appendDigitToCentAmount(prev, digit))}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className={styles.keypadBtnSecondary}
                onClick={() => setCentAmount("")}
              >
                C
              </button>
              <button
                type="button"
                className={styles.keypadBtn}
                onClick={() => setCentAmount((prev) => appendDigitToCentAmount(prev, "0"))}
              >
                0
              </button>
              <button
                type="button"
                className={styles.keypadBtnSecondary}
                onClick={() => setCentAmount((prev) => removeDigitFromCentAmount(prev))}
              >
                ⌫
              </button>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!isAmountStepValid(centAmount)}
              onClick={() => setCurrentStep(3)}
            >
              Weiter
            </button>
          </div>
        )}

        {/* STEP 3: Date & Category */}
        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Datum & Kategorie</h2>

            <div className={styles.formGroup}>
              <div className={styles.dateHeader}>
                <label htmlFor="date" className={styles.label}>
                  Datum
                </label>
                <button
                  type="button"
                  className={styles.quickChipBtn}
                  onClick={() => setDate(new Date().toISOString().split("T")[0])}
                >
                  Heute
                </button>
              </div>
              <input
                id="date"
                type="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.categoryHeader}>
                <label className={styles.label}>Kategorie</label>
                <button
                  type="button"
                  className={styles.inlineCategoryBtn}
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  + Neue Kategorie
                </button>
              </div>
              <div className={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isSelected = cat.id === categoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryTile} ${
                        isSelected ? styles.categoryTileSelected : ""
                      }`}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      <span className={styles.categoryIcon}>{getCategoryEmoji(cat.icon)}</span>
                      <span className={styles.categoryName}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!isCategoryStepValid(categoryId)}
              onClick={() => setCurrentStep(4)}
            >
              Weiter
            </button>
          </div>
        )}

        {/* STEP 4: Summary & Submission (Provisional for Slice 4) */}
        {currentStep === 4 && (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Zusammenfassung</h2>

            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>Typ:</span>
                <strong>{type === "expense" ? "Ausgabe" : "Einnahme"}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Konto:</span>
                <strong>{selectedAccount?.name}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Betrag:</span>
                <strong className="tabular-nums">{formatCentAmount(centAmount)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Kategorie:</span>
                <strong>{selectedCategory?.name}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Datum:</span>
                <strong>{date}</strong>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Beschreibung (optional)
              </label>
              <input
                id="description"
                type="text"
                placeholder="z. B. Supermarkteinkauf"
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird gespeichert..." : "Transaktion speichern"}
            </button>
          </div>
        )}
      </form>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          setCategoryId(newCat.id);
        }}
      />
    </>
  );
}


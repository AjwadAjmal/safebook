"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./transaction-form.module.css";
import {
  createTransactionAction,
} from "@/lib/actions/transaction";
import { isValidDecimalInput } from "@/lib/account-utils";

import { CategoryModal } from "./category-modal";

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

export function TransactionForm({ accounts, categories: initialCategories }: TransactionFormProps) {
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "");

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form submit state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount.trim()) {
      setError("Bitte einen Betrag eingeben.");
      return;
    }

    if (!accountId) {
      setError("Bitte ein Konto auswählen.");
      return;
    }

    if (!categoryId) {
      setError("Bitte eine Kategorie auswählen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createTransactionAction({
        type,
        amount,
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
      // If Next.js redirect happens, error digest NEXT_REDIRECT might be thrown in client
      const errorObj = err as { digest?: string };
      if (!errorObj.digest?.startsWith("NEXT_REDIRECT")) {
        console.error(err);
        setError("Ein unerwarteter Fehler ist aufgetreten.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Neue Transaktion</h1>
        <Link href="/" className={styles.cancelLink}>
          Abbrechen
        </Link>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Transaction Type Toggle */}
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

      {/* Account Selection */}
      <div className={styles.formGroup}>
        <label htmlFor="accountId" className={styles.label}>
          Konto
        </label>
        <select
          id="accountId"
          className={styles.select}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.currentValue} €)
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div className={styles.formGroup}>
        <label htmlFor="amount" className={styles.label}>
          Betrag (€)
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          className={`${styles.input} tabular-nums`}
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (isValidDecimalInput(val)) {
              setAmount(val);
            }
          }}
          required
        />
      </div>

      {/* Date Picker */}
      <div className={styles.formGroup}>
        <label htmlFor="date" className={styles.label}>
          Datum
        </label>
        <input
          id="date"
          type="date"
          className={styles.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Category Picker */}
      <div className={styles.formGroup}>
        <div className={styles.categoryHeader}>
          <label htmlFor="categoryId" className={styles.label}>
            Kategorie
          </label>
          <button
            type="button"
            className={styles.inlineCategoryBtn}
            onClick={() => setIsCategoryModalOpen(true)}
          >
            + Neue Kategorie
          </button>
        </div>

        <select
          id="categoryId"
          className={styles.select}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
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

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Wird gespeichert..." : "Transaktion speichern"}
      </button>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./transaction-form.module.css";
import {
  createTransactionAction,
  createCustomCategoryAction,
} from "@/lib/actions/transaction";

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

  // Inline custom category state
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [inlineCategoryError, setInlineCategoryError] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Form submit state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateInlineCategory = async () => {
    if (!newCategoryName.trim() || newCategoryName.trim().length < 2) {
      setInlineCategoryError("Kategoriename muss mindestens 2 Zeichen lang sein");
      return;
    }

    setInlineCategoryError(null);
    setIsSavingCategory(true);

    try {
      const res = await createCustomCategoryAction({ name: newCategoryName.trim() });
      if ("error" in res && res.error) {
        setInlineCategoryError(res.error);
      } else if ("category" in res && res.category) {
        const newCat: CategoryOption = {
          id: res.category.id,
          name: res.category.name,
          icon: res.category.icon || "tag",
          isSystem: false,
          householdId: res.category.householdId,
        };
        setCategories((prev) => [...prev, newCat]);
        setCategoryId(newCat.id);
        setNewCategoryName("");
        setShowInlineCategory(false);
      }
    } catch (err) {
      console.error(err);
      setInlineCategoryError("Fehler beim Erstellen der Kategorie.");
    } finally {
      setIsSavingCategory(false);
    }
  };

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
          onChange={(e) => setAmount(e.target.value)}
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
          {!showInlineCategory && (
            <button
              type="button"
              className={styles.inlineCategoryBtn}
              onClick={() => setShowInlineCategory(true)}
            >
              + Neue Kategorie
            </button>
          )}
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

        {showInlineCategory && (
          <div className={styles.inlineCategoryBox}>
            <input
              type="text"
              placeholder="Kategoriename (z. B. Hobbies)"
              className={styles.inlineCategoryInput}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="button"
              className={styles.inlineCategorySaveBtn}
              onClick={handleCreateInlineCategory}
              disabled={isSavingCategory}
            >
              Speichern
            </button>
            <button
              type="button"
              className={styles.inlineCategoryCancelBtn}
              onClick={() => {
                setShowInlineCategory(false);
                setInlineCategoryError(null);
                setNewCategoryName("");
              }}
            >
              ✕
            </button>
          </div>
        )}
        {inlineCategoryError && (
          <div className={styles.errorMessage}>{inlineCategoryError}</div>
        )}
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
  );
}

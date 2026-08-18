"use client";

import { useState } from "react";
import styles from "./recent-transactions.module.css";
import { formatAmount, isValidDecimalInput } from "@/lib/account-utils";
import {
  deleteTransactionAction,
  updateTransactionAction,
  UpdateTransactionFormInput,
} from "@/lib/actions/transaction";

export interface RecentTransactionItem {
  id: string;
  type: "expense" | "income";
  amount: string;
  description: string | null;
  date: Date | string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
}

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
}

interface RecentTransactionsProps {
  transactions: RecentTransactionItem[];
  accounts?: AccountOption[];
  categories?: CategoryOption[];
}

function getCategoryEmoji(iconName?: string | null): string {
  switch (iconName) {
    case "gas-pump": return "⛽";
    case "shopping-cart": return "🛒";
    case "home": return "🏠";
    case "smile": return "😊";
    case "briefcase": return "💼";
    default: return "🏷️";
  }
}

export function RecentTransactions({
  transactions,
  accounts = [],
  categories = [],
}: RecentTransactionsProps) {
  const [editingTx, setEditingTx] = useState<RecentTransactionItem | null>(null);
  const [editForm, setEditForm] = useState<UpdateTransactionFormInput>({});
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      const res = await deleteTransactionAction(id);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError("Fehler beim Löschen.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const openEditModal = (tx: RecentTransactionItem) => {
    setEditingTx(tx);
    const dateStr =
      tx.date instanceof Date
        ? tx.date.toISOString().split("T")[0]
        : String(tx.date).split("T")[0];

    setEditForm({
      type: tx.type,
      amount: tx.amount,
      description: tx.description ?? "",
      date: dateStr,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
    });
    setError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await updateTransactionAction(editingTx.id, editForm);
      if (res?.error) {
        setError(res.error);
        setIsSaving(false);
      } else {
        setEditingTx(null);
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Failed to update transaction:", err);
      setError("Fehler beim Speichern.");
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Letzte Transaktionen</h2>

      {transactions.length === 0 ? (
        <div className={styles.emptyState} data-testid="recent-transactions-empty">
          Keine letzten Transaktionen vorhanden.
        </div>
      ) : (
        <div className={styles.list} data-testid="recent-transactions-list">
          {transactions.map((tx) => {
            const isExpense = tx.type === "expense";
            const numAmount = Number(tx.amount);
            const formatted = formatAmount(numAmount);
            const displayTitle = tx.description?.trim() || tx.categoryName;
            const emoji = getCategoryEmoji(tx.categoryIcon);

            return (
              <div
                key={tx.id}
                className={styles.item}
                data-testid="recent-transaction-item"
              >
                <div className={styles.itemMain}>
                  <div className={styles.categoryBadge} aria-hidden="true">
                    {emoji}
                  </div>
                  <div className={styles.itemDetails}>
                    <span className={styles.description}>{displayTitle}</span>
                    <span className={styles.subtext}>
                      {tx.accountName} • {tx.categoryName}
                    </span>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <span
                    className={`${
                      isExpense ? styles.amountExpense : styles.amountIncome
                    } tabular-nums`}
                  >
                    {isExpense ? `- ${formatted} €` : `+ ${formatted} €`}
                  </span>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => openEditModal(tx)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => handleDelete(tx.id)}
                      disabled={isDeletingId === tx.id}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Transaktion bearbeiten</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setEditingTx(null)}
              >
                ✕
              </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {/* Type Toggle */}
              <div className={styles.typeToggle}>
                <button
                  type="button"
                  className={`${styles.typeButton} ${
                    editForm.type === "expense" ? styles.typeButtonExpenseActive : ""
                  }`}
                  onClick={() => setEditForm((prev) => ({ ...prev, type: "expense" }))}
                >
                  Ausgabe
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${
                    editForm.type === "income" ? styles.typeButtonIncomeActive : ""
                  }`}
                  onClick={() => setEditForm((prev) => ({ ...prev, type: "income" }))}
                >
                  Einnahme
                </button>
              </div>

              {/* Account Selection */}
              {accounts.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="editAccountId" className={styles.label}>
                    Konto
                  </label>
                  <select
                    id="editAccountId"
                    className={styles.select}
                    value={editForm.accountId || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, accountId: e.target.value }))
                    }
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div className={styles.formGroup}>
                <label htmlFor="editAmount" className={styles.label}>
                  Betrag (€)
                </label>
                <input
                  id="editAmount"
                  type="text"
                  inputMode="decimal"
                  className={`${styles.input} tabular-nums`}
                  value={editForm.amount || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isValidDecimalInput(val)) {
                      setEditForm((prev) => ({ ...prev, amount: val }));
                    }
                  }}
                  required
                />
              </div>

              {/* Category Selection */}
              {categories.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="editCategoryId" className={styles.label}>
                    Kategorie
                  </label>
                  <select
                    id="editCategoryId"
                    className={styles.select}
                    value={editForm.categoryId || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div className={styles.formGroup}>
                <label htmlFor="editDescription" className={styles.label}>
                  Beschreibung
                </label>
                <input
                  id="editDescription"
                  type="text"
                  className={styles.input}
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              {/* Date */}
              <div className={styles.formGroup}>
                <label htmlFor="editDate" className={styles.label}>
                  Datum
                </label>
                <input
                  id="editDate"
                  type="date"
                  className={styles.input}
                  value={editForm.date || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingTx(null)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./category-modal.module.css";
import { createCustomCategoryAction } from "@/lib/actions/transaction";
import { CategoryOption } from "./transaction-form";

export interface CuratedIcon {
  key: string;
  emoji: string;
  label: string;
}

export const CURATED_CATEGORY_ICONS: CuratedIcon[] = [
  { key: "tag", emoji: "🏷️", label: "Tag" },
  { key: "shopping-cart", emoji: "🛒", label: "Einkauf" },
  { key: "gas-pump", emoji: "⛽", label: "Tanken" },
  { key: "home", emoji: "🏠", label: "Wohnen" },
  { key: "briefcase", emoji: "💼", label: "Arbeit" },
  { key: "food", emoji: "🍔", label: "Essen" },
  { key: "car", emoji: "🚗", label: "Auto" },
  { key: "travel", emoji: "✈️", label: "Reisen" },
  { key: "gift", emoji: "🎁", label: "Geschenk" },
  { key: "sports", emoji: "⚽", label: "Sport" },
  { key: "bills", emoji: "📄", label: "Rechnungen" },
  { key: "health", emoji: "🏥", label: "Gesundheit" },
];

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: CategoryOption) => void;
}

export function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("tag");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setSelectedIcon("tag");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Kategoriename muss mindestens 2 Zeichen lang sein");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createCustomCategoryAction({
        name: trimmedName,
        icon: selectedIcon,
      });

      if ("error" in res && res.error) {
        setError(res.error);
      } else if ("category" in res && res.category) {
        const newCat: CategoryOption = {
          id: res.category.id,
          name: res.category.name,
          icon: res.category.icon || selectedIcon,
          isSystem: false,
          householdId: res.category.householdId,
        };
        onSuccess(newCat);
        handleClose();
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Erstellen der Kategorie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Kategorie erstellen</h2>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="modalCategoryName" className={styles.label}>
              Kategoriename
            </label>
            <input
              id="modalCategoryName"
              type="text"
              placeholder="z. B. Hobbies"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Icon auswählen</label>
            <div className={styles.iconGrid}>
              {CURATED_CATEGORY_ICONS.map((iconItem) => {
                const isSelected = selectedIcon === iconItem.key;
                return (
                  <button
                    key={iconItem.key}
                    type="button"
                    title={iconItem.label}
                    className={`${styles.iconTile} ${
                      isSelected ? styles.iconTileSelected : ""
                    }`}
                    onClick={() => setSelectedIcon(iconItem.key)}
                  >
                    {iconItem.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Wird gespeichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

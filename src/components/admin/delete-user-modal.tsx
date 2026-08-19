"use client";

import React from "react";
import styles from "./admin.module.css";

export interface DeleteUserModalProps {
  isOpen: boolean;
  targetUser: { id: string; username: string } | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteUserModal({
  isOpen,
  targetUser,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteUserModalProps) {
  if (!isOpen || !targetUser) return null;

  return (
    <div className={styles.modalOverlay} data-testid="delete-user-modal">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Benutzer löschen</h2>
        </div>

        <p className={styles.modalWarningText}>
          Möchtest du den Benutzer <strong>{targetUser.username}</strong> wirklich unwiderruflich löschen?
          Alle zugehörigen Daten, Konten und Buchungen werden rückstandslos bereinigt.
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Abbrechen
          </button>
          <button
            type="button"
            className={styles.confirmDeleteBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Wird gelöscht..." : "Endgültig löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import styles from "./admin.module.css";
import { createManagedUserAction } from "@/lib/actions/admin";

export interface AdminUserFormProps {
  onUserCreated?: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

export function AdminUserForm({ onUserCreated, showToast }: AdminUserFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { username?: string; password?: string } = {};

    const trimmedUsername = username.trim();
    if (!trimmedUsername || trimmedUsername.length < 3) {
      errors.username = "Benutzername muss mindestens 3 Zeichen lang sein.";
    }

    if (!password || password.length < 6) {
      errors.password = "Passwort muss mindestens 6 Zeichen lang sein.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await createManagedUserAction({
        username: trimmedUsername,
        password,
      });

      if (!result.success) {
        showToast(result.error || "Fehler beim Erstellen des Benutzers.", "error");
      } else {
        showToast("Benutzer erfolgreich erstellt.", "success");
        setUsername("");
        setPassword("");
        onUserCreated?.();
      }
    } catch {
      showToast("Ein unerwarteter Fehler ist aufgetreten.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Neuen Benutzer anlegen</h2>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="adminUsernameInput" className={styles.label}>
            Benutzername
          </label>
          <input
            id="adminUsernameInput"
            type="text"
            className={`${styles.input} ${
              fieldErrors.username ? styles.inputError : ""
            }`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (fieldErrors.username) {
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            disabled={isSubmitting}
            autoComplete="off"
          />
          {fieldErrors.username && (
            <span className={styles.fieldError}>{fieldErrors.username}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="adminPasswordInput" className={styles.label}>
            Passwort
          </label>
          <input
            id="adminPasswordInput"
            type="password"
            className={`${styles.input} ${
              fieldErrors.password ? styles.inputError : ""
            }`}
            placeholder="Mindestens 6 Zeichen"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <span className={styles.fieldError}>{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird angelegt..." : "Benutzer anlegen"}
        </button>
      </form>
    </section>
  );
}

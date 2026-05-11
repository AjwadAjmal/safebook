"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import styles from "./auth.module.css";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Redirect is handled by the action
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Registrieren</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="username">Benutzername</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            minLength={3}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Passwort</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "Wird registriert..." : "Registrieren"}
        </button>
      </form>
      <div className={styles.footer}>
        Bereits ein Konto? <Link href="/login">Anmelden</Link>
      </div>
    </div>
  );
}

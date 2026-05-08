"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import styles from "./auth.module.css";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Redirect is handled by signIn in the action
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Anmelden</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="username">Benutzername</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Passwort</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "Wird angemeldet..." : "Anmelden"}
        </button>
      </form>
      <div className={styles.footer}>
        Noch kein Konto? <Link href="/register">Registrieren</Link>
      </div>
    </div>
  );
}

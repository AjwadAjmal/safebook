"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { Toast } from "@/components/ui/toast";
import styles from "./auth.module.css";

export function LoginForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (searchParams.get("onboardingSuccess") === "true") {
      const timer = setTimeout(() => {
        setShowSuccessToast(true);
      }, 0);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("onboardingSuccess");
      const query = params.toString() ? `?${params.toString()}` : "";
      window.history.replaceState(null, "", `${pathname}${query}`);
      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname]);

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
      {showSuccessToast && (
        <Toast
          message="Haushalt erfolgreich erstellt. Bitte melde dich erneut an."
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
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
    </div>
  );
}


"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import styles from "./auth.module.css";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(login, undefined);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Willkommen zurück</h1>
        <p className={styles.subtitle}>Melde dich an, um deine Finanzen zu verwalten</p>
        
        <form action={dispatch} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Benutzername</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={styles.input}
              placeholder="Dein Name"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>
          
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          
          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? "Anmeldung..." : "Anmelden"}
          </button>
        </form>
        
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/register" className={styles.link}>
            Noch kein Konto? Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}

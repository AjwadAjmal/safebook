"use client";

import { useActionState, useState } from "react";
import { register } from "@/lib/actions/auth";
import styles from "./auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterForm() {
  const [state, dispatch, isPending] = useActionState(register, null);
  const [mode, setMode] = useState<"create" | "join">("create");
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/login?registered=true");
    }
  }, [state, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Konto erstellen</h1>
        <p className={styles.subtitle}>Starte jetzt mit deiner Finanzplanung</p>
        
        <form action={dispatch} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Benutzername</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={styles.input}
              placeholder="Wähle einen Namen"
            />
            {state?.error?.username && <p className={styles.error}>{state.error.username[0]}</p>}
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
              placeholder="Mind. 6 Zeichen"
            />
            {state?.error?.password && <p className={styles.error}>{state.error.password[0]}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Haushalt</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="create" 
                  checked={mode === "create"} 
                  onChange={() => setMode("create")} 
                />
                Neu erstellen
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="join" 
                  checked={mode === "join"} 
                  onChange={() => setMode("join")} 
                />
                Beitreten
              </label>
            </div>
          </div>

          {mode === "create" ? (
            <div className={styles.inputGroup}>
              <label htmlFor="householdName" className={styles.label}>Name des Haushalts</label>
              <input
                id="householdName"
                name="householdName"
                type="text"
                required={mode === "create"}
                className={styles.input}
                placeholder="z.B. Familie Schmidt"
              />
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label htmlFor="inviteCode" className={styles.label}>Einladungscode</label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                required={mode === "join"}
                className={styles.input}
                placeholder="6-stelliger Code"
                style={{ textTransform: "uppercase" }}
              />
            </div>
          )}

          {state?.error && typeof state.error === "string" && (
            <p className={styles.error}>{state.error}</p>
          )}
          
          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? "Registrierung..." : "Konto erstellen"}
          </button>
        </form>
        
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/login" className={styles.link}>
            Bereits ein Konto? Anmelden
          </Link>
        </div>
      </div>
    </div>
  );
}

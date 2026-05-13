"use client";

import { useState } from "react";
import { createHouseholdAction, joinHouseholdAction } from "@/lib/actions/household";
import styles from "./auth.module.css";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "join">("create");

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createHouseholdAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await joinHouseholdAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Willkommen bei Safebook</h1>
        <p className={styles.footer}>
          {mode === "create" 
            ? "Erstelle einen neuen Haushalt für dich oder deine Familie." 
            : "Gib den Einladungscode ein, um einem Haushalt beizutreten."}
        </p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${mode === "create" ? styles.activeTab : ""}`}
          onClick={() => { setMode("create"); setError(null); }}
        >
          Erstellen
        </button>
        <button 
          className={`${styles.tab} ${mode === "join" ? styles.activeTab : ""}`}
          onClick={() => { setMode("join"); setError(null); }}
        >
          Beitreten
        </button>
      </div>

      {mode === "create" ? (
        <form onSubmit={handleCreate} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Name des Haushalts</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="z.B. Familie Schmidt"
              required
              autoFocus
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Wird erstellt..." : "Haushalt erstellen"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="inviteCode">Einladungscode</label>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              placeholder="z.B. ABC123DEF4"
              required
              autoFocus
              maxLength={10}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Wird beigetreten..." : "Haushalt beitreten"}
          </button>
        </form>
      )}
    </div>
  );
}

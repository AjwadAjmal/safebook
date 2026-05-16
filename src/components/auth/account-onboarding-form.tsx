"use client";

import { useState } from "react";
import { createProfileAccounts } from "@/lib/actions/account";
import styles from "./auth.module.css";

type AccountType = "giro" | "depot" | "cash";

interface AccountSelection {
  type: AccountType;
  count: number;
}

export function AccountOnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selections, setSelections] = useState<AccountSelection[]>([
    { type: "giro", count: 0 },
    { type: "depot", count: 0 },
    { type: "cash", count: 0 },
  ]);

  const updateCount = (type: AccountType, delta: number) => {
    setSelections(prev => prev.map(s => 
      s.type === type ? { ...s, count: Math.max(0, s.count + delta) } : s
    ));
    setError(null);
  };

  const totalAccounts = selections.reduce((sum, s) => sum + s.count, 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (totalAccounts === 0) {
      setError("Bitte wähle mindestens ein Konto aus.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const accountsList: {
      type: AccountType;
      name: string;
      institution: string;
      currentValue: string;
      investedCapital?: string;
      initialDate: string;
    }[] = [];

    selections.forEach(sel => {
      for (let i = 0; i < sel.count; i++) {
        const prefix = `${sel.type}_${i}_`;
        accountsList.push({
          type: sel.type,
          name: formData.get(`${prefix}name`) as string,
          institution: formData.get(`${prefix}institution`) as string,
          currentValue: formData.get(`${prefix}currentValue`) as string,
          investedCapital: sel.type === "depot" ? formData.get(`${prefix}investedCapital`) as string : undefined,
          initialDate: formData.get(`${prefix}initialDate`) as string,
        });
      }
    });

    const result = await createProfileAccounts(accountsList);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Deine Konten</h1>
        <p className={styles.footer}>
          Wähle aus, welche Konten du initialisieren möchtest.
        </p>
      </div>

      <div className={styles.tileGrid}>
        {selections.map(sel => (
          <div 
            key={sel.type} 
            className={`${styles.tile} ${sel.count > 0 ? styles.tileActive : ""}`}
          >
            <div className={styles.tileIcon}>
              {sel.type === "giro" && "💳"}
              {sel.type === "depot" && "📈"}
              {sel.type === "cash" && "💵"}
            </div>
            <div className={styles.tileLabel}>
              {sel.type === "giro" && "Girokonto"}
              {sel.type === "depot" && "Aktiendepot"}
              {sel.type === "cash" && "Kasse"}
            </div>
            <div className={styles.tileControls}>
              <button 
                type="button" 
                className={styles.tileButton}
                onClick={() => updateCount(sel.type, -1)}
                disabled={sel.count === 0}
              >
                -
              </button>
              <span className={styles.tileCount}>{sel.count}</span>
              <button 
                type="button" 
                className={styles.tileButton}
                onClick={() => updateCount(sel.type, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {selections.map(sel => (
          Array.from({ length: sel.count }).map((_, i) => (
            <div key={`${sel.type}_${i}`} className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <span>
                  {sel.type === "giro" && "Girokonto"}
                  {sel.type === "depot" && "Aktiendepot"}
                  {sel.type === "cash" && "Kasse"}
                  {` #${i + 1}`}
                </span>
                <span className={styles.sectionBadge}>Neu</span>
              </div>
              
              <div className={styles.field}>
                <label htmlFor={`${sel.type}_${i}_name`}>Kontoname</label>
                <input
                  id={`${sel.type}_${i}_name`}
                  name={`${sel.type}_${i}_name`}
                  type="text"
                  placeholder="z.B. Hauptkonto"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor={`${sel.type}_${i}_institution`}>Institut / Bank</label>
                <input
                  id={`${sel.type}_${i}_institution`}
                  name={`${sel.type}_${i}_institution`}
                  type="text"
                  placeholder="z.B. Sparkasse"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor={`${sel.type}_${i}_currentValue`}>Aktueller Saldo / Wert</label>
                <input
                  id={`${sel.type}_${i}_currentValue`}
                  name={`${sel.type}_${i}_currentValue`}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                />
              </div>

              {sel.type === "depot" && (
                <div className={styles.field}>
                  <label htmlFor={`${sel.type}_${i}_investedCapital`}>Investiertes Kapital</label>
                  <input
                    id={`${sel.type}_${i}_investedCapital`}
                    name={`${sel.type}_${i}_investedCapital`}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor={`${sel.type}_${i}_initialDate`}>Datum des Saldos</label>
                <input
                  id={`${sel.type}_${i}_initialDate`}
                  name={`${sel.type}_${i}_initialDate`}
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
          ))
        ))}

        {error && <div className={styles.error}>{error}</div>}
        
        <button 
          type="submit" 
          className={styles.button} 
          disabled={isLoading || totalAccounts === 0}
        >
          {isLoading ? "Wird gespeichert..." : "Konten speichern & Weiter"}
        </button>
      </form>
    </div>
  );
}

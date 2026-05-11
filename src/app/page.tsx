import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Safebook</h1>
          <p>
            Dein privates, datenschutzorientiertes Haushaltsbuch. 
            Behalte die volle Kontrolle über deine Finanzen, ganz ohne Bankverbindung.
          </p>
        </div>
        <div className={styles.ctas}>
          <Link href="/login" className={styles.primary}>
            Anmelden
          </Link>
          <Link href="/register" className={styles.secondary}>
            Registrieren
          </Link>
        </div>
      </main>
    </div>
  );
}

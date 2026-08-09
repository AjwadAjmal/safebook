import Link from "next/link";
import styles from "./page.module.css";
import { auth, signOut } from "@/auth";
import { getHouseholdById } from "@/lib/household-utils";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import { formatAmount, groupAccountsByType } from "@/lib/account-utils";
import { AccountCard } from "@/components/auth/account-card";
import { Account } from "@/types/profile-creation";

export default async function Home() {
  const session = await auth();

  if (session?.user?.householdId) {
    const householdId = session.user.householdId;
    const household = await getHouseholdById(householdId);
    
    if (household) {
      const dbAccounts = await getAccountsByHouseholdId(householdId);
      
      const mappedAccounts: Account[] = dbAccounts.map(acc => ({
        id: acc.id,
        type: acc.type,
        name: acc.name,
        institution: acc.institution || undefined,
        currentValue: acc.currentValue,
        investedCapital: acc.investedCapital || undefined,
        initialDate: acc.initialDate instanceof Date
          ? acc.initialDate.toISOString().split("T")[0]
          : String(acc.initialDate).split("T")[0]
      }));

      const totalBalance = dbAccounts.reduce((sum, acc) => sum + Number(acc.currentValue), 0);
      const formattedTotalBalance = formatAmount(totalBalance);
      
      const grouped = groupAccountsByType(mappedAccounts);

      const getGroupHeaderLabel = (type: string) => {
        switch (type) {
          case "giro": return "Girokonten";
          case "depot": return "Aktiendepots";
          case "cash": return "Kasse / Bargeld";
          default: return type;
        }
      };

      return (
        <div className="pageContainer" style={{ paddingTop: "var(--space-6)" }}>
          <div className={styles.dashboard}>
            <header className={styles.dashboardHeader}>
              <span className={styles.householdName}>{household.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button type="submit" className={styles.logoutButton}>
                  Abmelden
                </button>
              </form>
            </header>

            <div className={styles.saldoCard}>
              <span className={styles.saldoLabel}>Gesamtsaldo</span>
              <span className={`${styles.saldoValue} tabular-nums`}>
                {formattedTotalBalance} €
              </span>
            </div>

            <Link href="/transactions/new" className={styles.quicklinkAction}>
              <span className={styles.quicklinkIcon} aria-hidden="true">+</span>
              Neue Transaktion
            </Link>

            <main style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {grouped.map(group => (
                <div key={group.type} className={styles.accountGroup}>
                  <h2 className={styles.groupHeader}>
                    {getGroupHeaderLabel(group.type)}
                  </h2>
                  {group.accounts.map(acc => (
                    <AccountCard key={acc.id} account={acc} />
                  ))}
                </div>
              ))}
            </main>
          </div>
        </div>
      );
    }
  }

  // Fallback Landing Page
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

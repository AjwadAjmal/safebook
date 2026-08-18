import Link from "next/link";
import styles from "./page.module.css";
import { auth, signOut } from "@/auth";
import { getHouseholdById } from "@/lib/household-utils";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import { getRecentTransactionsWithDetails } from "@/lib/transaction-db";
import { getCategoriesForHousehold } from "@/lib/category-db";
import { formatAmount, getBalanceColorClass } from "@/lib/account-utils";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { RecentTransactions } from "@/components/transactions/recent-transactions";
import { Account } from "@/types/profile-creation";

export default async function Home() {
  const session = await auth();

  if (session?.user?.householdId) {
    const householdId = session.user.householdId;
    const household = await getHouseholdById(householdId);
    
    if (household) {
      const dbAccounts = await getAccountsByHouseholdId(householdId);
      const recentTransactions = await getRecentTransactionsWithDetails(householdId, 5);
      const dbCategories = await getCategoriesForHousehold(householdId);
      
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
      const balanceColorClass = getBalanceColorClass(totalBalance);
      const saldoColorStyle =
        balanceColorClass === "positive"
          ? styles.saldoPositive
          : balanceColorClass === "negative"
          ? styles.saldoNegative
          : "";

      const handleLogout = async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      };

      return (
        <>
          <SidebarNavigation
            householdName={household.name}
            logoutAction={handleLogout}
          />
          <div className="pageContainer" style={{ paddingTop: "var(--space-6)" }}>
            <div className={styles.dashboard}>
              <Link href="/accounts" className={styles.saldoCard}>
                <div className={styles.saldoContent}>
                  <span className={styles.saldoLabel}>Gesamtsaldo</span>
                  <span className={`${styles.saldoValue} ${saldoColorStyle} tabular-nums`}>
                    {formattedTotalBalance} €
                  </span>
                </div>
                <span className={styles.saldoChevron} aria-hidden="true">›</span>
              </Link>

              <Link href="/transactions/new" className={styles.quicklinkAction}>
                <span className={styles.quicklinkIcon} aria-hidden="true">+</span>
                Neue Transaktion
              </Link>

              <main style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={mappedAccounts}
                  categories={dbCategories}
                />
              </main>
            </div>
          </div>
        </>
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

import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getHouseholdById } from "@/lib/household-utils";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import {
  formatAmount,
  groupAccountsWithSubtotals,
  getBalanceColorClass,
} from "@/lib/account-utils";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { AccountCard } from "@/components/auth/account-card";
import { Account } from "@/types/profile-creation";
import styles from "./accounts.module.css";

export default async function AccountsPage() {
  const session = await auth();

  if (!session?.user?.householdId) {
    redirect("/login");
    return;
  }

  const householdId = session.user.householdId;
  const household = await getHouseholdById(householdId);

  if (!household) {
    redirect("/login");
    return;
  }

  const dbAccounts = await getAccountsByHouseholdId(householdId);

  const mappedAccounts: Account[] = dbAccounts.map((acc) => ({
    id: acc.id,
    type: acc.type,
    name: acc.name,
    institution: acc.institution || undefined,
    currentValue: acc.currentValue,
    investedCapital: acc.investedCapital || undefined,
    initialDate:
      acc.initialDate instanceof Date
        ? acc.initialDate.toISOString().split("T")[0]
        : String(acc.initialDate).split("T")[0],
  }));

  const totalBalance = dbAccounts.reduce(
    (sum, acc) => sum + Number(acc.currentValue),
    0
  );
  const formattedTotalBalance = formatAmount(totalBalance);
  const balanceColorClass = getBalanceColorClass(totalBalance);
  const saldoColorStyle =
    balanceColorClass === "positive"
      ? styles.saldoPositive
      : balanceColorClass === "negative"
      ? styles.saldoNegative
      : "";

  const groupedSummaries = groupAccountsWithSubtotals(mappedAccounts);

  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <>
      <SidebarNavigation
        householdName={household.name}
        logoutAction={handleLogout}
        role={session.user.role}
      />
      <div className="pageContainer" style={{ paddingTop: "var(--space-6)" }}>
        <div className={styles.accountsContainer}>
          <div className={styles.saldoCard}>
            <span className={styles.saldoLabel}>Gesamtsaldo</span>
            <span className={`${styles.saldoValue} ${saldoColorStyle} tabular-nums`}>
              {formattedTotalBalance} €
            </span>
          </div>

          <main style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {groupedSummaries.map((group) => (
              <div key={group.type} className={styles.accountGroup}>
                <div className={styles.groupHeaderRow}>
                  <h2 className={styles.groupLabel}>{group.label}</h2>
                  <span className={`${styles.groupSubtotal} tabular-nums`}>
                    {formatAmount(group.subtotal)} €
                  </span>
                </div>
                {group.accounts.map((acc) => (
                  <AccountCard key={acc.id} account={acc} />
                ))}
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}

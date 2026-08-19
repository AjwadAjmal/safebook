import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getHouseholdById } from "@/lib/household-utils";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import {
  getCategoriesForHousehold,
  seedStandardCategories,
} from "@/lib/category-db";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default async function NewTransactionPage() {
  const session = await auth();

  if (!session?.user?.householdId) {
    redirect("/login");
  }

  const householdId = session.user.householdId;
  const household = await getHouseholdById(householdId);

  if (!household) {
    redirect("/login");
  }

  // Seed default system categories if needed
  await seedStandardCategories();

  const accounts = await getAccountsByHouseholdId(householdId);
  if (!accounts || accounts.length === 0) {
    redirect("/createprofile");
  }

  const categories = await getCategoriesForHousehold(householdId);

  const mappedAccounts = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    currentValue: acc.currentValue,
  }));

  const mappedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    isSystem: cat.isSystem,
    householdId: cat.householdId,
  }));

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
        <TransactionForm
          accounts={mappedAccounts}
          categories={mappedCategories}
        />
      </div>
    </>
  );
}

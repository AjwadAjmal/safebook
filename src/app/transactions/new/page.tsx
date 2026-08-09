import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAccountsByHouseholdId } from "@/lib/account-db";
import {
  getCategoriesForHousehold,
  seedStandardCategories,
} from "@/lib/category-db";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default async function NewTransactionPage() {
  const session = await auth();

  if (!session?.user?.householdId) {
    redirect("/login");
  }

  const householdId = session.user.householdId;

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

  return (
    <div className="pageContainer" style={{ paddingTop: "var(--space-6)" }}>
      <TransactionForm
        accounts={mappedAccounts}
        categories={mappedCategories}
      />
    </div>
  );
}

import { HouseholdOnboardingForm } from "@/components/auth/household-onboarding-form";
import styles from "../../page.module.css";
import { auth } from "@/auth";
import { getUnlinkedAccounts } from "@/lib/account-db";
import { redirect } from "next/navigation";

export default async function OnboardingHouseholdPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const accounts = await getUnlinkedAccounts(session.user.id);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HouseholdOnboardingForm unlinkedAccounts={accounts} />
      </main>
    </div>
  );
}

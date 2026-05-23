import { AccountOnboardingForm } from "@/components/auth/account-onboarding-form";
import styles from "../page.module.css";

export default function OnboardingAccountsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AccountOnboardingForm />
      </main>
    </div>
  );
}

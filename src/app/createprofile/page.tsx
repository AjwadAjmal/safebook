import { ProfileCreationForm } from "@/components/auth/profile-creation-form";
import styles from "../page.module.css";

export default function OnboardingAccountsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ProfileCreationForm />
      </main>
    </div>
  );
}

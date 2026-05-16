import { OnboardingForm } from "@/components/auth/onboarding-form";
import styles from "../page.module.css";

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <OnboardingForm />
      </main>
    </div>
  );
}

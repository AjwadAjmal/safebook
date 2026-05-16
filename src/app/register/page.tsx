import { RegisterForm } from "@/components/auth/register-form";
import styles from "../page.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <RegisterForm />
      </main>
    </div>
  );
}

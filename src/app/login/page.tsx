import { LoginForm } from "@/components/auth/login-form";
import styles from "../page.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LoginForm />
      </main>
    </div>
  );
}

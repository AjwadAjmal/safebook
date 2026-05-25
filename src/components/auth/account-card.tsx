"use client";

import { useState } from "react";
import { Account, AccountType } from "@/types/profile-creation";
import styles from "./auth.module.css";

interface AccountCardProps {
  account: Account;
  onEdit?: (account: Account) => void;
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case "giro": return "Girokonto";
      case "depot": return "Aktiendepot";
      case "cash": return "Kasse";
      default: return "";
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case "giro": return "💳";
      case "depot": return "📈";
      case "cash": return "💵";
      default: return "";
    }
  };

  return (
    <div className={`${styles.accountCard} ${isOpen ? styles.accountCardOpen : ""}`}>
      <div className={styles.accountCardHeader}>
        <div className={styles.accountCardHeaderMain} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.accountCardIcon}>
            {getAccountTypeIcon(account.type)}
          </div>
          <div className={styles.accountCardInfo}>
            <span className={styles.accountCardName}>{account.name}</span>
            <span className={styles.accountCardType}>{getAccountTypeLabel(account.type)}</span>
          </div>
        </div>
        <div className={styles.accountCardActions}>
          <div className={styles.accountCardToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "−" : "＋"}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className={styles.accountCardDetails}>
          <div className={styles.accountCardDetailRow}>
            <span className={styles.accountCardDetailLabel}>Institut</span>
            <span className={styles.accountCardDetailValue}>{account.institution}</span>
          </div>
          <div className={styles.accountCardDetailRow}>
            <span className={styles.accountCardDetailLabel}>Saldo</span>
            <span className={`${styles.accountCardDetailValue} tabular-nums`}>
              {account.currentValue} €
            </span>
          </div>
          <div className={styles.accountCardDetailRow}>
            <span className={styles.accountCardDetailLabel}>Datum</span>
            <span className={styles.accountCardDetailValue}>
              {account.initialDate ? account.initialDate.split("-").reverse().join(".") : ""}
            </span>
          </div>
          {onEdit && (
            <button 
              type="button"
              className={styles.accountCardEditButton}
              onClick={() => onEdit(account)}
            >
              Bearbeiten
            </button>
          )}
        </div>
      )}
    </div>
  );
}

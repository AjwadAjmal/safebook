"use client";

import { useState } from "react";
import { createProfileAccounts } from "@/lib/actions/account";
import { validateAccount, ValidationErrors } from "@/lib/profile-creation-logic";
import { 
  ModalState, 
  createInitialModalState, 
  addAnotherAccount, 
  switchAccount, 
  updateAccountData,
  createEditModalState,
  removeAccountFromModal
} from "@/lib/modal-logic";
import { Account, AccountType } from "@/types/profile-creation";
import { isValidDecimalInput, normalizeAmount, formatAmount, groupAccountsByType } from "@/lib/account-utils";
import { AccountCard } from "./account-card";
import styles from "./auth.module.css";

export function ProfileCreationForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeModalType, setActiveModalType] = useState<AccountType | null>(null);
  
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors[]>([]);

  const getCountByType = (type: AccountType) => accounts.filter(a => a.type === type).length;
  const totalAccounts = accounts.length;

  const groupedAccounts = groupAccountsByType(accounts);

  const handleTileClick = (type: AccountType) => {
    setActiveModalType(type);
    setModalState(createInitialModalState(type));
    setFieldErrors([]);
    setError(null);
  };

  const handleEditAccount = (account: Account) => {
    setActiveModalType(account.type);
    setModalState(createEditModalState(account.type, accounts, account.id));
    setFieldErrors([]);
    setError(null);
  };

  const handleRemoveFromModal = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalState) return;
    setModalState(removeAccountFromModal(modalState, index));
    
    // Clear field error for removed index
    if (fieldErrors[index]) {
      const newErrors = [...fieldErrors];
      newErrors.splice(index, 1);
      setFieldErrors(newErrors);
    }
  };

  const handleCloseModal = () => {
    setActiveModalType(null);
    setModalState(null);
    setFieldErrors([]);
  };

  const handleAddAnother = () => {
    if (!modalState || !activeModalType) return;
    setModalState(addAnotherAccount(modalState, activeModalType));
  };

  const handleSwitchAccount = (index: number) => {
    if (!modalState) return;
    setModalState(switchAccount(modalState, index));
  };

  const handleSaveAccount = () => {
    if (!modalState || !activeModalType) return;

    const allErrors = modalState.accounts.map(acc => validateAccount(acc));
    setFieldErrors(allErrors);

    const hasErrors = allErrors.some(err => Object.keys(err).length > 0);
    if (hasErrors) {
      // Focus the first account with errors
      const firstErrorIndex = allErrors.findIndex(err => Object.keys(err).length > 0);
      setModalState(switchAccount(modalState, firstErrorIndex));
      return;
    }

    // Merge accounts: remove all of current type and add from modal
    const otherAccounts = accounts.filter(a => a.type !== activeModalType);
    setAccounts([...otherAccounts, ...modalState.accounts]);
    handleCloseModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    if (!modalState) return;

    if (name === "currentValue" || name === "investedCapital") {
      if (!isValidDecimalInput(value)) {
        return;
      }
    }
    
    setModalState(updateAccountData(modalState, index, { [name]: value }));
    
    if (fieldErrors[index]?.[name as keyof ValidationErrors]) {
      const newErrors = [...fieldErrors];
      newErrors[index] = { ...newErrors[index], [name]: undefined };
      setFieldErrors(newErrors);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    if (!modalState || (name !== "currentValue" && name !== "investedCapital") || value === "") return;

    const normalized = normalizeAmount(value);
    if (normalized !== null) {
      const formatted = formatAmount(normalized).replace(".", ",");
      setModalState(updateAccountData(modalState, index, { [name]: formatted }));
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (totalAccounts === 0) {
      setError("Bitte wähle mindestens ein Konto aus.");
      return;
    }

    setIsLoading(true);
    
    const result = await createProfileAccounts(accounts.map((acc) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = acc;
      return data;
    }));

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case "giro": return "Girokonto";
      case "depot": return "Aktiendepot";
      case "cash": return "Kasse";
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Deine Konten</h1>
        <p className={styles.footer}>
          Wähle aus, welche Konten du initialisieren möchtest.
        </p>
      </div>

      <div className={styles.tileGrid}>
        {(["giro", "depot", "cash"] as AccountType[]).map(type => {
          const count = getCountByType(type);
          return (
            <div 
              key={type} 
              className={`${styles.tile} ${count > 0 ? styles.tileDisabled : ""}`}
              onClick={() => count === 0 && handleTileClick(type)}
            >
              <div className={styles.tileIcon}>
                {type === "giro" && "💳"}
                {type === "depot" && "📈"}
                {type === "cash" && "💵"}
              </div>
              <div className={styles.tileLabel}>
                {getAccountTypeLabel(type)}
              </div>
              {count > 0 && (
                <div className={styles.tileCountBadge}>{count}</div>
              )}
            </div>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className={styles.accountList}>
          {groupedAccounts.map((group) => (
            <div key={group.type} className={styles.accountGroup}>
              <h3 className={styles.categoryHeader}>
                {getAccountTypeLabel(group.type)}
              </h3>
              {group.accounts.map((acc) => (
                <AccountCard 
                  key={acc.id} 
                  account={acc} 
                  onEdit={handleEditAccount}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {activeModalType && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {getAccountTypeLabel(activeModalType)}
              </h2>
              <button 
                type="button" 
                className={styles.closeButton}
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.accordion}>
                {modalState?.accounts.map((acc, index) => {
                  const isOpen = modalState.editingIndex === index;
                  const errors = fieldErrors[index] || {};
                  return (
                    <div key={acc.id} className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}>
                      <div 
                        className={styles.accordionHeader}
                        onClick={() => handleSwitchAccount(index)}
                      >
                        <span className={styles.accordionTitle}>
                          {acc.name || `Neues ${getAccountTypeLabel(activeModalType)}`}
                        </span>
                        <span className={styles.accordionIcon}>{isOpen ? "−" : "＋"}</span>
                      </div>
                      {isOpen && (
                        <div className={styles.accordionContent}>
                          <div className={styles.field}>
                            <label htmlFor={`name-${index}`}>Bezeichnung</label>
                            <input
                              type="text"
                              id={`name-${index}`}
                              name="name"
                              value={acc.name}
                              onChange={(e) => handleInputChange(e, index)}
                              maxLength={20}
                            />
                            {errors.name && <span className={styles.error}>{errors.name}</span>}
                          </div>
                          {activeModalType !== "cash" && (
                            <div className={styles.field}>
                              <label htmlFor={`institution-${index}`}>Bank / Institut</label>
                              <input
                                type="text"
                                id={`institution-${index}`}
                                name="institution"
                                value={acc.institution}
                                onChange={(e) => handleInputChange(e, index)}
                                maxLength={20}
                              />
                              {errors.institution && <span className={styles.error}>{errors.institution}</span>}
                            </div>
                          )}
                          <div className={styles.field}>
                            <label htmlFor={`currentValue-${index}`}>Aktueller Saldo (€)</label>
                            <input
                              type="text"
                              id={`currentValue-${index}`}
                              name="currentValue"
                              value={acc.currentValue}
                              onChange={(e) => handleInputChange(e, index)}
                              onBlur={(e) => handleBlur(e, index)}
                              placeholder="0,00"
                              inputMode="decimal"
                            />
                            {errors.currentValue && <span className={styles.error}>{errors.currentValue}</span>}
                          </div>
                          {activeModalType === "depot" && (
                            <div className={styles.field}>
                              <label htmlFor={`investedCapital-${index}`}>Investiertes Kapital (€)</label>
                              <input
                                type="text"
                                id={`investedCapital-${index}`}
                                name="investedCapital"
                                value={acc.investedCapital || ""}
                                onChange={(e) => handleInputChange(e, index)}
                                onBlur={(e) => handleBlur(e, index)}
                                placeholder="0,00"
                                inputMode="decimal"
                              />
                              {errors.investedCapital && <span className={styles.error}>{errors.investedCapital}</span>}
                            </div>
                          )}
                          <div className={styles.field}>
                            <label htmlFor={`initialDate-${index}`}>Datum des Saldos</label>
                            <input
                              type="date"
                              id={`initialDate-${index}`}
                              name="initialDate"
                              value={acc.initialDate}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <button
                            type="button"
                            className={styles.accordionDeleteButton}
                            onClick={(e) => handleRemoveFromModal(index, e)}
                          >
                            Dieses Konto entfernen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button 
                  type="button" 
                  className={styles.addAnotherButton}
                  onClick={handleAddAnother}
                >
                  + Weiteres Konto hinzufügen
                </button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.buttonSecondary}
                onClick={handleCloseModal}
              >
                Abbrechen
              </button>
              <button 
                type="button" 
                className={styles.button}
                onClick={handleSaveAccount}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <button 
          type="submit" 
          className={styles.button} 
          disabled={isLoading || totalAccounts === 0}
        >
          {isLoading ? "Wird gespeichert..." : "Profil speichern"}
        </button>
      </form>
    </div>
  );
}


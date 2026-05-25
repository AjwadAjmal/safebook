import { Account, AccountType } from "../types/profile-creation";

export interface ModalState {
  accounts: Account[];
  editingIndex: number | null;
}

export function createInitialModalState(type: AccountType): ModalState {
  const newAccount: Account = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    name: "",
    institution: "",
    currentValue: "",
    initialDate: new Date().toISOString().split('T')[0]
  };
  return {
    accounts: [newAccount],
    editingIndex: 0
  };
}

export function addAnotherAccount(state: ModalState, type: AccountType): ModalState {
  const newAccount: Account = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    name: "",
    institution: "",
    currentValue: "",
    initialDate: new Date().toISOString().split('T')[0]
  };
  return {
    accounts: [...state.accounts, newAccount],
    editingIndex: state.accounts.length
  };
}

export function switchAccount(state: ModalState, index: number): ModalState {
  if (index < 0 || index >= state.accounts.length) return state;
  return {
    ...state,
    editingIndex: index
  };
}

export function updateAccountData(state: ModalState, index: number, data: Partial<Account>): ModalState {
  if (index < 0 || index >= state.accounts.length) return state;
  const newAccounts = [...state.accounts];
  newAccounts[index] = { ...newAccounts[index], ...data };
  return {
    ...state,
    accounts: newAccounts
  };
}

export function createEditModalState(type: AccountType, allAccounts: Account[], editingId: string): ModalState {
  const accountsOfType = allAccounts.filter(acc => acc.type === type);
  const editingIndex = accountsOfType.findIndex(acc => acc.id === editingId);
  
  return {
    accounts: accountsOfType,
    editingIndex: editingIndex >= 0 ? editingIndex : 0
  };
}

export function removeAccountFromModal(state: ModalState, index: number): ModalState {
  const newAccounts = state.accounts.filter((_, i) => i !== index);
  
  let newEditingIndex = state.editingIndex;
  if (newEditingIndex !== null) {
    if (newAccounts.length === 0) {
      newEditingIndex = null;
    } else if (newEditingIndex >= newAccounts.length) {
      newEditingIndex = newAccounts.length - 1;
    }
  }
  
  return {
    accounts: newAccounts,
    editingIndex: newEditingIndex
  };
}

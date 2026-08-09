import { Account, AccountType } from "@/types/profile-creation";

export interface AccountGroupSummary {
  type: AccountType;
  label: string;
  accounts: Account[];
  subtotal: number;
}

export function getAccountGroupLabel(type: AccountType): string {
  switch (type) {
    case "giro":
      return "Girokonten";
    case "depot":
      return "Aktiendepots";
    case "cash":
      return "Kasse / Bargeld";
    default:
      return type;
  }
}

export function groupAccountsByType(accounts: Account[]): { type: AccountType; accounts: Account[] }[] {
  const order: AccountType[] = ["giro", "depot", "cash"];
  const groupedMap = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<AccountType, Account[]>);

  return order
    .filter(type => groupedMap[type] && groupedMap[type].length > 0)
    .map(type => ({
      type,
      accounts: groupedMap[type]
    }));
}

export function groupAccountsWithSubtotals(accounts: Account[]): AccountGroupSummary[] {
  const grouped = groupAccountsByType(accounts);

  return grouped.map((group) => {
    const rawSubtotal = group.accounts.reduce((sum, acc) => {
      const val = Number(acc.currentValue);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const subtotal = Math.round(rawSubtotal * 100) / 100;

    return {
      type: group.type,
      label: getAccountGroupLabel(group.type),
      accounts: group.accounts,
      subtotal,
    };
  });
}


export function normalizeAmount(input: string): string | null {
  const normalized = input.replace(",", ".");
  if (isNaN(Number(normalized))) {
    return null;
  }
  return normalized;
}

export function formatAmount(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return num.toFixed(2);
}

export function isValidDecimalInput(input: string): boolean {
  const normalized = input.replace(",", ".");
  const parts = normalized.split(".");
  if (parts.length > 2) return false;
  if (parts.length === 2 && parts[1].length > 2) return false;
  return true;
}

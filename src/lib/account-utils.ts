import { Account, AccountType } from "@/types/profile-creation";

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

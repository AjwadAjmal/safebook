/**
 * Pure calculation helpers for transaction amounts and account balance adjustments.
 * This module is browser- and server-safe (no DB dependencies).
 */

export function calculateNewBalance(
  currentBalance: string | number,
  amount: string | number,
  type: "expense" | "income"
): string {
  const current = typeof currentBalance === "number" ? currentBalance : parseFloat(currentBalance);
  const amt = typeof amount === "number" ? amount : parseFloat(amount);

  const numCurrent = isNaN(current) ? 0 : current;
  const numAmt = isNaN(amt) ? 0 : amt;

  const result = type === "expense" ? numCurrent - numAmt : numCurrent + numAmt;
  return result.toFixed(2);
}

export function calculateBalanceRollback(
  currentBalance: string | number,
  amount: string | number,
  type: "expense" | "income"
): string {
  // Rollback is the inverse operation of calculateNewBalance
  const inverseType = type === "expense" ? "income" : "expense";
  return calculateNewBalance(currentBalance, amount, inverseType);
}

export function calculateBalanceAdjustmentOnEdit(
  currentBalance: string | number,
  oldTx: { amount: string | number; type: "expense" | "income" },
  newTx: { amount: string | number; type: "expense" | "income" }
): string {
  // Step 1: Revert old transaction to get intermediate balance
  const intermediateBalance = calculateBalanceRollback(currentBalance, oldTx.amount, oldTx.type);
  // Step 2: Apply new transaction
  return calculateNewBalance(intermediateBalance, newTx.amount, newTx.type);
}

export function appendDigitToCentAmount(currentDigits: string, digit: string): string {
  if (!/^\d$/.test(digit)) {
    return currentDigits;
  }
  const cleanCurrent = currentDigits === "0" ? "" : currentDigits;
  const next = cleanCurrent + digit;
  if (next.length > 9) {
    return currentDigits;
  }
  return next;
}

export function removeDigitFromCentAmount(currentDigits: string): string {
  if (!currentDigits || currentDigits.length <= 1) {
    return "";
  }
  return currentDigits.slice(0, -1);
}

export function formatCentAmount(digits: string): string {
  const numCents = parseInt(digits || "0", 10);
  if (isNaN(numCents) || numCents <= 0) {
    return "0,00 €";
  }
  const euros = numCents / 100;
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(euros);
  return formatted.replace(/\s/g, " ");
}

export function centAmountToDecimalString(digits: string): string {
  const numCents = parseInt(digits || "0", 10);
  if (isNaN(numCents) || numCents <= 0) {
    return "0.00";
  }
  return (numCents / 100).toFixed(2);
}

export function isAccountStepValid(accountId?: string | null): boolean {
  return typeof accountId === "string" && accountId.trim().length > 0;
}

export function isAmountStepValid(centAmount: string): boolean {
  const val = parseInt(centAmount || "0", 10);
  return !isNaN(val) && val > 0;
}

export function isCategoryStepValid(categoryId?: string | null): boolean {
  return typeof categoryId === "string" && categoryId.trim().length > 0;
}



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


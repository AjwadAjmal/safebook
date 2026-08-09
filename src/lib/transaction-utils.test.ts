import { test } from "node:test";
import assert from "node:assert";
import { calculateNewBalance, calculateBalanceRollback, calculateBalanceAdjustmentOnEdit } from "./transaction-utils";

test("calculateNewBalance should subtract amount from current balance for expenses", () => {
  const result = calculateNewBalance("100.00", "25.50", "expense");
  assert.strictEqual(result, "74.50");
});

test("calculateNewBalance should add amount to current balance for income", () => {
  const result = calculateNewBalance("100.00", "50.25", "income");
  assert.strictEqual(result, "150.25");
});

test("calculateNewBalance should handle float precision and numbers", () => {
  const result = calculateNewBalance(100.1, 50.05, "expense");
  assert.strictEqual(result, "50.05");
});

test("calculateBalanceRollback should revert expense by adding amount back", () => {
  const result = calculateBalanceRollback("74.50", "25.50", "expense");
  assert.strictEqual(result, "100.00");
});

test("calculateBalanceRollback should revert income by subtracting amount", () => {
  const result = calculateBalanceRollback("150.25", "50.25", "income");
  assert.strictEqual(result, "100.00");
});

test("calculateBalanceAdjustmentOnEdit should correctly compute new balance when changing transaction", () => {
  // Current balance is 75 (after old expense of 25). Old balance was 100.
  // Edit old expense 25 -> new expense 40. New balance should be 60.00.
  const res1 = calculateBalanceAdjustmentOnEdit(
    "75.00",
    { amount: "25.00", type: "expense" },
    { amount: "40.00", type: "expense" }
  );
  assert.strictEqual(res1, "60.00");

  // Edit old expense 25 -> changed to income of 50. New balance should be 100 + 50 = 150.00.
  const res2 = calculateBalanceAdjustmentOnEdit(
    "75.00",
    { amount: "25.00", type: "expense" },
    { amount: "50.00", type: "income" }
  );
  assert.strictEqual(res2, "150.00");
});


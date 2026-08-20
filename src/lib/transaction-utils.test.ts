import { test } from "node:test";
import assert from "node:assert";
import {
  calculateNewBalance,
  calculateBalanceRollback,
  calculateBalanceAdjustmentOnEdit,
  appendDigitToCentAmount,
  removeDigitFromCentAmount,
  formatCentAmount,
  centAmountToDecimalString,
  isAccountStepValid,
  isAmountStepValid,
  isCategoryStepValid,
  formatGermanDate,
  formatSignedCentAmount
} from "./transaction-utils";

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

test("appendDigitToCentAmount should accumulate numeric digits and handle zero prefix correctly", () => {
  assert.strictEqual(appendDigitToCentAmount("", "2"), "2");
  assert.strictEqual(appendDigitToCentAmount("2", "0"), "20");
  assert.strictEqual(appendDigitToCentAmount("20", "0"), "200");
  assert.strictEqual(appendDigitToCentAmount("200", "0"), "2000");
  assert.strictEqual(appendDigitToCentAmount("0", "2"), "2");
  assert.strictEqual(appendDigitToCentAmount("123", "a"), "123");
});

test("removeDigitFromCentAmount should remove last digit or return empty string", () => {
  assert.strictEqual(removeDigitFromCentAmount("2000"), "200");
  assert.strictEqual(removeDigitFromCentAmount("200"), "20");
  assert.strictEqual(removeDigitFromCentAmount("20"), "2");
  assert.strictEqual(removeDigitFromCentAmount("2"), "");
  assert.strictEqual(removeDigitFromCentAmount(""), "");
});

test("formatCentAmount should format cent strings into localized German currency display format", () => {
  assert.strictEqual(formatCentAmount(""), "0,00 €");
  assert.strictEqual(formatCentAmount("0"), "0,00 €");
  assert.strictEqual(formatCentAmount("2"), "0,02 €");
  assert.strictEqual(formatCentAmount("20"), "0,20 €");
  assert.strictEqual(formatCentAmount("2000"), "20,00 €");
  assert.strictEqual(formatCentAmount("123456"), "1.234,56 €");
});

test("centAmountToDecimalString should convert cent string into standard decimal string", () => {
  assert.strictEqual(centAmountToDecimalString(""), "0.00");
  assert.strictEqual(centAmountToDecimalString("0"), "0.00");
  assert.strictEqual(centAmountToDecimalString("2"), "0.02");
  assert.strictEqual(centAmountToDecimalString("20"), "0.20");
  assert.strictEqual(centAmountToDecimalString("2000"), "20.00");
  assert.strictEqual(centAmountToDecimalString("123456"), "1234.56");
});

test("step validation helpers should accurately validate each wizard step condition", () => {
  assert.strictEqual(isAccountStepValid("acc_123"), true);
  assert.strictEqual(isAccountStepValid(""), false);
  assert.strictEqual(isAccountStepValid(null), false);
  assert.strictEqual(isAccountStepValid(undefined), false);

  assert.strictEqual(isAmountStepValid("2000"), true);
  assert.strictEqual(isAmountStepValid("2"), true);
  assert.strictEqual(isAmountStepValid("0"), false);
  assert.strictEqual(isAmountStepValid(""), false);

  assert.strictEqual(isCategoryStepValid("cat_123"), true);
  assert.strictEqual(isCategoryStepValid(""), false);
  assert.strictEqual(isCategoryStepValid(null), false);
  assert.strictEqual(isCategoryStepValid(undefined), false);
});

test("formatGermanDate should convert ISO date string to DD.MM.YYYY format", () => {
  assert.strictEqual(formatGermanDate("2026-08-19"), "19.08.2026");
});

test("formatGermanDate should handle edge cases including single digits, empty strings, and malformed inputs", () => {
  assert.strictEqual(formatGermanDate("2026-8-9"), "09.08.2026");
  assert.strictEqual(formatGermanDate("2026-01-05"), "05.01.2026");
  assert.strictEqual(formatGermanDate(""), "");
  assert.strictEqual(formatGermanDate("invalid-date"), "");
  assert.strictEqual(formatGermanDate("2026-12"), "");
  assert.strictEqual(formatGermanDate(null as unknown as string), "");
  assert.strictEqual(formatGermanDate(undefined as unknown as string), "");
});

test("formatSignedCentAmount should format expense amounts with a minus sign and currency", () => {
  assert.strictEqual(formatSignedCentAmount("2500", "expense"), "- 25,00 €");
  assert.strictEqual(formatSignedCentAmount("50", "expense"), "- 0,50 €");
});

test("formatSignedCentAmount should format income amounts with a plus sign and currency", () => {
  assert.strictEqual(formatSignedCentAmount("2500", "income"), "+ 25,00 €");
  assert.strictEqual(formatSignedCentAmount("50", "income"), "+ 0,50 €");
});

test("formatSignedCentAmount should handle zero, empty, invalid inputs and large amounts with thousand separators", () => {
  assert.strictEqual(formatSignedCentAmount("0", "expense"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount("0", "income"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount("", "expense"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount("", "income"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount("abc", "expense"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount(null as unknown as string, "expense"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount(undefined as unknown as string, "income"), "0,00 €");
  assert.strictEqual(formatSignedCentAmount("12345678", "expense"), "- 123.456,78 €");
  assert.strictEqual(formatSignedCentAmount("12345678", "income"), "+ 123.456,78 €");
});




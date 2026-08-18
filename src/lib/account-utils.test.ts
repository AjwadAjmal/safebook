import { test } from "node:test";
import assert from "node:assert";
import { groupAccountsByType, getAccountGroupLabel, groupAccountsWithSubtotals, getBalanceColorClass } from "./account-utils";
import { Account } from "@/types/profile-creation";

test("groupAccountsByType should group accounts by type and maintain correct order (giro > depot > cash)", () => {
  const mockAccounts: Account[] = [
    { id: "1", type: "cash", name: "Kasse 1", institution: "Privat", currentValue: "100", initialDate: "" },
    { id: "2", type: "giro", name: "Giro 1", institution: "Bank A", currentValue: "1000", initialDate: "" },
    { id: "3", type: "depot", name: "Depot 1", institution: "Bank B", currentValue: "5000", initialDate: "" },
    { id: "4", type: "giro", name: "Giro 2", institution: "Bank C", currentValue: "2000", initialDate: "" },
  ];

  const grouped = groupAccountsByType(mockAccounts);

  assert.strictEqual(grouped.length, 3);
  assert.strictEqual(grouped[0].type, "giro");
  assert.strictEqual(grouped[0].accounts.length, 2);
  assert.strictEqual(grouped[0].accounts[0].id, "2");
  assert.strictEqual(grouped[0].accounts[1].id, "4");

  assert.strictEqual(grouped[1].type, "depot");
  assert.strictEqual(grouped[1].accounts.length, 1);
  assert.strictEqual(grouped[1].accounts[0].id, "3");

  assert.strictEqual(grouped[2].type, "cash");
  assert.strictEqual(grouped[2].accounts.length, 1);
  assert.strictEqual(grouped[2].accounts[0].id, "1");
});

test("groupAccountsByType should exclude empty categories", () => {
  const mockAccounts: Account[] = [
    { id: "1", type: "giro", name: "Giro 1", institution: "Bank A", currentValue: "1000", initialDate: "" },
  ];

  const grouped = groupAccountsByType(mockAccounts);

  assert.strictEqual(grouped.length, 1);
  assert.strictEqual(grouped[0].type, "giro");
  assert.strictEqual(grouped.find(g => g.type === "depot"), undefined);
  assert.strictEqual(grouped.find(g => g.type === "cash"), undefined);
});

test("groupAccountsByType should return an empty array if no accounts are provided", () => {
  assert.deepStrictEqual(groupAccountsByType([]), []);
});

test("getAccountGroupLabel should return German human-readable labels for account types", () => {
  assert.strictEqual(getAccountGroupLabel("giro"), "Girokonten");
  assert.strictEqual(getAccountGroupLabel("depot"), "Aktiendepots");
  assert.strictEqual(getAccountGroupLabel("cash"), "Bargeldkonten");
});

test("groupAccountsWithSubtotals should group accounts with labels and accurate subtotals", () => {
  const mockAccounts: Account[] = [
    { id: "1", type: "cash", name: "Bargeld", institution: "Privat", currentValue: "150.50", initialDate: "" },
    { id: "2", type: "giro", name: "Giro Haupt", institution: "Bank A", currentValue: "1200.00", initialDate: "" },
    { id: "3", type: "depot", name: "Depot ETF", institution: "Bank B", currentValue: "5000.75", initialDate: "" },
    { id: "4", type: "giro", name: "Giro Zweit", institution: "Bank C", currentValue: "-200.50", initialDate: "" },
    { id: "5", type: "cash", name: "Spardose", institution: "Privat", currentValue: "0.00", initialDate: "" },
  ];

  const grouped = groupAccountsWithSubtotals(mockAccounts);

  assert.strictEqual(grouped.length, 3);

  // Giro group (1200.00 - 200.50 = 999.50)
  assert.strictEqual(grouped[0].type, "giro");
  assert.strictEqual(grouped[0].label, "Girokonten");
  assert.strictEqual(grouped[0].accounts.length, 2);
  assert.strictEqual(grouped[0].subtotal, 999.5);

  // Depot group (5000.75)
  assert.strictEqual(grouped[1].type, "depot");
  assert.strictEqual(grouped[1].label, "Aktiendepots");
  assert.strictEqual(grouped[1].accounts.length, 1);
  assert.strictEqual(grouped[1].subtotal, 5000.75);

  // Cash group (150.50 + 0.00 = 150.50)
  assert.strictEqual(grouped[2].type, "cash");
  assert.strictEqual(grouped[2].label, "Bargeldkonten");
  assert.strictEqual(grouped[2].accounts.length, 2);
  assert.strictEqual(grouped[2].subtotal, 150.5);
});

test("groupAccountsWithSubtotals should handle empty accounts array", () => {
  assert.deepStrictEqual(groupAccountsWithSubtotals([]), []);
});

test("getBalanceColorClass should return 'positive' for strictly positive values", () => {
  assert.strictEqual(getBalanceColorClass(100), "positive");
  assert.strictEqual(getBalanceColorClass(0.01), "positive");
  assert.strictEqual(getBalanceColorClass("123.45"), "positive");
  assert.strictEqual(getBalanceColorClass("50,00"), "positive");
});

test("getBalanceColorClass should return 'negative' for strictly negative values", () => {
  assert.strictEqual(getBalanceColorClass(-100), "negative");
  assert.strictEqual(getBalanceColorClass(-0.01), "negative");
  assert.strictEqual(getBalanceColorClass("-123.45"), "negative");
  assert.strictEqual(getBalanceColorClass("-50,00"), "negative");
});

test("getBalanceColorClass should return 'neutral' for zero, empty, or invalid values", () => {
  assert.strictEqual(getBalanceColorClass(0), "neutral");
  assert.strictEqual(getBalanceColorClass(-0), "neutral");
  assert.strictEqual(getBalanceColorClass("0"), "neutral");
  assert.strictEqual(getBalanceColorClass("0.00"), "neutral");
  assert.strictEqual(getBalanceColorClass("-0.00"), "neutral");
  assert.strictEqual(getBalanceColorClass("0,00"), "neutral");
  assert.strictEqual(getBalanceColorClass(""), "neutral");
  assert.strictEqual(getBalanceColorClass("invalid"), "neutral");
  assert.strictEqual(getBalanceColorClass(NaN), "neutral");
});




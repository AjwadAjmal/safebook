import { test } from "node:test";
import assert from "node:assert";
import { validateAccount } from "./onboarding-logic";

test("validateAccount should return errors for empty fields", () => {
  const data = {
    name: "",
    institution: "",
    currentValue: "",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.name, "Name ist erforderlich.");
  assert.strictEqual(errors.institution, "Institut ist erforderlich.");
  assert.strictEqual(errors.currentValue, "Saldo ist erforderlich.");
});

test("validateAccount should return no errors for valid fields", () => {
  const data = {
    name: "Giro",
    institution: "Sparkasse",
    currentValue: "1000",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(Object.keys(errors).length, 0);
});

test("validateAccount should validate numeric balance", () => {
  const data = {
    name: "Giro",
    institution: "Sparkasse",
    currentValue: "abc",
    initialDate: "2024-01-01"
  };

  const errors = validateAccount(data);

  assert.strictEqual(errors.currentValue, "Saldo muss eine Zahl sein.");
});

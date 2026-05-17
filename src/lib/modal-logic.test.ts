import { test } from "node:test";
import assert from "node:assert";
import { createInitialModalState, addAnotherAccount, switchAccount, updateAccountData } from "./modal-logic";

test("addAnotherAccount should add a new account and set it as active", () => {
  const initialState = createInitialModalState("giro");
  assert.strictEqual(initialState.accounts.length, 1);
  assert.strictEqual(initialState.editingIndex, 0);

  const nextState = addAnotherAccount(initialState, "giro");

  assert.strictEqual(nextState.accounts.length, 2, "Should have 2 accounts");
  assert.strictEqual(nextState.editingIndex, 1, "Second account should be active");
  assert.strictEqual(nextState.accounts[1].type, "giro");
});

test("switchAccount should change the active account index", () => {
  const initialState = createInitialModalState("giro");
  const stateWithTwo = addAnotherAccount(initialState, "giro");
  assert.strictEqual(stateWithTwo.editingIndex, 1);

  const switchedState = switchAccount(stateWithTwo, 0);

  assert.strictEqual(switchedState.editingIndex, 0, "Should switch to first account");
  assert.strictEqual(switchedState.accounts.length, 2, "Should still have 2 accounts");
});

test("updateAccountData should update the correct account", () => {
  const initialState = createInitialModalState("giro");
  const updatedState = updateAccountData(initialState, 0, { name: "Updated Name" });

  assert.strictEqual(updatedState.accounts[0].name, "Updated Name");
});

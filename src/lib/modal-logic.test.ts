import { test } from "node:test";
import assert from "node:assert";
import { createInitialModalState, addAnotherAccount, switchAccount, updateAccountData, createEditModalState } from "./modal-logic";

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

test("createEditModalState should initialize with existing accounts of type and focus on correct ID", () => {
  const allAccounts: Account[] = [
    { id: "1", type: "giro", name: "Giro 1", institution: "Bank A", currentValue: "100", initialDate: "2024-01-01" },
    { id: "2", type: "depot", name: "Depot 1", institution: "Bank B", currentValue: "200", initialDate: "2024-01-01" },
    { id: "3", type: "giro", name: "Giro 2", institution: "Bank C", currentValue: "300", initialDate: "2024-01-01" },
  ];

  const state = createEditModalState("giro", allAccounts, "3");

  assert.strictEqual(state.accounts.length, 2, "Should only contain Giro accounts");
  assert.strictEqual(state.accounts[0].id, "1");
  assert.strictEqual(state.accounts[1].id, "3");
  assert.strictEqual(state.editingIndex, 1, "Should focus on account with ID 3");
});

test("createInitialModalState should initialize investedCapital as empty string for depot accounts", () => {
  const state = createInitialModalState("depot");
  assert.strictEqual(state.accounts[0].type, "depot");
  assert.strictEqual(state.accounts[0].investedCapital, "");
  
  const giroState = createInitialModalState("giro");
  assert.strictEqual(giroState.accounts[0].investedCapital, undefined);
});

test("addAnotherAccount should initialize investedCapital as empty string for depot accounts", () => {
  const initialState = createInitialModalState("giro");
  const nextState = addAnotherAccount(initialState, "depot");
  assert.strictEqual(nextState.accounts[1].type, "depot");
  assert.strictEqual(nextState.accounts[1].investedCapital, "");
});


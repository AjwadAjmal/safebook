import { AccountData } from "../types/profile-creation";

export interface ValidationErrors {
  name?: string;
  institution?: string;
  currentValue?: string;
  investedCapital?: string;
}

export function validateAccount(data: AccountData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name ist erforderlich.";
  }

  if (!data.institution.trim()) {
    errors.institution = "Institut ist erforderlich.";
  }

  if (!data.currentValue.trim()) {
    errors.currentValue = "Saldo ist erforderlich.";
  } else if (isNaN(Number(data.currentValue.replace(",", ".")))) {
    errors.currentValue = "Saldo muss eine Zahl sein.";
  }

  if (data.type === "depot") {
    if (data.investedCapital === undefined || data.investedCapital === null || !data.investedCapital.trim()) {
      errors.investedCapital = "Investiertes Kapital ist erforderlich.";
    } else {
      const parsedCapital = Number(data.investedCapital.replace(",", "."));
      if (isNaN(parsedCapital)) {
        errors.investedCapital = "Investiertes Kapital muss eine Zahl sein.";
      } else if (parsedCapital < 0) {
        errors.investedCapital = "Investiertes Kapital darf nicht negativ sein.";
      }
    }
  }

  return errors;
}


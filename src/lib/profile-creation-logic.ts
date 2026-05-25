export interface AccountData {
  name: string;
  institution: string;
  currentValue: string;
  initialDate: string;
}

export interface ValidationErrors {
  name?: string;
  institution?: string;
  currentValue?: string;
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

  return errors;
}

export type AccountType = "giro" | "depot" | "cash";

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  institution: string;
  currentValue: string;
  investedCapital?: string;
  initialDate: string;
}

export interface AccountData {
  type: AccountType;
  name: string;
  institution: string;
  currentValue: string;
  investedCapital?: string;
  initialDate: string;
}


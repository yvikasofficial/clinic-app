// Payment Method types
export enum PaymentMethodType {
  CARD = "CARD",
  BANK_ACCOUNT = "BANK_ACCOUNT",
}

export interface PaymentMethod {
  id: string;
  patientId: string;
  brand: string | null; // For cards only
  last4: string | null; // For cards only
  expMonth: number | null; // For cards only
  expYear: number | null; // For cards only
  accountHolderType: string | null; // For bank accounts only
  accountNumberLast4: number | null; // For bank accounts only
  bankName: string | null; // For bank accounts only
  routingNumber: number | null; // For bank accounts only
  description: string;
  type: PaymentMethodType;
  isDefault: boolean;
}

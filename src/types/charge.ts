// Enums for charge-specific values
export enum ChargeStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum AdjustmentType {
  DISCOUNT = "DISCOUNT",
  SURCHARGE = "SURCHARGE",
  INSURANCE_ADJUSTMENT = "INSURANCE_ADJUSTMENT",
  WRITE_OFF = "WRITE_OFF",
}

export enum PaymentMedium {
  CARD = "CARD",
  CASH = "CASH",
  CHECK = "CHECK",
  BANK_TRANSFER = "BANK_TRANSFER",
  INSURANCE = "INSURANCE",
}

export enum PlannedPaymentStatus {
  SCHEDULED = "SCHEDULED",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// Nested object types
export interface ChargePatient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ChargeCreator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface Refund {
  id: string;
  amount: number;
  reason: string;
  createdDate: string; // ISO date string
}

export interface Payment {
  id: string;
  amount: number;
  createdDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  paymentMedium: PaymentMedium;
  refunds: Refund[];
}

export interface Adjustment {
  id: string;
  chargeId: string;
  amount: number;
  type: AdjustmentType;
  description: string;
  createdDate: string; // ISO date string
}

export interface PlannedPayment {
  id: string;
  amount: number;
  paymentDate: string; // ISO date string
  status: PlannedPaymentStatus;
}

export interface ChargeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  createdDate: string; // ISO date string
  category: string;
}

export interface ChargeItemEntry {
  item_id: string;
  charge_id: string;
  quantity: number;
  item: ChargeItem;
}

// Main Charge interface
export interface Charge {
  id: string;
  total: number;
  totalOutstanding: number;
  description: string;
  status: ChargeStatus;
  patient: ChargePatient;
  createdDate: string; // ISO date string
  creator: ChargeCreator;
  adjustments: Adjustment[];
  payments: Payment[];
  plannedPayments: PlannedPayment[];
  comment: string | null;
  items: ChargeItemEntry[];
  locationId: string | null;
  locationName: string | null;
}

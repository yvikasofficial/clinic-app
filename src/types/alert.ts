// Enums for alert-specific values
export enum AlertType {
  FORM_SUBMITTED = "FORM_SUBMITTED",
  APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED",
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
}

// Nested object types
export interface AlertTag {
  id: string;
  name: string;
}

export interface AlertProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AlertPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// Alert data structures for different types
export interface FormSubmittedData {
  id: string;
  name: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  submittedAt: string;
}

export interface AppointmentScheduledData {
  id: string;
  title: string;
  start: string;
  end: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  appointment: {
    id: string;
    reason: string;
    confirmationStatus: string;
  };
}

export interface MessageReceivedData {
  message: string;
  data: {
    chatId: string;
    messageType: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Union type for alert data
export type AlertData =
  | FormSubmittedData
  | AppointmentScheduledData
  | MessageReceivedData;

// Main Alert interface
export interface Alert {
  id: string;
  type: AlertType;
  data: AlertData;
  createdDate: string; // ISO date string
  actionRequired: boolean;
  resolvedDate: string | null; // ISO date string
  tags: AlertTag[];
  assignedProvider: AlertProvider;
  resolvingProvider: AlertProvider | null;
  occurrences: number; // Fixed typo from "occurances"
  patient: AlertPatient;
}

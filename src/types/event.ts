// Enums for specific values
export enum EventType {
  APPOINTMENT = "APPOINTMENT",
  MEETING = "MEETING",
  CONSULTATION = "CONSULTATION",
}

export enum EventStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export enum ConfirmationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum AppointmentType {
  NEW_PATIENT = "NEW_PATIENT",
  FOLLOW_UP = "FOLLOW_UP",
  ANNUAL_PHYSICAL = "ANNUAL_PHYSICAL",
  URGENT_CARE = "URGENT_CARE",
  CONSULTATION = "CONSULTATION",
}

// Nested object types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Attendee {
  user: User;
  inviteStatus: InviteStatus;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isVirtual: boolean;
  meetingLink: string | null;
}

export interface Appointment {
  id: string;
  eventId: string;
  patientId: string;
  providerId: string;
  reason: string;
  confirmationStatus: ConfirmationStatus;
  confirmationDate: string | null; // ISO date string
  checkedInDate: string | null; // ISO date string
  appointmentType: AppointmentType;
}

// Main Event interface
export interface Event {
  id: string;
  title: string;
  organizer: User;
  start: string; // ISO date string
  end: string; // ISO date string
  type: EventType;
  status: EventStatus;
  meetingLink: string | null;
  attendees: Attendee[];
  location: Location;
  formCompleted: boolean;
  appointment: Appointment;
}

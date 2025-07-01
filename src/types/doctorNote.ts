// Patient interface for doctor notes (simplified from full Patient type)
export interface DoctorNotePatient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  addressLineTwo: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  dateOfBirth: string; // Date in YYYY-MM-DD format
  gender: string;
}

// Main DoctorNote interface
export interface DoctorNote {
  id: string;
  eventId: string;
  parentNoteId: string;
  noteTranscriptId: string | null;
  duration: number | null;
  version: number;
  currentVersion: number;
  content: string;
  summary: string;
  aiGenerated: boolean;
  template: string | null;
  patient: DoctorNotePatient;
  createdDate: string; // ISO date string
  providerNames: string[];
}

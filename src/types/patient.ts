// Enums for specific values
export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  SEPARATED = "SEPARATED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum EmploymentStatus {
  EMPLOYED = "EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  RETIRED = "RETIRED",
  STUDENT = "STUDENT",
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum MeasurementType {
  WEIGHT = "WEIGHT",
  HEIGHT = "HEIGHT",
  BLOOD_PRESSURE = "BLOOD_PRESSURE",
  HEART_RATE = "HEART_RATE",
  TEMPERATURE = "TEMPERATURE",
}

// Nested object types
export interface Measurement {
  id: string;
  patientId: string;
  type: MeasurementType;
  value: number | string; // Can be numeric or string like "120/80"
  unit: string;
  date: string; // ISO date string
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // Date in YYYY-MM-DD format
  endDate: string | null;
  active: boolean;
}

// Main Patient interface
export interface Patient {
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
  addressValid: boolean;
  guardianName: string | null;
  guardianPhoneNumber: string | null;
  maritalStatus: MaritalStatus;
  gender: Gender;
  employmentStatus: EmploymentStatus;
  status: Status;
  dateOfBirth: string; // Date in YYYY-MM-DD format
  allergies: string[];
  familyHistory: string[];
  medicalHistory: string[];
  prescriptions: string[];
  goalWeight: number;
  isOnboardingComplete: boolean;
  createdDate: string; // ISO date string
  firebaseUid: string;
  measurements: Measurement[];
  medications: Medication[];
}

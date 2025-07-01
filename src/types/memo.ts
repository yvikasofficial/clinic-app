// Patient interface for memo
export interface MemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// Creator interface for memo (reusing User structure)
export interface MemoCreator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Main Memo interface
export interface Memo {
  id: string;
  patient: MemoPatient;
  note: string;
  creator: MemoCreator;
  createdDate: string; // ISO date string
  updatedDate: string; // ISO date string
}

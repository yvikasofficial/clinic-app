"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoctorNote } from "@/actions/doctorNotes";
import { DoctorNote, DoctorNotePatient } from "@/types/doctorNote";
import { Patient } from "@/types/patient";

export interface CreateDoctorNoteData {
  patient: Patient;
  content: string;
  summary: string;
  providers: string[];
}

interface FormErrors {
  content?: string;
  summary?: string;
  providers?: string;
  general?: string;
}

// Generate unique IDs
const generateNoteId = () => {
  return `nt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateEventId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validation function
const validateDoctorNoteData = (data: CreateDoctorNoteData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.content.trim()) {
    errors.content = "Doctor note content is required";
  } else if (data.content.trim().length < 50) {
    errors.content = "Doctor note content must be at least 50 characters long";
  }

  if (!data.summary.trim()) {
    errors.summary = "Summary is required";
  } else if (data.summary.trim().length < 20) {
    errors.summary = "Summary must be at least 20 characters long";
  }

  if (data.providers.length === 0) {
    errors.providers = "At least one healthcare provider must be specified";
  }

  return errors;
};

export function useCreateDoctorNote() {
  const queryClient = useQueryClient();

  return useMutation<DoctorNote, Error, CreateDoctorNoteData>({
    mutationFn: async (data: CreateDoctorNoteData) => {
      // Validate data
      const validationErrors = validateDoctorNoteData(data);
      if (Object.keys(validationErrors).length > 0) {
        const errorMessage = Object.values(validationErrors)[0];
        throw new Error(errorMessage);
      }

      // Create doctor note patient object
      const doctorNotePatient: DoctorNotePatient = {
        id: data.patient.id,
        firstName: data.patient.firstName,
        lastName: data.patient.lastName,
        phoneNumber: data.patient.phoneNumber,
        email: data.patient.email,
        address: data.patient.address,
        addressLineTwo: data.patient.addressLineTwo,
        city: data.patient.city,
        state: data.patient.state,
        zipCode: data.patient.zipCode,
        country: data.patient.country,
        dateOfBirth: data.patient.dateOfBirth,
        gender: data.patient.gender,
      };

      // Generate unique IDs
      const noteId = generateNoteId();
      const eventId = generateEventId();

      const doctorNote: DoctorNote = {
        id: noteId,
        eventId: eventId,
        parentNoteId: noteId,
        noteTranscriptId: null,
        duration: null,
        version: 1,
        currentVersion: 1,
        content: data.content.trim(),
        summary: data.summary.trim(),
        aiGenerated: true,
        template: null,
        patient: doctorNotePatient,
        createdDate: new Date().toISOString(),
        providerNames: data.providers,
      };

      // Log for verification
      console.log(
        "Creating doctor note with exact JSON structure:",
        JSON.stringify(doctorNote, null, 2)
      );
      await addDoctorNote(doctorNote);
      console.log("Doctor note created:", doctorNote);
      return doctorNote;
    },
    onSuccess: (data) => {
      // Invalidate and refetch doctor notes for this patient
      queryClient.invalidateQueries({
        queryKey: ["doctorNotes", "patient", data.patient.id],
      });

      // Optionally update the cache directly
      queryClient.setQueryData<DoctorNote[]>(
        ["doctorNotes", "patient", data.patient.id],
        (oldData) => (oldData ? [data, ...oldData] : [data])
      );
    },
    onError: (error) => {
      console.error("Failed to create doctor note:", error);
    },
  });
}

// Export the validation function for external use if needed
export { validateDoctorNoteData };

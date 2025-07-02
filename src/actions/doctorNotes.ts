"use server";

import { DoctorNote } from "@/types/doctorNote";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  doctor_notes: DoctorNote[];
}

// JSONBin API configuration
const DOCTOR_NOTES_BIN_URL = jsonbin.DOCTOR_NOTES;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(DOCTOR_NOTES_BIN_URL, "GET");
    return response.record || { doctor_notes: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { doctor_notes: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(DOCTOR_NOTES_BIN_URL, "PUT", data);
  } catch (error) {
    console.error("Failed to save data to JSONBin:", error);
    throw new Error("Failed to save data");
  }
}

// Initialize database connection (no longer needed for JSONBin, but kept for compatibility)
export async function initDoctorNotesDB() {
  try {
    // JSONBin doesn't require initialization, but we can test connectivity
    await getData();
  } catch (error) {
    console.error("Failed to initialize JSONBin connection:", error);
    throw new Error("JSONBin connection failed");
  }
}

// Get all doctor notes
export async function getDoctorNotes(): Promise<DoctorNote[]> {
  try {
    const data = await getData();
    return data.doctor_notes || [];
  } catch (error) {
    console.error("Failed to get doctor notes:", error);
    throw new Error("Failed to retrieve doctor notes");
  }
}

// Get doctor notes by patient ID
export async function getDoctorNotesByPatientId(
  patientId: string
): Promise<DoctorNote[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const data = await getData();
    return (
      data.doctor_notes.filter((note) => note.patient.id === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get doctor notes by patient ID:", error);
    throw new Error("Failed to retrieve doctor notes");
  }
}

// Add a new doctor note
export async function addDoctorNote(
  doctorNote: DoctorNote
): Promise<DoctorNote> {
  try {
    const data = await getData();

    // Validate required fields
    if (!doctorNote.id || !doctorNote.content || !doctorNote.patient?.id) {
      throw new Error("Missing required doctor note fields");
    }

    // Check if doctor note already exists
    const existingNote = data.doctor_notes.find(
      (note) => note.id === doctorNote.id
    );
    if (existingNote) {
      throw new Error("Doctor note with this ID already exists");
    }

    data.doctor_notes.push(doctorNote);
    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/doctor-notes");
    revalidatePath(`/patients/${doctorNote.patient.id}`);

    return doctorNote;
  } catch (error) {
    console.error("Failed to add doctor note:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add doctor note"
    );
  }
}

// Update a doctor note
export async function updateDoctorNote(
  id: string,
  updates: Partial<DoctorNote>
): Promise<DoctorNote | null> {
  try {
    if (!id) {
      throw new Error("Doctor note ID is required");
    }

    const data = await getData();
    const noteIndex = data.doctor_notes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      throw new Error("Doctor note not found");
    }

    data.doctor_notes[noteIndex] = {
      ...data.doctor_notes[noteIndex],
      ...updates,
    };
    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/doctor-notes");
    revalidatePath(`/doctor-notes/${id}`);
    if (data.doctor_notes[noteIndex].patient?.id) {
      revalidatePath(`/patients/${data.doctor_notes[noteIndex].patient.id}`);
    }

    return data.doctor_notes[noteIndex];
  } catch (error) {
    console.error("Failed to update doctor note:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update doctor note"
    );
  }
}

// Delete a doctor note
export async function deleteDoctorNote(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Doctor note ID is required");
    }

    const data = await getData();
    const initialLength = data.doctor_notes.length;
    const noteToDelete = data.doctor_notes.find((note) => note.id === id);

    data.doctor_notes = data.doctor_notes.filter((note) => note.id !== id);

    const deleted = data.doctor_notes.length < initialLength;

    if (deleted) {
      await saveData(data);

      // Revalidate relevant pages
      revalidatePath("/doctor-notes");
      if (noteToDelete?.patient?.id) {
        revalidatePath(`/patients/${noteToDelete.patient.id}`);
      }
    }

    return deleted;
  } catch (error) {
    console.error("Failed to delete doctor note:", error);
    throw new Error("Failed to delete doctor note");
  }
}

// Get a doctor note by ID
export async function getDoctorNoteById(
  id: string
): Promise<DoctorNote | null> {
  try {
    if (!id) {
      throw new Error("Doctor note ID is required");
    }

    const data = await getData();
    return data.doctor_notes.find((note) => note.id === id) || null;
  } catch (error) {
    console.error("Failed to get doctor note by ID:", error);
    throw new Error("Failed to retrieve doctor note");
  }
}

// Get doctor notes by event ID
export async function getDoctorNotesByEventId(
  eventId: string
): Promise<DoctorNote[]> {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const data = await getData();
    return data.doctor_notes.filter((note) => note.eventId === eventId) || [];
  } catch (error) {
    console.error("Failed to get doctor notes by event ID:", error);
    throw new Error("Failed to retrieve doctor notes");
  }
}

// Get doctor notes by provider name
export async function getDoctorNotesByProvider(
  providerName: string
): Promise<DoctorNote[]> {
  try {
    if (!providerName) {
      throw new Error("Provider name is required");
    }

    const data = await getData();
    return (
      data.doctor_notes.filter((note) =>
        note.providerNames.includes(providerName)
      ) || []
    );
  } catch (error) {
    console.error("Failed to get doctor notes by provider:", error);
    throw new Error("Failed to retrieve doctor notes");
  }
}

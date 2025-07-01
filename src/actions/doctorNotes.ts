"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { DoctorNote } from "@/types/doctorNote";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  doctor_notes: DoctorNote[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "doctors_notes.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { doctor_notes: [] });

// Initialize database connection
export async function initDoctorNotesDB() {
  try {
    await db.read();

    // Initialize with empty doctor_notes array if file doesn't exist
    if (!db.data) {
      db.data = { doctor_notes: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize doctor notes database:", error);
    throw new Error("Doctor notes database initialization failed");
  }
}

// Get all doctor notes
export async function getDoctorNotes(): Promise<DoctorNote[]> {
  try {
    await db.read();
    return db.data?.doctor_notes || [];
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

    await db.read();
    return (
      db.data?.doctor_notes.filter((note) => note.patient.id === patientId) ||
      []
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
    await db.read();

    if (!db.data) {
      db.data = { doctor_notes: [] };
    }

    // Validate required fields
    if (!doctorNote.id || !doctorNote.content || !doctorNote.patient?.id) {
      throw new Error("Missing required doctor note fields");
    }

    // Check if doctor note already exists
    const existingNote = db.data.doctor_notes.find(
      (note) => note.id === doctorNote.id
    );
    if (existingNote) {
      throw new Error("Doctor note with this ID already exists");
    }

    db.data.doctor_notes.push(doctorNote);
    await db.write();

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

    await db.read();
    const noteIndex =
      db.data?.doctor_notes.findIndex((note) => note.id === id) ?? -1;

    if (noteIndex === -1) {
      throw new Error("Doctor note not found");
    }

    if (db.data?.doctor_notes[noteIndex]) {
      db.data.doctor_notes[noteIndex] = {
        ...db.data.doctor_notes[noteIndex],
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/doctor-notes");
      revalidatePath(`/doctor-notes/${id}`);
      if (db.data.doctor_notes[noteIndex].patient?.id) {
        revalidatePath(
          `/patients/${db.data.doctor_notes[noteIndex].patient.id}`
        );
      }

      return db.data.doctor_notes[noteIndex];
    }

    return null;
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

    await db.read();
    const initialLength = db.data?.doctor_notes.length || 0;

    if (db.data?.doctor_notes) {
      const noteToDelete = db.data.doctor_notes.find((note) => note.id === id);
      db.data.doctor_notes = db.data.doctor_notes.filter(
        (note) => note.id !== id
      );
      await db.write();

      const deleted = db.data.doctor_notes.length < initialLength;

      if (deleted) {
        // Revalidate relevant pages
        revalidatePath("/doctor-notes");
        if (noteToDelete?.patient?.id) {
          revalidatePath(`/patients/${noteToDelete.patient.id}`);
        }
      }

      return deleted;
    }

    return false;
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

    await db.read();
    return db.data?.doctor_notes.find((note) => note.id === id) || null;
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

    await db.read();
    return (
      db.data?.doctor_notes.filter((note) => note.eventId === eventId) || []
    );
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

    await db.read();
    return (
      db.data?.doctor_notes.filter((note) =>
        note.providerNames.includes(providerName)
      ) || []
    );
  } catch (error) {
    console.error("Failed to get doctor notes by provider:", error);
    throw new Error("Failed to retrieve doctor notes");
  }
}

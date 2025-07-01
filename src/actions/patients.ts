"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { Patient } from "@/types/patient";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  patients: Patient[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "patients.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { patients: [] });

// Initialize database connection
export async function initDB() {
  try {
    await db.read();

    // Initialize with empty patients array if file doesn't exist
    if (!db.data) {
      db.data = { patients: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
}

// Get all patients
export async function getPatients(): Promise<Patient[]> {
  try {
    await db.read();
    return db.data?.patients || [];
  } catch (error) {
    console.error("Failed to get patients:", error);
    throw new Error("Failed to retrieve patients");
  }
}

// Add a new patient
export async function addPatient(patient: Patient): Promise<Patient> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { patients: [] };
    }

    // Validate required fields
    if (!patient.id || !patient.firstName || !patient.lastName) {
      throw new Error("Missing required patient fields");
    }

    // Check if patient already exists
    const existingPatient = db.data.patients.find((p) => p.id === patient.id);
    if (existingPatient) {
      throw new Error("Patient with this ID already exists");
    }

    db.data.patients.push(patient);
    await db.write();

    // Revalidate relevant pages
    revalidatePath("/patients");

    return patient;
  } catch (error) {
    console.error("Failed to add patient:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add patient"
    );
  }
}

// Update a patient
export async function updatePatient(
  id: string,
  updates: Partial<Patient>
): Promise<Patient | null> {
  try {
    if (!id) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    const patientIndex = db.data?.patients.findIndex((p) => p.id === id) ?? -1;

    if (patientIndex === -1) {
      throw new Error("Patient not found");
    }

    if (db.data?.patients[patientIndex]) {
      db.data.patients[patientIndex] = {
        ...db.data.patients[patientIndex],
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/patients");
      revalidatePath(`/patients/${id}`);

      return db.data.patients[patientIndex];
    }

    return null;
  } catch (error) {
    console.error("Failed to update patient:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update patient"
    );
  }
}

// Delete a patient
export async function deletePatient(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    const initialLength = db.data?.patients.length || 0;

    if (db.data?.patients) {
      db.data.patients = db.data.patients.filter((p) => p.id !== id);
      await db.write();

      const deleted = db.data.patients.length < initialLength;

      if (deleted) {
        // Revalidate relevant pages
        revalidatePath("/patients");
      }

      return deleted;
    }

    return false;
  } catch (error) {
    console.error("Failed to delete patient:", error);
    throw new Error("Failed to delete patient");
  }
}

// Get a patient by ID
export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    if (!id) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    return db.data?.patients.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Failed to get patient by ID:", error);
    throw new Error("Failed to retrieve patient");
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Patient } from "@/types/patient";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  patients: Patient[];
}

// JSONBin API configuration
const PATIENTS_BIN_URL = jsonbin.PATIENTS;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(PATIENTS_BIN_URL, "GET");
    return response.record || { patients: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { patients: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(PATIENTS_BIN_URL, "PUT", data);
  } catch (error) {
    console.error("Failed to save data to JSONBin:", error);
    throw new Error("Failed to save data");
  }
}

// Initialize database connection (no longer needed for JSONBin, but kept for compatibility)
export async function initDB() {
  try {
    // JSONBin doesn't require initialization, but we can test connectivity
    await getData();
  } catch (error) {
    console.error("Failed to initialize JSONBin connection:", error);
    throw new Error("JSONBin connection failed");
  }
}

// Get all patients
export async function getPatients(): Promise<Patient[]> {
  try {
    const data = await getData();
    return data.patients || [];
  } catch (error) {
    console.error("Failed to get patients:", error);
    throw new Error("Failed to retrieve patients");
  }
}

// Add a new patient
export async function addPatient(patient: Patient): Promise<Patient> {
  try {
    // Validate required fields
    if (!patient.id || !patient.firstName || !patient.lastName) {
      throw new Error("Missing required patient fields");
    }

    const data = await getData();

    // Check if patient already exists
    const existingPatient = data.patients.find((p) => p.id === patient.id);
    if (existingPatient) {
      throw new Error("Patient with this ID already exists");
    }

    data.patients.push(patient);
    await saveData(data);

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

    const data = await getData();
    const patientIndex = data.patients.findIndex((p) => p.id === id);

    if (patientIndex === -1) {
      throw new Error("Patient not found");
    }

    data.patients[patientIndex] = {
      ...data.patients[patientIndex],
      ...updates,
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);

    return data.patients[patientIndex];
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

    const data = await getData();
    const initialLength = data.patients.length;

    data.patients = data.patients.filter((p) => p.id !== id);

    const deleted = data.patients.length < initialLength;

    if (deleted) {
      await saveData(data);
      // Revalidate relevant pages
      revalidatePath("/patients");
    }

    return deleted;
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

    const data = await getData();
    return data.patients.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Failed to get patient by ID:", error);
    throw new Error("Failed to retrieve patient");
  }
}

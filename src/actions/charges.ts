/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Charge, ChargeStatus, Payment } from "@/types/charge";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  charges: Charge[];
}

// JSONBin API configuration
const CHARGES_BIN_URL = jsonbin.CHARGES;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(CHARGES_BIN_URL, "GET");
    return response.record || { charges: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { charges: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(CHARGES_BIN_URL, "PUT", data);
  } catch (error) {
    console.error("Failed to save data to JSONBin:", error);
    throw new Error("Failed to save data");
  }
}

// Initialize database connection (no longer needed for JSONBin, but kept for compatibility)
export async function initChargesDB() {
  try {
    // JSONBin doesn't require initialization, but we can test connectivity
    await getData();
  } catch (error) {
    console.error("Failed to initialize JSONBin connection:", error);
    throw new Error("JSONBin connection failed");
  }
}

// Get all charges
export async function getCharges(): Promise<Charge[]> {
  try {
    const data = await getData();
    return data.charges || [];
  } catch (error) {
    console.error("Failed to get charges:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Get charges by patient ID
export async function getChargesByPatientId(
  patientId: string
): Promise<Charge[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const data = await getData();
    return (
      data.charges.filter((charge) => charge.patient.id === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get charges by patient ID:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Add a new charge
export async function addCharge(charge: Charge): Promise<Charge> {
  try {
    // Validate required fields
    if (!charge.id || !charge.description || !charge.patient?.id) {
      throw new Error("Missing required charge fields");
    }

    const data = await getData();

    // Check if charge already exists
    const existingCharge = data.charges.find(
      (existingCharge) => existingCharge.id === charge.id
    );
    if (existingCharge) {
      throw new Error("Charge with this ID already exists");
    }

    data.charges.push(charge);
    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/charges");
    revalidatePath("/payments");
    revalidatePath(`/patients/${charge.patient.id}`);

    return charge;
  } catch (error) {
    console.error("Failed to add charge:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add charge"
    );
  }
}

// Update a charge
export async function updateCharge(
  id: string,
  updates: Partial<Charge>
): Promise<Charge | null> {
  try {
    if (!id) {
      throw new Error("Charge ID is required");
    }

    const data = await getData();
    const chargeIndex = data.charges.findIndex((charge) => charge.id === id);

    if (chargeIndex === -1) {
      throw new Error("Charge not found");
    }

    data.charges[chargeIndex] = {
      ...data.charges[chargeIndex],
      ...updates,
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/charges");
    revalidatePath("/payments");
    revalidatePath(`/charges/${id}`);
    if (data.charges[chargeIndex].patient?.id) {
      revalidatePath(`/patients/${data.charges[chargeIndex].patient.id}`);
    }

    return data.charges[chargeIndex];
  } catch (error) {
    console.error("Failed to update charge:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update charge"
    );
  }
}

// Delete a charge
export async function deleteCharge(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Charge ID is required");
    }

    const data = await getData();
    const initialLength = data.charges.length;
    const chargeToDelete = data.charges.find((charge) => charge.id === id);

    data.charges = data.charges.filter((charge) => charge.id !== id);

    const deleted = data.charges.length < initialLength;

    if (deleted) {
      await saveData(data);
      // Revalidate relevant pages
      revalidatePath("/charges");
      revalidatePath("/payments");
      if (chargeToDelete?.patient?.id) {
        revalidatePath(`/patients/${chargeToDelete.patient.id}`);
      }
    }

    return deleted;
  } catch (error) {
    console.error("Failed to delete charge:", error);
    throw new Error("Failed to delete charge");
  }
}

// Get a charge by ID
export async function getChargeById(id: string): Promise<Charge | null> {
  try {
    if (!id) {
      throw new Error("Charge ID is required");
    }

    const data = await getData();
    return data.charges.find((charge) => charge.id === id) || null;
  } catch (error) {
    console.error("Failed to get charge by ID:", error);
    throw new Error("Failed to retrieve charge");
  }
}

// Get charges by status
export async function getChargesByStatus(status: string): Promise<Charge[]> {
  try {
    if (!status) {
      throw new Error("Status is required");
    }

    const data = await getData();
    return data.charges.filter((charge) => charge.status === status) || [];
  } catch (error) {
    console.error("Failed to get charges by status:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Get outstanding charges (unpaid or partially paid)
export async function getOutstandingCharges(): Promise<Charge[]> {
  try {
    const data = await getData();
    return data.charges.filter((charge) => charge.totalOutstanding > 0) || [];
  } catch (error) {
    console.error("Failed to get outstanding charges:", error);
    throw new Error("Failed to retrieve outstanding charges");
  }
}

// Get charges by creator
export async function getChargesByCreator(
  creatorId: string
): Promise<Charge[]> {
  try {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    const data = await getData();
    return (
      data.charges.filter((charge) => charge.creator.id === creatorId) || []
    );
  } catch (error) {
    console.error("Failed to get charges by creator:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Get charges by location
export async function getChargesByLocation(
  locationId: string
): Promise<Charge[]> {
  try {
    if (!locationId) {
      throw new Error("Location ID is required");
    }

    const data = await getData();
    return (
      data.charges.filter((charge) => charge.locationId === locationId) || []
    );
  } catch (error) {
    console.error("Failed to get charges by location:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Add payment to a charge
export async function addPaymentToCharge(
  chargeId: string,
  payment: Payment
): Promise<Charge | null> {
  try {
    if (!chargeId || !payment) {
      throw new Error("Charge ID and payment data are required");
    }

    const data = await getData();
    const chargeIndex = data.charges.findIndex(
      (charge) => charge.id === chargeId
    );

    if (chargeIndex === -1) {
      throw new Error("Charge not found");
    }

    data.charges[chargeIndex].payments.push(payment);

    // Recalculate outstanding amount
    const totalPaid = data.charges[chargeIndex].payments.reduce(
      (sum, pmt) => sum + pmt.amount,
      0
    );
    const totalAdjustments = data.charges[chargeIndex].adjustments.reduce(
      (sum, adj) => sum + adj.amount,
      0
    );
    data.charges[chargeIndex].totalOutstanding = Math.max(
      0,
      data.charges[chargeIndex].total - totalAdjustments - totalPaid
    );

    // Update status based on outstanding amount
    if (data.charges[chargeIndex].totalOutstanding === 0) {
      data.charges[chargeIndex].status = ChargeStatus.PAID;
    } else if (totalPaid > 0) {
      data.charges[chargeIndex].status = ChargeStatus.PARTIALLY_PAID;
    }

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/charges");
    revalidatePath("/payments");
    revalidatePath(`/charges/${chargeId}`);

    return data.charges[chargeIndex];
  } catch (error) {
    console.error("Failed to add payment to charge:", error);
    throw new Error("Failed to add payment to charge");
  }
}

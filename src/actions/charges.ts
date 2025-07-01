"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { Charge, ChargeStatus, Payment } from "@/types/charge";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  charges: Charge[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "charges.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { charges: [] });

// Initialize database connection
export async function initChargesDB() {
  try {
    await db.read();

    // Initialize with empty charges array if file doesn't exist
    if (!db.data) {
      db.data = { charges: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize charges database:", error);
    throw new Error("Charges database initialization failed");
  }
}

// Get all charges
export async function getCharges(): Promise<Charge[]> {
  try {
    await db.read();
    return db.data?.charges || [];
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

    await db.read();
    return (
      db.data?.charges.filter((charge) => charge.patient.id === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get charges by patient ID:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Add a new charge
export async function addCharge(charge: Charge): Promise<Charge> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { charges: [] };
    }

    // Validate required fields
    if (!charge.id || !charge.description || !charge.patient?.id) {
      throw new Error("Missing required charge fields");
    }

    // Check if charge already exists
    const existingCharge = db.data.charges.find(
      (existingCharge) => existingCharge.id === charge.id
    );
    if (existingCharge) {
      throw new Error("Charge with this ID already exists");
    }

    db.data.charges.push(charge);
    await db.write();

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

    await db.read();
    const chargeIndex =
      db.data?.charges.findIndex((charge) => charge.id === id) ?? -1;

    if (chargeIndex === -1) {
      throw new Error("Charge not found");
    }

    if (db.data?.charges[chargeIndex]) {
      db.data.charges[chargeIndex] = {
        ...db.data.charges[chargeIndex],
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/charges");
      revalidatePath("/payments");
      revalidatePath(`/charges/${id}`);
      if (db.data.charges[chargeIndex].patient?.id) {
        revalidatePath(`/patients/${db.data.charges[chargeIndex].patient.id}`);
      }

      return db.data.charges[chargeIndex];
    }

    return null;
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

    await db.read();
    const initialLength = db.data?.charges.length || 0;

    if (db.data?.charges) {
      const chargeToDelete = db.data.charges.find((charge) => charge.id === id);
      db.data.charges = db.data.charges.filter((charge) => charge.id !== id);
      await db.write();

      const deleted = db.data.charges.length < initialLength;

      if (deleted) {
        // Revalidate relevant pages
        revalidatePath("/charges");
        revalidatePath("/payments");
        if (chargeToDelete?.patient?.id) {
          revalidatePath(`/patients/${chargeToDelete.patient.id}`);
        }
      }

      return deleted;
    }

    return false;
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

    await db.read();
    return db.data?.charges.find((charge) => charge.id === id) || null;
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

    await db.read();
    return db.data?.charges.filter((charge) => charge.status === status) || [];
  } catch (error) {
    console.error("Failed to get charges by status:", error);
    throw new Error("Failed to retrieve charges");
  }
}

// Get outstanding charges (unpaid or partially paid)
export async function getOutstandingCharges(): Promise<Charge[]> {
  try {
    await db.read();
    return (
      db.data?.charges.filter((charge) => charge.totalOutstanding > 0) || []
    );
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

    await db.read();
    return (
      db.data?.charges.filter((charge) => charge.creator.id === creatorId) || []
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

    await db.read();
    return (
      db.data?.charges.filter((charge) => charge.locationId === locationId) ||
      []
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

    await db.read();
    const chargeIndex =
      db.data?.charges.findIndex((charge) => charge.id === chargeId) ?? -1;

    if (chargeIndex === -1) {
      throw new Error("Charge not found");
    }

    if (db.data?.charges[chargeIndex]) {
      db.data.charges[chargeIndex].payments.push(payment);

      // Recalculate outstanding amount
      const totalPaid = db.data.charges[chargeIndex].payments.reduce(
        (sum, pmt) => sum + pmt.amount,
        0
      );
      const totalAdjustments = db.data.charges[chargeIndex].adjustments.reduce(
        (sum, adj) => sum + adj.amount,
        0
      );
      db.data.charges[chargeIndex].totalOutstanding = Math.max(
        0,
        db.data.charges[chargeIndex].total - totalAdjustments - totalPaid
      );

      // Update status based on outstanding amount
      if (db.data.charges[chargeIndex].totalOutstanding === 0) {
        db.data.charges[chargeIndex].status = ChargeStatus.PAID;
      } else if (totalPaid > 0) {
        db.data.charges[chargeIndex].status = ChargeStatus.PARTIALLY_PAID;
      }

      await db.write();

      // Revalidate relevant pages
      revalidatePath("/charges");
      revalidatePath("/payments");
      revalidatePath(`/charges/${chargeId}`);

      return db.data.charges[chargeIndex];
    }

    return null;
  } catch (error) {
    console.error("Failed to add payment to charge:", error);
    throw new Error("Failed to add payment to charge");
  }
}

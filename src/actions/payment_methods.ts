"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@/types/paymentMethods";

// Database structure
interface Database {
  payment_methods: PaymentMethod[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "payment_methods.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { payment_methods: [] });

// Initialize database connection
export async function initPaymentMethodsDB() {
  try {
    await db.read();

    // Initialize with empty payment_methods array if file doesn't exist
    if (!db.data) {
      db.data = { payment_methods: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize payment methods database:", error);
    throw new Error("Payment methods database initialization failed");
  }
}

// Get all payment methods
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    await db.read();
    return db.data?.payment_methods || [];
  } catch (error) {
    console.error("Failed to get payment methods:", error);
    throw new Error("Failed to retrieve payment methods");
  }
}

// Get payment methods for a specific patient
export async function getPaymentMethodsByPatientId(
  patientId: string
): Promise<PaymentMethod[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    return (
      db.data?.payment_methods.filter((pm) => pm.patientId === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get payment methods by patient ID:", error);
    throw new Error("Failed to retrieve patient payment methods");
  }
}

// Add a new payment method
export async function addPaymentMethod(
  paymentMethod: PaymentMethod
): Promise<PaymentMethod> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { payment_methods: [] };
    }

    // Validate required fields
    if (
      !paymentMethod.id ||
      !paymentMethod.patientId ||
      !paymentMethod.type ||
      !paymentMethod.description
    ) {
      throw new Error("Missing required payment method fields");
    }

    // Check if payment method already exists
    const existingPaymentMethod = db.data.payment_methods.find(
      (pm) => pm.id === paymentMethod.id
    );
    if (existingPaymentMethod) {
      throw new Error("Payment method with this ID already exists");
    }

    // If this is set as default, unset other default payment methods for this patient
    if (paymentMethod.isDefault) {
      db.data.payment_methods = db.data.payment_methods.map((pm) =>
        pm.patientId === paymentMethod.patientId
          ? { ...pm, isDefault: false }
          : pm
      );
    }

    db.data.payment_methods.push(paymentMethod);
    await db.write();

    // Revalidate relevant pages
    revalidatePath("/payments");
    revalidatePath("/payment-methods");
    revalidatePath(`/patients/${paymentMethod.patientId}`);

    return paymentMethod;
  } catch (error) {
    console.error("Failed to add payment method:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add payment method"
    );
  }
}

// Update a payment method
export async function updatePaymentMethod(
  id: string,
  updates: Partial<PaymentMethod>
): Promise<PaymentMethod | null> {
  try {
    if (!id) {
      throw new Error("Payment method ID is required");
    }

    await db.read();
    const paymentMethodIndex =
      db.data?.payment_methods.findIndex((pm) => pm.id === id) ?? -1;

    if (paymentMethodIndex === -1) {
      throw new Error("Payment method not found");
    }

    if (db.data?.payment_methods[paymentMethodIndex]) {
      const currentPaymentMethod = db.data.payment_methods[paymentMethodIndex];

      // If updating to default, unset other default payment methods for this patient
      if (updates.isDefault === true) {
        db.data.payment_methods = db.data.payment_methods.map((pm) =>
          pm.patientId === currentPaymentMethod.patientId && pm.id !== id
            ? { ...pm, isDefault: false }
            : pm
        );
      }

      db.data.payment_methods[paymentMethodIndex] = {
        ...currentPaymentMethod,
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/payments");
      revalidatePath("/payment-methods");
      revalidatePath(`/patients/${currentPaymentMethod.patientId}`);

      return db.data.payment_methods[paymentMethodIndex];
    }

    return null;
  } catch (error) {
    console.error("Failed to update payment method:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update payment method"
    );
  }
}

// Delete a payment method
export async function deletePaymentMethod(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Payment method ID is required");
    }

    await db.read();
    const initialLength = db.data?.payment_methods.length || 0;
    const paymentMethodToDelete = db.data?.payment_methods.find(
      (pm) => pm.id === id
    );

    if (db.data?.payment_methods) {
      db.data.payment_methods = db.data.payment_methods.filter(
        (pm) => pm.id !== id
      );
      await db.write();

      const deleted = db.data.payment_methods.length < initialLength;

      if (deleted && paymentMethodToDelete) {
        // Revalidate relevant pages
        revalidatePath("/payments");
        revalidatePath("/payment-methods");
        revalidatePath(`/patients/${paymentMethodToDelete.patientId}`);
      }

      return deleted;
    }

    return false;
  } catch (error) {
    console.error("Failed to delete payment method:", error);
    throw new Error("Failed to delete payment method");
  }
}

// Get a payment method by ID
export async function getPaymentMethodById(
  id: string
): Promise<PaymentMethod | null> {
  try {
    if (!id) {
      throw new Error("Payment method ID is required");
    }

    await db.read();
    return db.data?.payment_methods.find((pm) => pm.id === id) || null;
  } catch (error) {
    console.error("Failed to get payment method by ID:", error);
    throw new Error("Failed to retrieve payment method");
  }
}

// Get default payment method for a patient
export async function getDefaultPaymentMethod(
  patientId: string
): Promise<PaymentMethod | null> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    return (
      db.data?.payment_methods.find(
        (pm) => pm.patientId === patientId && pm.isDefault
      ) || null
    );
  } catch (error) {
    console.error("Failed to get default payment method:", error);
    throw new Error("Failed to retrieve default payment method");
  }
}

// Set a payment method as default for a patient
export async function setDefaultPaymentMethod(
  id: string
): Promise<PaymentMethod | null> {
  try {
    if (!id) {
      throw new Error("Payment method ID is required");
    }

    await db.read();
    const paymentMethod = db.data?.payment_methods.find((pm) => pm.id === id);

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Unset all default payment methods for this patient
    if (db.data?.payment_methods) {
      db.data.payment_methods = db.data.payment_methods.map((pm) =>
        pm.patientId === paymentMethod.patientId
          ? { ...pm, isDefault: pm.id === id }
          : pm
      );
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/payments");
      revalidatePath("/payment-methods");
      revalidatePath(`/patients/${paymentMethod.patientId}`);

      return db.data.payment_methods.find((pm) => pm.id === id) || null;
    }

    return null;
  } catch (error) {
    console.error("Failed to set default payment method:", error);
    throw new Error("Failed to set default payment method");
  }
}

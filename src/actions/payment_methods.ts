"use server";

import { PaymentMethod } from "@/types/paymentMethods";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  payment_methods: PaymentMethod[];
}

// JSONBin API configuration
const PAYMENT_METHODS_BIN_URL = jsonbin.PAYMENT_METHODS;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(PAYMENT_METHODS_BIN_URL, "GET");
    return response.record || { payment_methods: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { payment_methods: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(PAYMENT_METHODS_BIN_URL, "PUT", data);
  } catch (error) {
    console.error("Failed to save data to JSONBin:", error);
    throw new Error("Failed to save data");
  }
}

// Initialize database connection (no longer needed for JSONBin, but kept for compatibility)
export async function initPaymentMethodsDB() {
  try {
    // JSONBin doesn't require initialization, but we can test connectivity
    await getData();
  } catch (error) {
    console.error("Failed to initialize JSONBin connection:", error);
    throw new Error("JSONBin connection failed");
  }
}

// Get all payment methods
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const data = await getData();
    return data.payment_methods || [];
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

    const data = await getData();
    return (
      data.payment_methods.filter((pm) => pm.patientId === patientId) || []
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
    const data = await getData();

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
    const existingPaymentMethod = data.payment_methods.find(
      (pm) => pm.id === paymentMethod.id
    );
    if (existingPaymentMethod) {
      throw new Error("Payment method with this ID already exists");
    }

    // If this is set as default, unset other default payment methods for this patient
    if (paymentMethod.isDefault) {
      data.payment_methods = data.payment_methods.map((pm) =>
        pm.patientId === paymentMethod.patientId
          ? { ...pm, isDefault: false }
          : pm
      );
    }

    data.payment_methods.push(paymentMethod);
    await saveData(data);

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

    const data = await getData();
    const paymentMethodIndex = data.payment_methods.findIndex(
      (pm) => pm.id === id
    );

    if (paymentMethodIndex === -1) {
      throw new Error("Payment method not found");
    }

    const currentPaymentMethod = data.payment_methods[paymentMethodIndex];

    // If updating to default, unset other default payment methods for this patient
    if (updates.isDefault === true) {
      data.payment_methods = data.payment_methods.map((pm) =>
        pm.patientId === currentPaymentMethod.patientId && pm.id !== id
          ? { ...pm, isDefault: false }
          : pm
      );
    }

    data.payment_methods[paymentMethodIndex] = {
      ...currentPaymentMethod,
      ...updates,
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/payments");
    revalidatePath("/payment-methods");
    revalidatePath(`/patients/${currentPaymentMethod.patientId}`);

    return data.payment_methods[paymentMethodIndex];
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

    const data = await getData();
    const initialLength = data.payment_methods.length;
    const paymentMethodToDelete = data.payment_methods.find(
      (pm) => pm.id === id
    );

    data.payment_methods = data.payment_methods.filter((pm) => pm.id !== id);

    const deleted = data.payment_methods.length < initialLength;

    if (deleted) {
      await saveData(data);

      if (paymentMethodToDelete) {
        // Revalidate relevant pages
        revalidatePath("/payments");
        revalidatePath("/payment-methods");
        revalidatePath(`/patients/${paymentMethodToDelete.patientId}`);
      }
    }

    return deleted;
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

    const data = await getData();
    return data.payment_methods.find((pm) => pm.id === id) || null;
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

    const data = await getData();
    return (
      data.payment_methods.find(
        (pm) => pm.patientId === patientId && pm.isDefault
      ) || null
    );
  } catch (error) {
    console.error("Failed to get default payment method:", error);
    throw new Error("Failed to retrieve default payment method");
  }
}

// Set a payment method as default
export async function setDefaultPaymentMethod(
  id: string
): Promise<PaymentMethod | null> {
  try {
    if (!id) {
      throw new Error("Payment method ID is required");
    }

    const data = await getData();
    const paymentMethodIndex = data.payment_methods.findIndex(
      (pm) => pm.id === id
    );

    if (paymentMethodIndex === -1) {
      throw new Error("Payment method not found");
    }

    const currentPaymentMethod = data.payment_methods[paymentMethodIndex];

    // Unset other default payment methods for this patient
    data.payment_methods = data.payment_methods.map((pm) =>
      pm.patientId === currentPaymentMethod.patientId
        ? { ...pm, isDefault: pm.id === id }
        : pm
    );

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/payments");
    revalidatePath("/payment-methods");
    revalidatePath(`/patients/${currentPaymentMethod.patientId}`);

    return data.payment_methods[paymentMethodIndex];
  } catch (error) {
    console.error("Failed to set default payment method:", error);
    throw new Error("Failed to set default payment method");
  }
}

// Get payment methods by type
export async function getPaymentMethodsByType(
  type: string
): Promise<PaymentMethod[]> {
  try {
    if (!type) {
      throw new Error("Payment method type is required");
    }

    const data = await getData();
    return data.payment_methods.filter((pm) => pm.type === type) || [];
  } catch (error) {
    console.error("Failed to get payment methods by type:", error);
    throw new Error("Failed to retrieve payment methods by type");
  }
}

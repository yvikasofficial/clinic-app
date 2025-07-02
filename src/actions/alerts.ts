"use server";

import { Alert, AlertType } from "@/types/alert";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  alerts: Alert[];
}

// JSONBin API configuration
const ALERTS_BIN_URL = jsonbin.ALERTS;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(ALERTS_BIN_URL, "GET");
    return response.record || { alerts: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { alerts: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(ALERTS_BIN_URL, "PUT", data);
  } catch (error) {
    console.error("Failed to save data to JSONBin:", error);
    throw new Error("Failed to save data");
  }
}

// Initialize database connection (no longer needed for JSONBin, but kept for compatibility)
export async function initAlertsDB() {
  try {
    // JSONBin doesn't require initialization, but we can test connectivity
    await getData();
  } catch (error) {
    console.error("Failed to initialize JSONBin connection:", error);
    throw new Error("JSONBin connection failed");
  }
}

// Get all alerts
export async function getAlerts(): Promise<Alert[]> {
  try {
    const data = await getData();
    return data.alerts || [];
  } catch (error) {
    console.error("Failed to get alerts:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Get alerts by patient ID
export async function getAlertsByPatientId(
  patientId: string
): Promise<Alert[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const data = await getData();
    return data.alerts.filter((alert) => alert.patient.id === patientId) || [];
  } catch (error) {
    console.error("Failed to get alerts by patient ID:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Add a new alert
export async function addAlert(alert: Alert): Promise<Alert> {
  try {
    const data = await getData();

    // Validate required fields
    if (!alert.id || !alert.type || !alert.patient?.id) {
      throw new Error("Missing required alert fields");
    }

    // Check if alert already exists
    const existingAlert = data.alerts.find(
      (existingAlert) => existingAlert.id === alert.id
    );
    if (existingAlert) {
      throw new Error("Alert with this ID already exists");
    }

    data.alerts.push(alert);
    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/alerts");
    revalidatePath(`/patients/${alert.patient.id}`);

    return alert;
  } catch (error) {
    console.error("Failed to add alert:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add alert"
    );
  }
}

// Update an alert
export async function updateAlert(
  id: string,
  updates: Partial<Alert>
): Promise<Alert | null> {
  try {
    if (!id) {
      throw new Error("Alert ID is required");
    }

    const data = await getData();
    const alertIndex = data.alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    data.alerts[alertIndex] = {
      ...data.alerts[alertIndex],
      ...updates,
    };
    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/alerts");
    revalidatePath(`/alerts/${id}`);
    if (data.alerts[alertIndex].patient?.id) {
      revalidatePath(`/patients/${data.alerts[alertIndex].patient.id}`);
    }

    return data.alerts[alertIndex];
  } catch (error) {
    console.error("Failed to update alert:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update alert"
    );
  }
}

// Delete an alert
export async function deleteAlert(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Alert ID is required");
    }

    const data = await getData();
    const initialLength = data.alerts.length;
    const alertToDelete = data.alerts.find((alert) => alert.id === id);

    data.alerts = data.alerts.filter((alert) => alert.id !== id);
    const deleted = data.alerts.length < initialLength;

    if (deleted) {
      await saveData(data);

      // Revalidate relevant pages
      revalidatePath("/alerts");
      if (alertToDelete?.patient?.id) {
        revalidatePath(`/patients/${alertToDelete.patient.id}`);
      }
    }

    return deleted;
  } catch (error) {
    console.error("Failed to delete alert:", error);
    throw new Error("Failed to delete alert");
  }
}

// Get an alert by ID
export async function getAlertById(id: string): Promise<Alert | null> {
  try {
    if (!id) {
      throw new Error("Alert ID is required");
    }

    const data = await getData();
    return data.alerts.find((alert) => alert.id === id) || null;
  } catch (error) {
    console.error("Failed to get alert by ID:", error);
    throw new Error("Failed to retrieve alert");
  }
}

// Get alerts by type
export async function getAlertsByType(type: AlertType): Promise<Alert[]> {
  try {
    if (!type) {
      throw new Error("Alert type is required");
    }

    const data = await getData();
    return data.alerts.filter((alert) => alert.type === type) || [];
  } catch (error) {
    console.error("Failed to get alerts by type:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Get alerts requiring action
export async function getAlertsRequiringAction(): Promise<Alert[]> {
  try {
    const data = await getData();
    return (
      data.alerts.filter(
        (alert) => alert.actionRequired && !alert.resolvedDate
      ) || []
    );
  } catch (error) {
    console.error("Failed to get alerts requiring action:", error);
    throw new Error("Failed to retrieve alerts requiring action");
  }
}

// Get resolved alerts
export async function getResolvedAlerts(): Promise<Alert[]> {
  try {
    const data = await getData();
    return data.alerts.filter((alert) => alert.resolvedDate !== null) || [];
  } catch (error) {
    console.error("Failed to get resolved alerts:", error);
    throw new Error("Failed to retrieve resolved alerts");
  }
}

// Get alerts by assigned provider
export async function getAlertsByAssignedProvider(
  providerId: string
): Promise<Alert[]> {
  try {
    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    const data = await getData();
    return (
      data.alerts.filter((alert) => alert.assignedProvider.id === providerId) ||
      []
    );
  } catch (error) {
    console.error("Failed to get alerts by assigned provider:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Get alerts by tag
export async function getAlertsByTag(tagName: string): Promise<Alert[]> {
  try {
    if (!tagName) {
      throw new Error("Tag name is required");
    }

    const data = await getData();
    return (
      data.alerts.filter((alert) =>
        alert.tags.some((tag) => tag.name === tagName)
      ) || []
    );
  } catch (error) {
    console.error("Failed to get alerts by tag:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Resolve an alert
export async function resolveAlert(
  id: string,
  resolvingProviderId: string
): Promise<Alert | null> {
  try {
    if (!id || !resolvingProviderId) {
      throw new Error("Alert ID and resolving provider ID are required");
    }

    const data = await getData();
    const alertIndex = data.alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    // Find the resolving provider from the existing providers or use assigned provider structure
    const resolvingProvider =
      data.alerts[alertIndex].assignedProvider.id === resolvingProviderId
        ? data.alerts[alertIndex].assignedProvider
        : data.alerts[alertIndex].assignedProvider; // In a real app, you'd fetch the provider by ID

    data.alerts[alertIndex] = {
      ...data.alerts[alertIndex],
      resolvedDate: new Date().toISOString(),
      resolvingProvider: resolvingProvider,
      actionRequired: false,
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/alerts");
    revalidatePath(`/alerts/${id}`);

    return data.alerts[alertIndex];
  } catch (error) {
    console.error("Failed to resolve alert:", error);
    throw new Error("Failed to resolve alert");
  }
}

// Reopen an alert (unresolve)
export async function reopenAlert(id: string): Promise<Alert | null> {
  try {
    if (!id) {
      throw new Error("Alert ID is required");
    }

    const data = await getData();
    const alertIndex = data.alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    data.alerts[alertIndex] = {
      ...data.alerts[alertIndex],
      resolvedDate: null,
      resolvingProvider: null,
      actionRequired: true,
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/alerts");
    revalidatePath(`/alerts/${id}`);

    return data.alerts[alertIndex];
  } catch (error) {
    console.error("Failed to reopen alert:", error);
    throw new Error("Failed to reopen alert");
  }
}

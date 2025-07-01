"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { Alert, AlertType } from "@/types/alert";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  alerts: Alert[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "alerts.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { alerts: [] });

// Initialize database connection
export async function initAlertsDB() {
  try {
    await db.read();

    // Initialize with empty alerts array if file doesn't exist
    if (!db.data) {
      db.data = { alerts: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize alerts database:", error);
    throw new Error("Alerts database initialization failed");
  }
}

// Get all alerts
export async function getAlerts(): Promise<Alert[]> {
  try {
    await db.read();
    return db.data?.alerts || [];
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

    await db.read();
    return (
      db.data?.alerts.filter((alert) => alert.patient.id === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get alerts by patient ID:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Add a new alert
export async function addAlert(alert: Alert): Promise<Alert> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { alerts: [] };
    }

    // Validate required fields
    if (!alert.id || !alert.type || !alert.patient?.id) {
      throw new Error("Missing required alert fields");
    }

    // Check if alert already exists
    const existingAlert = db.data.alerts.find(
      (existingAlert) => existingAlert.id === alert.id
    );
    if (existingAlert) {
      throw new Error("Alert with this ID already exists");
    }

    db.data.alerts.push(alert);
    await db.write();

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

    await db.read();
    const alertIndex =
      db.data?.alerts.findIndex((alert) => alert.id === id) ?? -1;

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    if (db.data?.alerts[alertIndex]) {
      db.data.alerts[alertIndex] = {
        ...db.data.alerts[alertIndex],
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/alerts");
      revalidatePath(`/alerts/${id}`);
      if (db.data.alerts[alertIndex].patient?.id) {
        revalidatePath(`/patients/${db.data.alerts[alertIndex].patient.id}`);
      }

      return db.data.alerts[alertIndex];
    }

    return null;
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

    await db.read();
    const initialLength = db.data?.alerts.length || 0;

    if (db.data?.alerts) {
      const alertToDelete = db.data.alerts.find((alert) => alert.id === id);
      db.data.alerts = db.data.alerts.filter((alert) => alert.id !== id);
      await db.write();

      const deleted = db.data.alerts.length < initialLength;

      if (deleted) {
        // Revalidate relevant pages
        revalidatePath("/alerts");
        if (alertToDelete?.patient?.id) {
          revalidatePath(`/patients/${alertToDelete.patient.id}`);
        }
      }

      return deleted;
    }

    return false;
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

    await db.read();
    return db.data?.alerts.find((alert) => alert.id === id) || null;
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

    await db.read();
    return db.data?.alerts.filter((alert) => alert.type === type) || [];
  } catch (error) {
    console.error("Failed to get alerts by type:", error);
    throw new Error("Failed to retrieve alerts");
  }
}

// Get alerts requiring action
export async function getAlertsRequiringAction(): Promise<Alert[]> {
  try {
    await db.read();
    return (
      db.data?.alerts.filter(
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
    await db.read();
    return db.data?.alerts.filter((alert) => alert.resolvedDate !== null) || [];
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

    await db.read();
    return (
      db.data?.alerts.filter(
        (alert) => alert.assignedProvider.id === providerId
      ) || []
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

    await db.read();
    return (
      db.data?.alerts.filter((alert) =>
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

    await db.read();
    const alertIndex =
      db.data?.alerts.findIndex((alert) => alert.id === id) ?? -1;

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    if (db.data?.alerts[alertIndex]) {
      // Find the resolving provider from the existing providers or use assigned provider structure
      const resolvingProvider =
        db.data.alerts[alertIndex].assignedProvider.id === resolvingProviderId
          ? db.data.alerts[alertIndex].assignedProvider
          : db.data.alerts[alertIndex].assignedProvider; // In a real app, you'd fetch the provider by ID

      db.data.alerts[alertIndex] = {
        ...db.data.alerts[alertIndex],
        resolvedDate: new Date().toISOString(),
        resolvingProvider: resolvingProvider,
        actionRequired: false,
      };

      await db.write();

      // Revalidate relevant pages
      revalidatePath("/alerts");
      revalidatePath(`/alerts/${id}`);

      return db.data.alerts[alertIndex];
    }

    return null;
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

    await db.read();
    const alertIndex =
      db.data?.alerts.findIndex((alert) => alert.id === id) ?? -1;

    if (alertIndex === -1) {
      throw new Error("Alert not found");
    }

    if (db.data?.alerts[alertIndex]) {
      db.data.alerts[alertIndex] = {
        ...db.data.alerts[alertIndex],
        resolvedDate: null,
        resolvingProvider: null,
        actionRequired: true,
      };

      await db.write();

      // Revalidate relevant pages
      revalidatePath("/alerts");
      revalidatePath(`/alerts/${id}`);

      return db.data.alerts[alertIndex];
    }

    return null;
  } catch (error) {
    console.error("Failed to reopen alert:", error);
    throw new Error("Failed to reopen alert");
  }
}

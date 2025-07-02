"use server";

import { Event } from "@/types/event";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";

// JSONBin configuration
const JSONBIN_EVENTS_URL = jsonbin.EVENTS;

// Database structure
interface Database {
  events: Event[];
}

// Helper function to make JSONBin API requests
async function makeJSONBinRequest(
  method: "GET" | "PUT",
  data?: Database
): Promise<Database> {
  if (!JSONBIN_EVENTS_URL) {
    throw new Error("JSONBin Events URL must be configured");
  }

  const headers: Record<string, string> = {};

  if (method === "PUT") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(JSONBIN_EVENTS_URL, {
    method,
    headers,
    body: method === "PUT" ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `JSONBin API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // JSONBin returns data in a nested structure for GET requests
  if (method === "GET") {
    return result.record || { events: [] };
  }

  return result;
}

// Initialize database connection
export async function initDB() {
  try {
    // Try to read existing data, if bin doesn't exist, create it with empty events
    try {
      await makeJSONBinRequest("GET");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // If bin doesn't exist or is empty, initialize with empty events array
      await makeJSONBinRequest("PUT", { events: [] });
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  try {
    const data = await makeJSONBinRequest("GET");
    return data.events || [];
  } catch (error) {
    console.error("Failed to get events:", error);
    throw new Error("Failed to retrieve events");
  }
}

// Add a new event
export async function addEvent(event: Event): Promise<Event> {
  try {
    // Validate required fields
    if (!event.id || !event.title || !event.start || !event.end) {
      throw new Error("Missing required event fields");
    }

    // Get current data
    const data = await makeJSONBinRequest("GET");

    // Check if event already exists
    const existingEvent = data.events.find((e) => e.id === event.id);
    if (existingEvent) {
      throw new Error("Event with this ID already exists");
    }

    // Add new event
    data.events.push(event);

    // Save updated data
    await makeJSONBinRequest("PUT", data);

    // Revalidate relevant pages
    revalidatePath("/events");

    return event;
  } catch (error) {
    console.error("Failed to add event:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add event"
    );
  }
}

// Update an event
export async function updateEvent(
  id: string,
  updates: Partial<Event>
): Promise<Event | null> {
  try {
    if (!id) {
      throw new Error("Event ID is required");
    }

    // Get current data
    const data = await makeJSONBinRequest("GET");
    const eventIndex = data.events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    // Update the event
    data.events[eventIndex] = {
      ...data.events[eventIndex],
      ...updates,
    };

    // Save updated data
    await makeJSONBinRequest("PUT", data);

    // Revalidate relevant pages
    revalidatePath("/events");
    revalidatePath(`/events/${id}`);

    return data.events[eventIndex];
  } catch (error) {
    console.error("Failed to update event:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update event"
    );
  }
}

// Delete an event
export async function deleteEvent(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Event ID is required");
    }

    // Get current data
    const data = await makeJSONBinRequest("GET");
    const initialLength = data.events.length;

    // Filter out the event to delete
    data.events = data.events.filter((e) => e.id !== id);

    const deleted = data.events.length < initialLength;

    if (deleted) {
      // Save updated data
      await makeJSONBinRequest("PUT", data);

      // Revalidate relevant pages
      revalidatePath("/events");
    }

    return deleted;
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw new Error("Failed to delete event");
  }
}

// Get an event by ID
export async function getEventById(id: string): Promise<Event | null> {
  try {
    if (!id) {
      throw new Error("Event ID is required");
    }

    const data = await makeJSONBinRequest("GET");
    return data.events.find((e) => e.id === id) || null;
  } catch (error) {
    console.error("Failed to get event by ID:", error);
    throw new Error("Failed to retrieve event");
  }
}

// Get events by patient ID
export async function getEventsByPatientId(
  patientId: string
): Promise<Event[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    const data = await makeJSONBinRequest("GET");
    return (
      data.events.filter((e) => e.appointment?.patientId === patientId) || []
    );
  } catch (error) {
    console.error("Failed to get events by patient ID:", error);
    throw new Error("Failed to retrieve patient events");
  }
}

// Get events by provider ID
export async function getEventsByProviderId(
  providerId: string
): Promise<Event[]> {
  try {
    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    const data = await makeJSONBinRequest("GET");
    return (
      data.events.filter((e) => e.appointment?.providerId === providerId) || []
    );
  } catch (error) {
    console.error("Failed to get events by provider ID:", error);
    throw new Error("Failed to retrieve provider events");
  }
}

// Get events by date range
export async function getEventsByDateRange(
  startDate: string,
  endDate: string
): Promise<Event[]> {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    const data = await makeJSONBinRequest("GET");
    return (
      data.events.filter((e) => {
        const eventStart = new Date(e.start);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);

        return eventStart >= rangeStart && eventStart <= rangeEnd;
      }) || []
    );
  } catch (error) {
    console.error("Failed to get events by date range:", error);
    throw new Error("Failed to retrieve events by date range");
  }
}

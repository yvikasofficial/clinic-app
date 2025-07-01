"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { Event } from "@/types/event";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  events: Event[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "events.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { events: [] });

// Initialize database connection
export async function initDB() {
  try {
    await db.read();

    // Initialize with empty events array if file doesn't exist
    if (!db.data) {
      db.data = { events: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  try {
    await db.read();
    return db.data?.events || [];
  } catch (error) {
    console.error("Failed to get events:", error);
    throw new Error("Failed to retrieve events");
  }
}

// Add a new event
export async function addEvent(event: Event): Promise<Event> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { events: [] };
    }

    // Validate required fields
    if (!event.id || !event.title || !event.start || !event.end) {
      throw new Error("Missing required event fields");
    }

    // Check if event already exists
    const existingEvent = db.data.events.find((e) => e.id === event.id);
    if (existingEvent) {
      throw new Error("Event with this ID already exists");
    }

    db.data.events.push(event);
    await db.write();

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

    await db.read();
    const eventIndex = db.data?.events.findIndex((e) => e.id === id) ?? -1;

    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    if (db.data?.events[eventIndex]) {
      db.data.events[eventIndex] = {
        ...db.data.events[eventIndex],
        ...updates,
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/events");
      revalidatePath(`/events/${id}`);

      return db.data.events[eventIndex];
    }

    return null;
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

    await db.read();
    const initialLength = db.data?.events.length || 0;

    if (db.data?.events) {
      db.data.events = db.data.events.filter((e) => e.id !== id);
      await db.write();

      const deleted = db.data.events.length < initialLength;

      if (deleted) {
        // Revalidate relevant pages
        revalidatePath("/events");
      }

      return deleted;
    }

    return false;
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

    await db.read();
    return db.data?.events.find((e) => e.id === id) || null;
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

    await db.read();
    return (
      db.data?.events.filter((e) => e.appointment?.patientId === patientId) ||
      []
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

    await db.read();
    return (
      db.data?.events.filter((e) => e.appointment?.providerId === providerId) ||
      []
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

    await db.read();
    return (
      db.data?.events.filter((e) => {
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

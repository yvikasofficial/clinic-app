"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { Memo } from "@/types/memo";
import { revalidatePath } from "next/cache";

// Database structure
interface Database {
  memos: Memo[];
}

// Database file path
const dbPath = path.join(process.cwd(), "src", "db", "memos.json");

// Initialize database
const adapter = new JSONFile<Database>(dbPath);
const db = new Low(adapter, { memos: [] });

// Initialize database connection
export async function initDB() {
  try {
    await db.read();

    // Initialize with empty memos array if file doesn't exist
    if (!db.data) {
      db.data = { memos: [] };
      await db.write();
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
}

// Get all memos
export async function getMemos(): Promise<Memo[]> {
  try {
    await db.read();
    return db.data?.memos || [];
  } catch (error) {
    console.error("Failed to get memos:", error);
    throw new Error("Failed to retrieve memos");
  }
}

// Add a new memo
export async function addMemo(memo: Memo): Promise<Memo> {
  try {
    await db.read();

    if (!db.data) {
      db.data = { memos: [] };
    }

    // Validate required fields
    if (!memo.id || !memo.note || !memo.patient || !memo.creator) {
      throw new Error("Missing required memo fields");
    }

    // Check if memo already exists
    const existingMemo = db.data.memos.find((m) => m.id === memo.id);
    if (existingMemo) {
      throw new Error("Memo with this ID already exists");
    }

    // Set timestamps
    const now = new Date().toISOString();
    memo.createdDate = now;
    memo.updatedDate = now;

    db.data.memos.push(memo);
    await db.write();

    // Revalidate relevant pages
    revalidatePath("/memos");
    revalidatePath(`/patients/${memo.patient.id}`);

    return memo;
  } catch (error) {
    console.error("Failed to add memo:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add memo"
    );
  }
}

// Update a memo
export async function updateMemo(
  id: string,
  updates: Partial<Memo>
): Promise<Memo | null> {
  try {
    if (!id) {
      throw new Error("Memo ID is required");
    }

    await db.read();
    const memoIndex = db.data?.memos.findIndex((m) => m.id === id) ?? -1;

    if (memoIndex === -1) {
      throw new Error("Memo not found");
    }

    if (db.data?.memos[memoIndex]) {
      // Update the memo and set updated timestamp
      db.data.memos[memoIndex] = {
        ...db.data.memos[memoIndex],
        ...updates,
        updatedDate: new Date().toISOString(),
      };
      await db.write();

      // Revalidate relevant pages
      revalidatePath("/memos");
      revalidatePath(`/memos/${id}`);
      revalidatePath(`/patients/${db.data.memos[memoIndex].patient.id}`);

      return db.data.memos[memoIndex];
    }

    return null;
  } catch (error) {
    console.error("Failed to update memo:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update memo"
    );
  }
}

// Delete a memo
export async function deleteMemo(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Memo ID is required");
    }

    await db.read();
    const initialLength = db.data?.memos.length || 0;
    const memoToDelete = db.data?.memos.find((m) => m.id === id);

    if (db.data?.memos) {
      db.data.memos = db.data.memos.filter((m) => m.id !== id);
      await db.write();

      const deleted = db.data.memos.length < initialLength;

      if (deleted && memoToDelete) {
        // Revalidate relevant pages
        revalidatePath("/memos");
        revalidatePath(`/patients/${memoToDelete.patient.id}`);
      }

      return deleted;
    }

    return false;
  } catch (error) {
    console.error("Failed to delete memo:", error);
    throw new Error("Failed to delete memo");
  }
}

// Get a memo by ID
export async function getMemoById(id: string): Promise<Memo | null> {
  try {
    if (!id) {
      throw new Error("Memo ID is required");
    }

    await db.read();
    return db.data?.memos.find((m) => m.id === id) || null;
  } catch (error) {
    console.error("Failed to get memo by ID:", error);
    throw new Error("Failed to retrieve memo");
  }
}

// Get memos by patient ID
export async function getMemosByPatientId(patientId: string): Promise<Memo[]> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    await db.read();
    return db.data?.memos.filter((m) => m.patient.id === patientId) || [];
  } catch (error) {
    console.error("Failed to get memos by patient ID:", error);
    throw new Error("Failed to retrieve patient memos");
  }
}

// Get memos by creator ID
export async function getMemosByCreatorId(creatorId: string): Promise<Memo[]> {
  try {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    await db.read();
    return db.data?.memos.filter((m) => m.creator.id === creatorId) || [];
  } catch (error) {
    console.error("Failed to get memos by creator ID:", error);
    throw new Error("Failed to retrieve creator memos");
  }
}

// Get memos by date range
export async function getMemosByDateRange(
  startDate: string,
  endDate: string
): Promise<Memo[]> {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    await db.read();
    return (
      db.data?.memos.filter((m) => {
        const memoDate = new Date(m.createdDate);
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);

        return memoDate >= rangeStart && memoDate <= rangeEnd;
      }) || []
    );
  } catch (error) {
    console.error("Failed to get memos by date range:", error);
    throw new Error("Failed to retrieve memos by date range");
  }
}

// Get recent memos (optional utility function)
export async function getRecentMemos(limit: number = 10): Promise<Memo[]> {
  try {
    await db.read();
    return (
      db.data?.memos
        .sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
        )
        .slice(0, limit) || []
    );
  } catch (error) {
    console.error("Failed to get recent memos:", error);
    throw new Error("Failed to retrieve recent memos");
  }
}

"use server";

import { Memo } from "@/types/memo";
import { revalidatePath } from "next/cache";
import jsonbin from "@/config/jsonbin";
import { makeJSONBinRequest } from "@/utils/api";

// Database structure for JSONBin
interface Database {
  memos: Memo[];
}

// JSONBin API configuration
const MEMOS_BIN_URL = jsonbin.MEMOS;

// Get data from JSONBin
async function getData(): Promise<Database> {
  try {
    const response = await makeJSONBinRequest(MEMOS_BIN_URL, "GET");
    return response.record || { memos: [] };
  } catch (error) {
    console.error("Failed to get data from JSONBin:", error);
    return { memos: [] };
  }
}

// Save data to JSONBin
async function saveData(data: Database): Promise<void> {
  try {
    await makeJSONBinRequest(MEMOS_BIN_URL, "PUT", data);
    console.log("Memos saved successfully", data);
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

// Get all memos
export async function getMemos(): Promise<Memo[]> {
  try {
    const data = await getData();
    return data.memos || [];
  } catch (error) {
    console.error("Failed to get memos:", error);
    throw new Error("Failed to retrieve memos");
  }
}

// Add a new memo
export async function addMemo(memo: Memo): Promise<Memo> {
  try {
    const data = await getData();

    // Validate required fields
    if (!memo.id || !memo.note || !memo.patient || !memo.creator) {
      throw new Error("Missing required memo fields");
    }

    // Check if memo already exists
    const existingMemo = data.memos.find((m) => m.id === memo.id);
    if (existingMemo) {
      throw new Error("Memo with this ID already exists");
    }

    // Set timestamps
    const now = new Date().toISOString();
    memo.createdDate = now;
    memo.updatedDate = now;

    data.memos.push(memo);
    await saveData(data);

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

    const data = await getData();
    const memoIndex = data.memos.findIndex((m) => m.id === id);

    if (memoIndex === -1) {
      throw new Error("Memo not found");
    }

    // Update the memo and set updated timestamp
    data.memos[memoIndex] = {
      ...data.memos[memoIndex],
      ...updates,
      updatedDate: new Date().toISOString(),
    };

    await saveData(data);

    // Revalidate relevant pages
    revalidatePath("/memos");
    revalidatePath(`/memos/${id}`);
    revalidatePath(`/patients/${data.memos[memoIndex].patient.id}`);

    return data.memos[memoIndex];
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

    const data = await getData();
    const initialLength = data.memos.length;
    const memoToDelete = data.memos.find((m) => m.id === id);

    data.memos = data.memos.filter((m) => m.id !== id);

    const deleted = data.memos.length < initialLength;

    if (deleted) {
      await saveData(data);

      if (memoToDelete) {
        // Revalidate relevant pages
        revalidatePath("/memos");
        revalidatePath(`/patients/${memoToDelete.patient.id}`);
      }
    }

    return deleted;
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

    const data = await getData();
    return data.memos.find((m) => m.id === id) || null;
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

    const data = await getData();
    return (
      data.memos.filter((m) => {
        return m.patient.id === patientId;
      }) || []
    );
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

    const data = await getData();
    return data.memos.filter((m) => m.creator.id === creatorId) || [];
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

    const data = await getData();
    return (
      data.memos.filter((m) => {
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
    const data = await getData();
    return (
      data.memos
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

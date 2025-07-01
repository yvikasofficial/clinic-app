"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMemo } from "@/actions/memos";
import { Memo, MemoPatient, MemoCreator } from "@/types/memo";

// Mock creator data - in a real app, this would come from auth context
const MOCK_CREATOR: MemoCreator = {
  id: "usr_3c4d5e6f7g8h9i0j1k",
  firstName: "Robert",
  lastName: "Davis",
  email: "robert.davis@decodahealth.com",
};

interface CreateMemoData {
  patient: MemoPatient;
  note: string;
}

// Generate unique ID for memo
const generateMemoId = () => {
  return `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function useCreateMemo() {
  const queryClient = useQueryClient();

  return useMutation<Memo, Error, CreateMemoData>({
    mutationFn: async (data: CreateMemoData) => {
      const now = new Date().toISOString();

      const newMemo: Memo = {
        id: generateMemoId(),
        patient: data.patient,
        note: data.note.trim(),
        creator: MOCK_CREATOR,
        createdDate: now,
        updatedDate: now,
      };

      // Log the exact JSON output for verification
      console.log(
        "Creating memo with exact JSON structure:",
        JSON.stringify(newMemo, null, 2)
      );

      await addMemo(newMemo);
      return newMemo;
    },
    onSuccess: (data) => {
      // Invalidate and refetch memos for this patient
      queryClient.invalidateQueries({
        queryKey: ["memos", "patient", data.patient.id],
      });

      // Optionally, you can also update the cache directly
      queryClient.setQueryData<Memo[]>(
        ["memos", "patient", data.patient.id],
        (oldData) => (oldData ? [data, ...oldData] : [data])
      );
    },
    onError: (error) => {
      console.error("Failed to create memo:", error);
    },
  });
}

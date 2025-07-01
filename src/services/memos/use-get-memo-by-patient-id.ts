"use client";

import { useQuery } from "@tanstack/react-query";
import { getMemosByPatientId } from "@/actions/memos";
import { Memo } from "@/types/memo";

export function useGetMemoByPatientId(patientId: string) {
  return useQuery<Memo[], Error>({
    queryKey: ["memos", "patient", patientId],
    queryFn: () => getMemosByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

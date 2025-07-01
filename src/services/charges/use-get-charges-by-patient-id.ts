"use client";

import { useQuery } from "@tanstack/react-query";
import { getChargesByPatientId } from "@/actions/charges";
import { Charge } from "@/types/charge";

export function useGetChargesByPatientId(patientId: string) {
  return useQuery<Charge[], Error>({
    queryKey: ["charges", "patient", patientId],
    queryFn: () => getChargesByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getAlertsByPatientId } from "@/actions/alerts";
import { Alert } from "@/types/alert";

export function useGetAlertsByPatientId(patientId: string) {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts", "patient", patientId],
    queryFn: () => getAlertsByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

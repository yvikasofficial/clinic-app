"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventsByPatientId } from "@/actions/events";
import { Event } from "@/types/event";

export function useGetEventByPatientId(patientId: string) {
  return useQuery<Event[], Error>({
    queryKey: ["events", "patient", patientId],
    queryFn: () => getEventsByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

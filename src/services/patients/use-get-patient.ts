"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "@/actions/patients";
import { Patient } from "@/types/patient";

export function useGetPatient(id: string) {
  return useQuery<Patient | null, Error>({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!id, // Only run query if id is provided
  });
}

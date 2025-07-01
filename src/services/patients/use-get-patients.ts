"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/actions/patients";
import { Patient } from "@/types/patient";

export function useGetPatients() {
  return useQuery<Patient[], Error>({
    queryKey: ["patients"],
    queryFn: getPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

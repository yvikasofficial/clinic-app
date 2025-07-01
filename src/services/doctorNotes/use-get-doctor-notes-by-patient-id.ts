"use client";

import { useQuery } from "@tanstack/react-query";
import { getDoctorNotesByPatientId } from "@/actions/doctorNotes";
import { DoctorNote } from "@/types/doctorNote";

export function useGetDoctorNotesByPatientId(patientId: string) {
  return useQuery<DoctorNote[], Error>({
    queryKey: ["doctorNotes", "patient", patientId],
    queryFn: () => getDoctorNotesByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

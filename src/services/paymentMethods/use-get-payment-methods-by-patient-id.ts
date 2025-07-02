"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentMethodsByPatientId } from "@/actions/payment_methods";
import { PaymentMethod } from "@/types/paymentMethods";

export function useGetPaymentMethodsByPatientId(patientId: string) {
  return useQuery<PaymentMethod[], Error>({
    queryKey: ["paymentMethods", "patient", patientId],
    queryFn: () => getPaymentMethodsByPatientId(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!patientId, // Only run query if patientId is provided
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePaymentMethod } from "@/actions/payment_methods";
import { PaymentMethod, PaymentMethodType } from "@/types/paymentMethods";

export interface UpdatePaymentMethodData {
  id: string;
  patientId: string;
  type?: PaymentMethodType;
  description?: string;
  isDefault?: boolean;
  // Card-specific fields
  brand?: string | null;
  last4?: string | null;
  expMonth?: number | null;
  expYear?: number | null;
  // Bank account-specific fields
  accountHolderType?: string | null;
  accountNumberLast4?: number | null;
  bankName?: string | null;
  routingNumber?: number | null;
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<PaymentMethod, Error, UpdatePaymentMethodData>({
    mutationFn: async (data: UpdatePaymentMethodData) => {
      // Validate required fields
      if (!data.id || !data.patientId) {
        throw new Error("Missing required payment method ID or patient ID");
      }

      // Extract id and create updates object
      const { id, ...updates } = data;

      // Log the update data for verification
      console.log(
        "Updating payment method with data:",
        JSON.stringify({ id, updates }, null, 2)
      );

      const result = await updatePaymentMethod(id, updates);

      if (!result) {
        throw new Error("Payment method not found or update failed");
      }

      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch payment methods for this patient
      queryClient.invalidateQueries({
        queryKey: ["paymentMethods", "patient", data.patientId],
      });

      // Update the specific payment method in cache
      queryClient.setQueryData<PaymentMethod[]>(
        ["paymentMethods", "patient", data.patientId],
        (oldData) => {
          if (!oldData) return [data];
          return oldData.map((pm) => (pm.id === data.id ? data : pm));
        }
      );

      // Invalidate general payment methods queries if they exist
      queryClient.invalidateQueries({
        queryKey: ["paymentMethods"],
      });

      // Invalidate single payment method query if it exists
      queryClient.invalidateQueries({
        queryKey: ["paymentMethod", data.id],
      });
    },
    onError: (error) => {
      console.error("Failed to update payment method:", error);
    },
  });
}

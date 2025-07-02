"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPaymentMethod } from "@/actions/payment_methods";
import { PaymentMethod, PaymentMethodType } from "@/types/paymentMethods";

export interface CreatePaymentMethodData {
  patientId: string;
  type: PaymentMethodType;
  description: string;
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

// Generate unique ID for payment method
const generatePaymentMethodId = () => {
  return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation<PaymentMethod, Error, CreatePaymentMethodData>({
    mutationFn: async (data: CreatePaymentMethodData) => {
      // Validate required fields
      if (!data.patientId || !data.type || !data.description) {
        throw new Error("Missing required payment method fields");
      }

      const newPaymentMethod: PaymentMethod = {
        id: generatePaymentMethodId(),
        patientId: data.patientId,
        type: data.type,
        description: data.description,
        isDefault: data.isDefault || false,
        // Card fields
        brand: data.brand || null,
        last4: data.last4 || null,
        expMonth: data.expMonth || null,
        expYear: data.expYear || null,
        // Bank account fields
        accountHolderType: data.accountHolderType || null,
        accountNumberLast4: data.accountNumberLast4 || null,
        bankName: data.bankName || null,
        routingNumber: data.routingNumber || null,
      };

      // Log the exact JSON output for verification
      console.log(
        "Creating payment method with exact JSON structure:",
        JSON.stringify(newPaymentMethod, null, 2)
      );

      const result = await addPaymentMethod(newPaymentMethod);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch payment methods for this patient
      queryClient.invalidateQueries({
        queryKey: ["paymentMethods", "patient", data.patientId],
      });

      // Optionally, you can also update the cache directly
      queryClient.setQueryData<PaymentMethod[]>(
        ["paymentMethods", "patient", data.patientId],
        (oldData) => (oldData ? [...oldData, data] : [data])
      );

      // Invalidate general payment methods queries if they exist
      queryClient.invalidateQueries({
        queryKey: ["paymentMethods"],
      });
    },
    onError: (error) => {
      console.error("Failed to create payment method:", error);
    },
  });
}

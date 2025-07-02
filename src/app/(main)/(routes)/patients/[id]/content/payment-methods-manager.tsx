"use client";

import { useState } from "react";
import { PaymentMethod } from "@/types/charge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodsManagerProps {
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
  onPaymentMethodsChange?: (paymentMethods: PaymentMethod[]) => void;
}

// Dummy payment method generator
const generateDummyPaymentMethod = (): PaymentMethod => {
  const brands = ["Visa", "MasterCard", "American Express", "Discover"];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const last4 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const expMonth = Math.floor(Math.random() * 12) + 1;
  const expYear = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;

  return {
    id: `pm_${Math.random().toString(36).substr(2, 9)}`,
    brand,
    last4,
    expMonth,
    expYear,
  };
};

const PaymentMethodsManager = ({
  paymentMethods,
  isLoading = false,
  onPaymentMethodsChange,
}: PaymentMethodsManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localPaymentMethods, setLocalPaymentMethods] =
    useState<PaymentMethod[]>(paymentMethods);
  const [isEditing, setIsEditing] = useState(false);
  const [newMethodForm, setNewMethodForm] = useState({
    brand: "",
    last4: "",
    expMonth: "",
    expYear: "",
  });

  const handleAddDummyMethod = () => {
    const dummyMethod = generateDummyPaymentMethod();
    const updatedMethods = [...localPaymentMethods, dummyMethod];
    setLocalPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
    toast.success("Dummy payment method added successfully!");
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    const updatedMethods = localPaymentMethods.filter(
      (method) => method.id !== methodId
    );
    setLocalPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
    toast.success("Payment method removed successfully!");
  };

  const handleAddNewMethod = () => {
    if (
      !newMethodForm.brand ||
      !newMethodForm.last4 ||
      !newMethodForm.expMonth ||
      !newMethodForm.expYear
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const newMethod: PaymentMethod = {
      id: `pm_${Math.random().toString(36).substr(2, 9)}`,
      brand: newMethodForm.brand,
      last4: newMethodForm.last4,
      expMonth: parseInt(newMethodForm.expMonth),
      expYear: parseInt(newMethodForm.expYear),
    };

    const updatedMethods = [...localPaymentMethods, newMethod];
    setLocalPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);

    // Reset form
    setNewMethodForm({ brand: "", last4: "", expMonth: "", expYear: "" });
    setIsEditing(false);
    toast.success("Payment method added successfully!");
  };

  const getPaymentMethodIcon = () => {
    return <CreditCard className="h-4 w-4" />;
  };

  const renderPaymentMethodsDisplay = () => {
    if (localPaymentMethods.length === 0) {
      return (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure Payment Method
        </div>
      );
    }

    if (localPaymentMethods.length === 1) {
      const method = localPaymentMethods[0];
      return (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon()}
          <span>
            {method.brand} ••••{method.last4}
          </span>
          <Badge variant="secondary" className="ml-1">
            {method.expMonth.toString().padStart(2, "0")}/
            {method.expYear.toString().slice(-2)}
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span>{localPaymentMethods.length} Payment Methods</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {renderPaymentMethodsDisplay()}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </DialogTitle>
          <DialogDescription>
            Manage payment methods for processing charges and payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Payment Methods</h3>

            {localPaymentMethods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No payment methods configured</p>
                <p className="text-xs mt-1">
                  Add a payment method to start processing payments
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {localPaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon()}
                      <div>
                        <div className="font-medium text-sm">
                          {method.brand} ••••{method.last4}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expires {method.expMonth.toString().padStart(2, "0")}/
                          {method.expYear}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Quick Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDummyMethod}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Add Dummy Method
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Method
              </Button>
            </div>
          </div>

          {/* Add New Payment Method Form */}
          {isEditing && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h4 className="text-sm font-medium">Add New Payment Method</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Card Brand</Label>
                  <Select
                    value={newMethodForm.brand}
                    onValueChange={(value) =>
                      setNewMethodForm((prev) => ({ ...prev, brand: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="MasterCard">MasterCard</SelectItem>
                      <SelectItem value="American Express">
                        American Express
                      </SelectItem>
                      <SelectItem value="Discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last4">Last 4 Digits</Label>
                  <Input
                    id="last4"
                    placeholder="1234"
                    maxLength={4}
                    value={newMethodForm.last4}
                    onChange={(e) =>
                      setNewMethodForm((prev) => ({
                        ...prev,
                        last4: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expMonth">Exp Month</Label>
                  <Select
                    value={newMethodForm.expMonth}
                    onValueChange={(value) =>
                      setNewMethodForm((prev) => ({ ...prev, expMonth: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {(i + 1).toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expYear">Exp Year</Label>
                  <Select
                    value={newMethodForm.expYear}
                    onValueChange={(value) =>
                      setNewMethodForm((prev) => ({ ...prev, expYear: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddNewMethod}>
                  Add Method
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setNewMethodForm({
                      brand: "",
                      last4: "",
                      expMonth: "",
                      expYear: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsManager;

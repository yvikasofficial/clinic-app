"use client";

import { useState } from "react";
import { PaymentMethod, PaymentMethodType } from "@/types/paymentMethods";
import { useCreatePaymentMethod } from "@/services/paymentMethods/use-create-payment-method";
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
import { Switch } from "@/components/ui/switch";
import {
  CreditCard,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface PaymentMethodsManagerProps {
  paymentMethods: PaymentMethod[];
  isLoading?: boolean;
  onPaymentMethodsChange?: (paymentMethods: PaymentMethod[]) => void;
}

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
    type: PaymentMethodType.CARD,
    description: "",
    isDefault: false,
    brand: "",
    last4: "",
    expMonth: "",
    expYear: "",
    accountHolderType: "",
    accountNumberLast4: "",
    bankName: "",
    routingNumber: "",
  });
  const { id } = useParams();

  const createPaymentMethod = useCreatePaymentMethod();

  const handleAddDummyMethod = () => {
    const brands = ["Visa", "MasterCard", "American Express", "Discover"];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const last4 = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const expMonth = Math.floor(Math.random() * 12) + 1;
    const expYear =
      new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;

    createPaymentMethod.mutate(
      {
        patientId: id as string,
        type: PaymentMethodType.CARD,
        description: `${brand} Card ending in ${last4}`,
        brand,
        last4,
        expMonth,
        expYear,
      },
      {
        onSuccess: (newMethod) => {
          const updatedMethods = [...localPaymentMethods, newMethod];
          setLocalPaymentMethods(updatedMethods);
          onPaymentMethodsChange?.(updatedMethods);
          toast.success("Dummy payment method added successfully!");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add payment method");
        },
      }
    );
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
    if (!newMethodForm.description) {
      toast.error("Please provide a description");
      return;
    }

    if (newMethodForm.type === PaymentMethodType.CARD) {
      if (
        !newMethodForm.brand ||
        !newMethodForm.last4 ||
        !newMethodForm.expMonth ||
        !newMethodForm.expYear
      ) {
        toast.error("Please fill in all card fields");
        return;
      }
    } else if (newMethodForm.type === PaymentMethodType.BANK_ACCOUNT) {
      if (
        !newMethodForm.accountHolderType ||
        !newMethodForm.accountNumberLast4 ||
        !newMethodForm.bankName ||
        !newMethodForm.routingNumber
      ) {
        toast.error("Please fill in all bank account fields");
        return;
      }
    }

    const createData = {
      patientId: id as string,
      type: newMethodForm.type,
      description: newMethodForm.description,
      isDefault: newMethodForm.isDefault,
      ...(newMethodForm.type === PaymentMethodType.CARD
        ? {
            brand: newMethodForm.brand,
            last4: newMethodForm.last4,
            expMonth: parseInt(newMethodForm.expMonth),
            expYear: parseInt(newMethodForm.expYear),
          }
        : {
            accountHolderType: newMethodForm.accountHolderType,
            accountNumberLast4: parseInt(newMethodForm.accountNumberLast4),
            bankName: newMethodForm.bankName,
            routingNumber: parseInt(newMethodForm.routingNumber),
          }),
    };
    console.log(createData);
    createPaymentMethod.mutate(createData, {
      onSuccess: (newMethod) => {
        const updatedMethods = [...localPaymentMethods, newMethod];
        setLocalPaymentMethods(updatedMethods);
        onPaymentMethodsChange?.(updatedMethods);

        setNewMethodForm({
          type: PaymentMethodType.CARD,
          description: "",
          isDefault: false,
          brand: "",
          last4: "",
          expMonth: "",
          expYear: "",
          accountHolderType: "",
          accountNumberLast4: "",
          bankName: "",
          routingNumber: "",
        });
        setIsEditing(false);
        toast.success("Payment method added successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add payment method");
      },
    });
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    return method.type === PaymentMethodType.BANK_ACCOUNT ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <CreditCard className="h-4 w-4" />
    );
  };

  const handleSetDefaultPaymentMethod = (methodId: string) => {
    const updatedMethods = localPaymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === methodId,
    }));
    setLocalPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
    toast.success("Default payment method updated!");
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

    const defaultMethod = localPaymentMethods.find(
      (method) => method.isDefault
    );

    if (defaultMethod) {
      return (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon(defaultMethod)}
          <span>
            {defaultMethod.type === PaymentMethodType.CARD
              ? `${defaultMethod.brand} ••••${defaultMethod.last4}`
              : `${defaultMethod.bankName} ••••${defaultMethod.accountNumberLast4}`}
          </span>
          {defaultMethod.type === PaymentMethodType.CARD && (
            <Badge variant="secondary" className="ml-1">
              {defaultMethod.expMonth?.toString().padStart(2, "0")}/
              {defaultMethod.expYear?.toString().slice(-2)}
            </Badge>
          )}
          <Badge variant="default" className="ml-1">
            Default
          </Badge>
          {localPaymentMethods.length > 1 && (
            <Badge variant="outline" className="ml-1">
              +{localPaymentMethods.length - 1} more
            </Badge>
          )}
        </div>
      );
    }

    if (localPaymentMethods.length === 1) {
      const method = localPaymentMethods[0];
      return (
        <div className="flex items-center gap-2">
          {getPaymentMethodIcon(method)}
          <span>
            {method.type === PaymentMethodType.CARD
              ? `${method.brand} ••••${method.last4}`
              : `${method.bankName} ••••${method.accountNumberLast4}`}
          </span>
          {method.type === PaymentMethodType.CARD && (
            <Badge variant="secondary" className="ml-1">
              {method.expMonth?.toString().padStart(2, "0")}/
              {method.expYear?.toString().slice(-2)}
            </Badge>
          )}
          <Badge variant="outline" className="ml-1 text-orange-600">
            Set Default
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span>{localPaymentMethods.length} Payment Methods</span>
        <Badge variant="outline" className="ml-1 text-orange-600">
          Set Default
        </Badge>
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
            {!localPaymentMethods.some((method) => method.isDefault) &&
              localPaymentMethods.length > 0 && (
                <span className="text-orange-600 font-medium">
                  {" "}
                  Select a default payment method.
                </span>
              )}
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
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`default-${method.id}`}
                          name="defaultPaymentMethod"
                          checked={method.isDefault || false}
                          onChange={() =>
                            handleSetDefaultPaymentMethod(method.id)
                          }
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <Label
                          htmlFor={`default-${method.id}`}
                          className="sr-only"
                        >
                          Set as default
                        </Label>
                      </div>

                      {getPaymentMethodIcon(method)}
                      <div>
                        <div className="font-medium text-sm">
                          {method.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {method.type === PaymentMethodType.CARD
                            ? `${method.brand} ••••${
                                method.last4
                              } - Expires ${method.expMonth
                                ?.toString()
                                .padStart(2, "0")}/${method.expYear}`
                            : `${method.bankName} ••••${method.accountNumberLast4}`}
                          {method.isDefault && (
                            <Badge variant="default" className="ml-2">
                              Default
                            </Badge>
                          )}
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

                {localPaymentMethods.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Select a radio button to set the default payment method for
                    charges.
                  </p>
                )}
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
                disabled={createPaymentMethod.isPending}
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

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type</Label>
                  <Select
                    value={newMethodForm.type}
                    onValueChange={(value: PaymentMethodType) =>
                      setNewMethodForm((prev) => ({
                        ...prev,
                        type: value,
                        brand: "",
                        last4: "",
                        expMonth: "",
                        expYear: "",
                        accountHolderType: "",
                        accountNumberLast4: "",
                        bankName: "",
                        routingNumber: "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethodType.CARD}>
                        Credit/Debit Card
                      </SelectItem>
                      <SelectItem value={PaymentMethodType.BANK_ACCOUNT}>
                        Bank Account
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Primary Card"
                    value={newMethodForm.description}
                    onChange={(e) =>
                      setNewMethodForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {newMethodForm.type === PaymentMethodType.CARD && (
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
                        setNewMethodForm((prev) => ({
                          ...prev,
                          expMonth: value,
                        }))
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
                        setNewMethodForm((prev) => ({
                          ...prev,
                          expYear: value,
                        }))
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
              )}

              {newMethodForm.type === PaymentMethodType.BANK_ACCOUNT && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      placeholder="Chase Bank"
                      value={newMethodForm.bankName}
                      onChange={(e) =>
                        setNewMethodForm((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumberLast4">Account Last 4</Label>
                    <Input
                      id="accountNumberLast4"
                      placeholder="9876"
                      maxLength={4}
                      value={newMethodForm.accountNumberLast4}
                      onChange={(e) =>
                        setNewMethodForm((prev) => ({
                          ...prev,
                          accountNumberLast4: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      placeholder="123456789"
                      maxLength={9}
                      value={newMethodForm.routingNumber}
                      onChange={(e) =>
                        setNewMethodForm((prev) => ({
                          ...prev,
                          routingNumber: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderType">
                      Account Holder Type
                    </Label>
                    <Select
                      value={newMethodForm.accountHolderType}
                      onValueChange={(value) =>
                        setNewMethodForm((prev) => ({
                          ...prev,
                          accountHolderType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Default toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={newMethodForm.isDefault}
                  onCheckedChange={(checked) =>
                    setNewMethodForm((prev) => ({
                      ...prev,
                      isDefault: checked,
                    }))
                  }
                />
                <Label htmlFor="isDefault">Set as default payment method</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddNewMethod}
                  disabled={createPaymentMethod.isPending}
                >
                  {createPaymentMethod.isPending ? "Adding..." : "Add Method"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setNewMethodForm({
                      type: PaymentMethodType.CARD,
                      description: "",
                      isDefault: false,
                      brand: "",
                      last4: "",
                      expMonth: "",
                      expYear: "",
                      accountHolderType: "",
                      accountNumberLast4: "",
                      bankName: "",
                      routingNumber: "",
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

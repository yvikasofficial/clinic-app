"use client";

import { useState } from "react";
import { MemoPatient } from "@/types/memo";
import { useCreateMemo } from "@/services/memos/use-create-memo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: MemoPatient;
  onSuccess?: () => void;
}

interface FormErrors {
  note?: string;
  general?: string;
}

const CreateMemoModal = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: CreateMemoModalProps) => {
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const createMemoMutation = useCreateMemo();

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate note
    if (!note.trim()) {
      newErrors.note = "Memo note is required";
    } else if (note.trim().length < 10) {
      newErrors.note = "Memo note must be at least 10 characters long";
    } else if (note.trim().length > 2000) {
      newErrors.note = "Memo note must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      await createMemoMutation.mutateAsync({
        patient,
        note: note.trim(),
      });

      // Reset form
      setNote("");
      setErrors({});
      toast.success("Memo created successfully", {
        description: "The memo has been created successfully.",
      });
      // Call success callback and close modal
      onSuccess?.();
      onClose();
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to create memo. Please try again.",
      });
      toast.error("Failed to create memo", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (createMemoMutation.isPending) return; // Prevent closing while loading

    setNote("");
    setErrors({});
    onClose();
  };

  // Character count for note
  const characterCount = note.length;
  const maxCharacters = 2000;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md p-4">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <SheetTitle>Create New Memo</SheetTitle>
          </div>
          <SheetDescription>
            Add a clinical note or observation for{" "}
            <span className="font-medium">
              {patient.firstName} {patient.lastName}
            </span>
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Creator Info Display */}
          <div className="bg-primary/5 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Created By</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Provider:</span> Dr. Robert Davis
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                robert.davis@decodahealth.com
              </p>
            </div>
          </div>

          {/* General Error Alert */}
          {(errors.general || createMemoMutation.error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.general || createMemoMutation.error?.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Memo Note Field */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Memo Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your clinical note or observation..."
              className={`min-h-[120px] resize-none ${
                errors.note
                  ? "border-destructive focus-visible:border-destructive"
                  : ""
              }`}
              disabled={createMemoMutation.isPending}
              maxLength={maxCharacters}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {errors.note && (
                  <span className="text-destructive">{errors.note}</span>
                )}
              </span>
              <span
                className={
                  characterCount > maxCharacters * 0.9 ? "text-amber-600" : ""
                }
              >
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMemoMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMemoMutation.isPending || !note.trim()}
              className="flex-1"
            >
              {createMemoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Memo"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateMemoModal;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Patient } from "@/types/patient";
import { useCreateDoctorNote } from "@/services/doctorNotes/use-create-doctor-note";
import {
  Bot,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPhoneNumber } from "@/utils";

interface GenerateDoctorNoteProps {
  patient: Patient;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const GenerateDoctorNote = ({
  patient,
  variant = "default",
  size = "default",
  className = "",
}: GenerateDoctorNoteProps) => {
  const createDoctorNoteMutation = useCreateDoctorNote();

  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [providerInput, setProviderInput] = useState("");
  const [providers, setProviders] = useState<string[]>(["Dr John"]);

  // Generate AI content using OpenRouter
  const generateAIContent = async (appointmentData?: any) => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient,
          appointmentData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate note");
      }

      const data = await response.json();

      setContent(data.content);
      setSummary(data.summary);

      toast.success("Doctor note generated successfully!", {
        description:
          "AI has generated a comprehensive doctor note using OpenRouter.",
      });
    } catch (error) {
      console.error("Error generating doctor note:", error);
      toast.error("Generation failed", {
        description:
          error instanceof Error
            ? error.message
            : "Unable to generate doctor note. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add provider to the list
  const addProvider = () => {
    if (providerInput.trim() && !providers.includes(providerInput.trim())) {
      setProviders([...providers, providerInput.trim()]);
      setProviderInput("");
    }
  };

  // Remove provider from the list
  const removeProvider = (providerToRemove: string) => {
    setProviders(providers.filter((provider) => provider !== providerToRemove));
  };

  // Handle Enter key for adding providers
  const handleProviderKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProvider();
    }
  };

  // Save doctor note using the custom hook
  const saveDoctorNote = async () => {
    try {
      await createDoctorNoteMutation.mutateAsync({
        patient,
        content,
        summary,
        providers,
      });

      // Reset form and close modal
      resetForm();
      setIsOpen(false);

      toast.success("Doctor note saved successfully!", {
        description:
          "The AI-generated doctor note has been saved to the patient's record.",
      });
    } catch (error) {
      toast.error("Save failed", {
        description:
          error instanceof Error
            ? error.message
            : "Unable to save doctor note. Please try again.",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setContent("");
    setSummary("");
    setProviders(["Dr John"]);
    setProviderInput("");
  };

  // Handle modal close
  const handleClose = () => {
    if (isGenerating || createDoctorNoteMutation.isPending) return;
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Bot className="h-4 w-4" />
          Generate Doctor Note
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate AI Doctor Note
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive doctor note for{" "}
            <span className="font-medium">
              {patient.firstName} {patient.lastName}
            </span>{" "}
            using AI and patient information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Info Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Patient Information</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                {patient.firstName} {patient.lastName}
              </div>
              <div>
                <span className="text-muted-foreground">DOB:</span>{" "}
                {patient.dateOfBirth}
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>{" "}
                {patient.gender}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {formatPhoneNumber(patient.phoneNumber)}
              </div>
            </div>
          </div>

          {/* Generate AI Content Button */}
          {!content && (
            <div className="text-center py-8">
              <Button
                onClick={() => generateAIContent()}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Doctor Note...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Generate AI Doctor Note
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Click to generate a comprehensive doctor note based on patient
                information
              </p>
            </div>
          )}

          {/* Generated Content */}
          {content && (
            <>
              <Separator />

              {/* Healthcare Providers */}
              <div className="space-y-3">
                <Label htmlFor="providers">Healthcare Providers *</Label>
                <div className="flex gap-2">
                  <Input
                    id="providers"
                    placeholder="Enter provider name (e.g., Dr. John Smith)"
                    value={providerInput}
                    onChange={(e) => setProviderInput(e.target.value)}
                    onKeyPress={handleProviderKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addProvider}
                    variant="outline"
                    size="default"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {providers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {providers.map((provider, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 cursor-pointer"
                        onClick={() => removeProvider(provider)}
                      >
                        {provider}
                        <span className="ml-1 text-xs">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief summary of the doctor visit..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{summary.length} characters</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Doctor Note Content *</Label>
                  <Button
                    type="button"
                    onClick={() => generateAIContent()}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Detailed doctor note content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="resize-none font-mono text-sm"
                />
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{content.length} characters</span>
                </div>
              </div>

              {/* AI Generated Badge */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="gap-1">
                  <Bot className="h-3 w-3" />
                  AI Generated
                </Badge>
                <span>
                  This note was generated using artificial intelligence
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating || createDoctorNoteMutation.isPending}
          >
            Cancel
          </Button>
          {content && (
            <Button
              onClick={saveDoctorNote}
              disabled={isGenerating || createDoctorNoteMutation.isPending}
              className="gap-2"
            >
              {createDoctorNoteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Save Doctor Note
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateDoctorNote;

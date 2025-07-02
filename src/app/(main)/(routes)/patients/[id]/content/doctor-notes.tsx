import { DoctorNote } from "@/types/doctorNote";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Bot,
  FileCheck,
  Hash,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Patient } from "@/types/patient";
import GenerateDoctorNote from "./generate-doctor-note";

const DoctorNotes = ({
  doctorNotes,
  isLoading,
  patient,
}: {
  doctorNotes: DoctorNote[];
  isLoading: boolean;
  patient: Patient;
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!doctorNotes || doctorNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No doctor notes found
        </h3>
        <p className="text-sm text-muted-foreground">
          There are no doctor notes recorded for this patient yet.
        </p>
      </div>
    );
  }

  // Helper function to parse formatted notes
  const parseNoteContent = (content: string) => {
    if (!content) return content;

    // Check if content contains markdown-style formatting
    const hasMarkdownFormatting = content.includes("**");

    if (!hasMarkdownFormatting) {
      // Return content as-is if no formatting
      return content;
    }

    // Parse markdown-style formatting
    const parsedContent = content
      // Convert **Header:** patterns to clean headers
      .replace(/\*\*([^*]+?):\*\*/g, "$1:")
      // Convert standalone **text** to just text
      .replace(/\*\*([^*]+?)\*\*/g, "$1")
      // Clean up extra whitespace and line breaks
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    return parsedContent;
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Sort notes by creation date (newest first)
  const sortedNotes = [...doctorNotes].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  // Calculate statistics
  const totalNotes = doctorNotes?.length || 0;
  const aiGeneratedCount =
    doctorNotes?.filter((note) => note.aiGenerated).length || 0;
  const latestNoteDate =
    sortedNotes.length > 0 ? formatDate(sortedNotes[0].createdDate) : null;

  const handleGenerateNewNote = () => {
    // TODO: Implement generate new note functionality
    console.log("Generate new note clicked");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Doctor Notes
              </h2>
              <p className="text-sm text-muted-foreground">
                Medical notes and observations from healthcare providers
              </p>
            </div>
          </div>
          <GenerateDoctorNote patient={patient} />
        </div>

        {/* Statistics */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>
              {totalNotes} {totalNotes === 1 ? "note" : "notes"} total
            </span>
          </div>
          {aiGeneratedCount > 0 && (
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>{aiGeneratedCount} AI generated</span>
            </div>
          )}
          {latestNoteDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Latest: {latestNoteDate}</span>
            </div>
          )}
        </div>
      </div>
      {/* Empty state */}
      {!doctorNotes || doctorNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No doctor notes found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            There are no doctor notes recorded for this patient yet.
          </p>
          <Button
            onClick={handleGenerateNewNote}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create First Note
          </Button>
        </div>
      ) : (
        /* Notes List */
        <div className="space-y-4">
          {sortedNotes.map((note) => (
            <Card key={note.id} className="shadow-none bg-zinc-50 !gap-2">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {note.providerNames && note.providerNames.length > 0 ? (
                          note.providerNames.map((provider, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {provider}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            No providers assigned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(note.createdDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(note.createdDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {note.aiGenerated && (
                      <Badge variant="secondary" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                    {note.version !== note.currentVersion && (
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />v{note.version}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {note.summary && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Summary
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {parseNoteContent(note.summary)}
                    </p>
                  </div>
                )}

                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-lg border border-border">
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors [&[data-state=open]>svg:last-child]:rotate-180">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Notes</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down px-4 pb-4">
                      <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {parseNoteContent(note.content)}
                      </pre>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorNotes;

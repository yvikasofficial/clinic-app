import { DoctorNote } from "@/types/doctorNote";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Timer,
  Hash,
  ChevronDown,
} from "lucide-react";

const DoctorNotes = ({
  doctorNotes,
  isLoading,
}: {
  doctorNotes: DoctorNote[];
  isLoading: boolean;
}) => {
  // Loading state
  if (isLoading) {
    return (
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

  const formatDuration = (duration: number | null) => {
    if (!duration) return "N/A";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Sort notes by creation date (newest first)
  const sortedNotes = [...doctorNotes].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            className="shadow-none hover:shadow-sm transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Provider Icon instead of Patient Avatar */}
                  <div className="h-10 w-10 flex-shrink-0 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>

                  {/* Provider Names and Date */}
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
                      {note.duration && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          <span>{formatDuration(note.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
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
              {/* Summary - Always visible */}
              {note.summary && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Summary
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {note.summary}
                  </p>
                </div>
              )}

              {/* Collapsible Note Content */}
              <Collapsible defaultOpen={false}>
                <div className="bg-muted/30 rounded-lg">
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors [&[data-state=open]>svg:last-child]:rotate-180">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Notes</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down px-4 pb-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorNotes;

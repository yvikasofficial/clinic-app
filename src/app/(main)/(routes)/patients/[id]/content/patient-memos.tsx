import { Memo } from "@/types/memo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Calendar, Clock, Plus } from "lucide-react";
import { useState } from "react";
import CreateMemoModal from "./create-memo-modal";

const PatientMemos = ({
  memos,
  isLoading,
}: {
  memos: Memo[];
  isLoading: boolean;
}) => {
  const [isCreateMemoModalOpen, setIsCreateMemoModalOpen] = useState(false);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!memos || memos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No memos found
        </h3>
        <p className="text-sm text-muted-foreground">
          There are no memos recorded for this patient yet.
        </p>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Sort memos by creation date (newest first)
  const sortedMemos = [...memos].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return (
    <div className="space-y-6">
      <CreateMemoModal
        isOpen={isCreateMemoModalOpen}
        onClose={() => setIsCreateMemoModalOpen(false)}
        patient={memos[0].patient}
      />
      {/* Header Section */}
      <div className="flex items-start justify-between">
        {/* Left Side - Information */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold"> Patient Memos</h2>
          <p className="text-muted-foreground text-sm">
            Clinical notes and observations from healthcare providers
          </p>
        </div>

        {/* Right Side - Create Button */}
        <Button
          className="gap-2"
          onClick={() => setIsCreateMemoModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create New Memo
        </Button>
      </div>

      {/* Existing Memos Content */}
      {!memos || memos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No memos found
          </h3>
          <p className="text-sm text-muted-foreground">
            There are no memos recorded for this patient yet.
          </p>
        </div>
      ) : (
        /* Memos List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMemos.map((memo) => (
            <Card
              key={memo.id}
              className="!shadow-none hover:shadow-sm transition-shadow bg-zinc-50 gap-3"
            >
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  {/* Doctor Avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                      {getInitials(
                        memo.creator.firstName,
                        memo.creator.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Doctor Info and Date */}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Dr. {memo.creator.firstName} {memo.creator.lastName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(memo.createdDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(memo.createdDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Memo Content */}
                <div className="bg-white rounded-lg p-4 border-border border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic">
                    &quot;{memo.note}&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientMemos;

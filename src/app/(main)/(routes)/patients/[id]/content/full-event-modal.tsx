import {
  Event,
  EventStatus,
  InviteStatus,
  ConfirmationStatus,
} from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  VideoIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  EyeIcon,
} from "lucide-react";

interface FullEventModalProps {
  event: Event;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const FullEventModal = ({ event, trigger }: FullEventModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case EventStatus.COMPLETED:
        return "default";
      case EventStatus.CONFIRMED:
        return "secondary";
      case EventStatus.CANCELLED:
      case EventStatus.NO_SHOW:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getInviteStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case InviteStatus.ACCEPTED:
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case InviteStatus.DECLINED:
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getConfirmationStatusIcon = (status: ConfirmationStatus) => {
    switch (status) {
      case ConfirmationStatus.CONFIRMED:
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case ConfirmationStatus.CANCELLED:
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <EyeIcon className="w-4 h-4" />
            View Details
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl">{event.title}</SheetTitle>
              <SheetDescription>Event ID: {event.id}</SheetDescription>
            </div>
            <div className="flex gap-2">
              <Badge>{event.type}</Badge>
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Start</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.start)} at {formatTime(event.start)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">End</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.end)} at {formatTime(event.end)}
                </p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div>
            <h4 className="font-medium mb-2">Organizer</h4>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium">
                {event.organizer.firstName} {event.organizer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.organizer.email}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {event.organizer.id}
              </p>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-4 h-4" />
              <h4 className="font-medium">
                Attendees ({event.attendees.length})
              </h4>
            </div>
            <div className="space-y-2">
              {event.attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">
                      {attendee.user.firstName} {attendee.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {attendee.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getInviteStatusIcon(attendee.inviteStatus)}
                    <Badge variant="outline" className="text-xs">
                      {attendee.inviteStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="w-4 h-4" />
              <h4 className="font-medium">Location</h4>
              {event.location.isVirtual && (
                <Badge variant="outline" className="text-xs">
                  Virtual
                </Badge>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium">{event.location.name}</p>
              <p className="text-sm text-muted-foreground">
                {event.location.address}, {event.location.city},{" "}
                {event.location.state} {event.location.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.location.country}
              </p>
              {event.location.meetingLink && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={event.location.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <VideoIcon className="w-4 h-4" />
                      Join Virtual Meeting
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <h4 className="font-medium mb-2">Appointment Details</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge variant="outline">
                    {event.appointment.appointmentType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Confirmation Status</p>
                  <div className="flex items-center gap-2">
                    {getConfirmationStatusIcon(
                      event.appointment.confirmationStatus
                    )}
                    <Badge variant="outline">
                      {event.appointment.confirmationStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground">
                  {event.appointment.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Patient ID</p>
                  <p className="text-sm text-muted-foreground">
                    {event.appointment.patientId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Provider ID</p>
                  <p className="text-sm text-muted-foreground">
                    {event.appointment.providerId}
                  </p>
                </div>
              </div>

              {event.appointment.confirmationDate && (
                <div>
                  <p className="text-sm font-medium">Confirmed On</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.appointment.confirmationDate)} at{" "}
                    {formatTime(event.appointment.confirmationDate)}
                  </p>
                </div>
              )}

              {event.appointment.checkedInDate && (
                <div>
                  <p className="text-sm font-medium">Checked In</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.appointment.checkedInDate)} at{" "}
                    {formatTime(event.appointment.checkedInDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Form Completed:</p>
              {event.formCompleted ? (
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Yes</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <XCircleIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">No</span>
                </div>
              )}
            </div>

            {event.meetingLink && (
              <div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <VideoIcon className="w-4 h-4" />
                    Join Meeting
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FullEventModal;

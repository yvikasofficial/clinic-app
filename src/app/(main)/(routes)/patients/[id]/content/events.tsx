import { Event, EventType, EventStatus, AppointmentType } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import FullEventModal from "./full-event-modal";

const Events = ({
  events,
  isLoading,
}: {
  events: Event[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Filter and sort appointments by date
  const appointments = events
    .filter((event) => event.type === EventType.APPOINTMENT)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No appointments found.</p>
      </div>
    );
  }

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

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case EventStatus.COMPLETED:
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case EventStatus.CANCELLED:
      case EventStatus.NO_SHOW:
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case EventStatus.CONFIRMED:
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getAppointmentTypeColor = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.URGENT_CARE:
        return "destructive";
      case AppointmentType.NEW_PATIENT:
        return "default";
      case AppointmentType.FOLLOW_UP:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {appointments.map((event) => (
          <Card key={event.id} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {formatDate(event.start)} at {formatTime(event.start)} -{" "}
                      {formatTime(event.end)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(event.status)}
                  <Badge variant="outline">{event.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getAppointmentTypeColor(
                        event.appointment.appointmentType
                      )}
                    >
                      {event.appointment.appointmentType.replace("_", " ")}
                    </Badge>
                  </div>
                  {event.appointment.reason && (
                    <p className="text-sm">
                      <span className="font-medium">Reason:</span>{" "}
                      {event.appointment.reason}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4" />
                    <span>
                      {event.organizer.firstName} {event.organizer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPinIcon className="w-4 h-4" />
                    <span>
                      {event.location.isVirtual
                        ? "Virtual"
                        : event.location.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Status */}
              {event.appointment.confirmationStatus !== "CONFIRMED" && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircleIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">
                    Confirmation: {event.appointment.confirmationStatus}
                  </span>
                </div>
              )}
              <FullEventModal event={event} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Events;

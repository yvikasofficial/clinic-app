"use client";

import {
  Alert,
  AlertType,
  AppointmentScheduledData,
  FormSubmittedData,
  MessageReceivedData,
} from "@/types/alert";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface AlertDetailSheetProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlertDetailSheet = ({
  alert,
  isOpen,
  onClose,
}: AlertDetailSheetProps) => {
  if (!alert) return null;

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.FORM_SUBMITTED:
        return "📋";
      case AlertType.APPOINTMENT_SCHEDULED:
        return "📅";
      case AlertType.MESSAGE_RECEIVED:
        return "💬";
      default:
        return "🔔";
    }
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case AlertType.FORM_SUBMITTED:
        return `Form: ${(alert.data as FormSubmittedData).name}`;
      case AlertType.APPOINTMENT_SCHEDULED:
        return `Appointment: ${(alert.data as AppointmentScheduledData).title}`;
      case AlertType.MESSAGE_RECEIVED:
        return "New Message";
      default:
        return "Alert";
    }
  };

  const renderAlertDetails = (alert: Alert) => {
    switch (alert.type) {
      case AlertType.FORM_SUBMITTED:
        const formData = alert.data as FormSubmittedData;
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Form Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Form Name:</span>
                  <span className="text-sm font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(formData.submittedAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient:</span>
                  <span className="text-sm font-medium">
                    {formData.patient.firstName} {formData.patient.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case AlertType.APPOINTMENT_SCHEDULED:
        const appointmentData = alert.data as AppointmentScheduledData;
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Appointment Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Title:</span>
                  <span className="text-sm font-medium">
                    {appointmentData.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start:</span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(appointmentData.start),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">End:</span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(appointmentData.end),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Organizer:</span>
                  <span className="text-sm font-medium">
                    {appointmentData.organizer.firstName}{" "}
                    {appointmentData.organizer.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reason:</span>
                  <span className="text-sm font-medium">
                    {appointmentData.appointment.reason}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium">
                    {appointmentData.appointment.confirmationStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case AlertType.MESSAGE_RECEIVED:
        const messageData = alert.data as MessageReceivedData;
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Message Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-sm text-gray-600 block mb-2">
                    Message:
                  </span>
                  <div className="text-sm font-medium bg-white p-3 rounded border">
                    {messageData.message}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-medium">
                    {messageData.patient.firstName}{" "}
                    {messageData.patient.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Message Type:</span>
                  <span className="text-sm font-medium">
                    {messageData.data.messageType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getAlertIcon(alert.type)}</div>
            <div>
              <SheetTitle className="text-left">
                {getAlertTitle(alert)}
              </SheetTitle>
              <SheetDescription className="text-left">
                Alert Details
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          {/* Alert Status */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Status</h4>
            <div className="flex items-center space-x-2">
              {alert.actionRequired && (
                <Badge variant="destructive">Action Required</Badge>
              )}
              {alert.resolvedDate ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Resolved
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Patient Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">
                  {alert.patient.firstName} {alert.patient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">
                  {alert.patient.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium">
                  {alert.patient.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Type-specific details */}
          {renderAlertDetails(alert)}

          {/* Additional Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Additional Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium">
                  {format(
                    new Date(alert.createdDate),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              {alert.resolvedDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolved:</span>
                  <span className="text-sm font-medium">
                    {format(
                      new Date(alert.resolvedDate),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occurrences:</span>
                <span className="text-sm font-medium">{alert.occurrences}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Assigned Provider:
                </span>
                <span className="text-sm font-medium">
                  {alert.assignedProvider.firstName}{" "}
                  {alert.assignedProvider.lastName}
                </span>
              </div>
              {alert.resolvingProvider && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Resolving Provider:
                  </span>
                  <span className="text-sm font-medium">
                    {alert.resolvingProvider.firstName}{" "}
                    {alert.resolvingProvider.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {alert.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {alert.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlertDetailSheet;

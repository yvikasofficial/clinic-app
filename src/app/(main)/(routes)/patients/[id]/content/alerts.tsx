import {
  Alert,
  AlertType,
  AppointmentScheduledData,
  FormSubmittedData,
  MessageReceivedData,
} from "@/types/alert";
import { format } from "date-fns";
import { useState } from "react";
import AlertDetailSheet from "./alert-detail-sheet";

const Alerts = ({
  alerts,
  isLoading,
}: {
  alerts: Alert[];
  isLoading: boolean;
}) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const getAlertDescription = (alert: Alert) => {
    switch (alert.type) {
      case AlertType.FORM_SUBMITTED:
        const formData = alert.data as FormSubmittedData;
        return `Submitted by ${formData.patient.firstName} ${formData.patient.lastName}`;
      case AlertType.APPOINTMENT_SCHEDULED:
        const appointmentData = alert.data as AppointmentScheduledData;
        return `${format(
          new Date(appointmentData.start),
          "MMM dd, yyyy 'at' h:mm a"
        )}`;
      case AlertType.MESSAGE_RECEIVED:
        const messageData = alert.data as MessageReceivedData;
        return `From ${messageData.patient.firstName} ${messageData.patient.lastName}`;
      default:
        return "";
    }
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSelectedAlert(null);
    setIsSheetOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-[350px] p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[350px] h-[400px] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
          <p className="text-sm text-gray-500">{alerts.length} active alerts</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-500">No alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {getAlertTitle(alert)}
                        </h4>
                        {alert.actionRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Action Required
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {getAlertDescription(alert)}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {format(
                            new Date(alert.createdDate),
                            "MMM dd, h:mm a"
                          )}
                        </span>
                        {alert.occurrences > 1 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {alert.occurrences}x
                          </span>
                        )}
                      </div>

                      {alert.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alert.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {alert.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{alert.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDetailSheet
        alert={selectedAlert}
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
      />
    </>
  );
};

export default Alerts;

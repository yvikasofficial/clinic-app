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
import { AlertCircle } from "lucide-react";

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
        return (alert.data as FormSubmittedData).name;
      case AlertType.APPOINTMENT_SCHEDULED:
        return (alert.data as AppointmentScheduledData).title;
      case AlertType.MESSAGE_RECEIVED:
        return "New Message";
      default:
        return "Alert";
    }
  };

  const getAlertBy = (alert: Alert) => {
    switch (alert.type) {
      case AlertType.FORM_SUBMITTED:
        const formData = alert.data as FormSubmittedData;
        return `${formData.patient.firstName} ${formData.patient.lastName}`;
      case AlertType.APPOINTMENT_SCHEDULED:
        const appointmentData = alert.data as AppointmentScheduledData;
        return `${appointmentData.title}`;
      case AlertType.MESSAGE_RECEIVED:
        const messageData = alert.data as MessageReceivedData;
        return `${messageData.patient.firstName} ${messageData.patient.lastName}`;
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
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[350px]  rounded-lg border border-red-100 shadow-sm">
        <div className="p-2 border-b border-red-100">
          <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Alerts
          </h3>
        </div>

        <div className="h-[354px] overflow-y-auto p-2">
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
                  className="p-3 hover:bg-red-100 transition-colors bg-red-50 cursor-pointer rounded-lg mb-2"
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {getAlertTitle(alert)}
                        </h4>
                        {alert.actionRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                            Action Required
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>By {getAlertBy(alert)}</span>
                        <span>
                          {format(
                            new Date(alert.createdDate),
                            "MMM dd, h:mm a"
                          )}
                        </span>
                      </div>
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

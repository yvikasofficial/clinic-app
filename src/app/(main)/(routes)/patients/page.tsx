"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { Patient, Status } from "@/types/patient";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";
import lodash from "lodash";

ModuleRegistry.registerModules([AllCommunityModule]);

// Status cell renderer for better visual representation
const StatusCellRenderer = ({ value }: { value: Status }) => {
  const statusStyles = {
    [Status.ACTIVE]: "bg-blue-100 text-blue-500",
    [Status.INACTIVE]: "bg-red-100 text-red-800",
  };

  return (
    <Badge
      variant="secondary"
      className={clsx(statusStyles[value], "rounded-sm py-1.5 px-2.5 text-xs")}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {lodash.capitalize(value.toLowerCase())}
      </div>
    </Badge>
  );
};

// Name cell renderer with avatar
const NameCellRenderer = ({ data }: { data: Patient }) => {
  const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(
    0
  )}`.toUpperCase();

  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium leading-[20px]">
            {`${data.firstName} ${data.lastName}`}
          </span>
          <Badge variant="secondary" className="text-xs text-gray-600">
            {data.gender?.toLowerCase() === "male" ? "Male" : "Female"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Format phone number to US format (xxx) xxx-xxxx
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Handle US phone numbers (10 digits) with or without country code
  if (digits.length === 11 && digits.startsWith("1")) {
    // Remove country code if present
    const phoneDigits = digits.slice(1);
    return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(
      3,
      6
    )}-${phoneDigits.slice(6)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return original if not a standard US phone number format
  return phoneNumber;
};

// Contact Details cell renderer
const ContactDetailsCellRenderer = ({ data }: { data: Patient }) => {
  return (
    <div className="py-1">
      <div className="text-sm font-medium">{data.email}</div>
      <div className="text-xs text-gray-500">
        {formatPhoneNumber(data.phoneNumber)}
      </div>
    </div>
  );
};

const MedicalHistoryCellRenderer = ({ value }: { value: string[] }) => {
  if (!value || value.length === 0) {
    return <div className="text-gray-500">N/A</div>;
  }

  const displayItems = value.slice(0, 2);
  const remainingItems = value.slice(2);
  const remainingCount = remainingItems.length;

  return (
    <div className="flex flex-wrap gap-1">
      {displayItems.map((item, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs inline-block max-w-[120px] truncate bg-red-100 text-red-600"
          title={item}
        >
          {item}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs bg-red-100 text-red-600 cursor-help"
            >
              +{remainingCount}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium mb-1">More conditions:</div>
              {remainingItems.map((item, index) => (
                <div key={index} className="text-xs">
                  • {item}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Date of Birth and Age cell renderer
const DateOfBirthCellRenderer = ({ data }: { data: Patient }) => {
  if (!data?.dateOfBirth) {
    return <div className="text-gray-500">N/A</div>;
  }

  const formattedDate = new Date(data.dateOfBirth).toLocaleDateString("en-US");
  const age = calculateAge(data.dateOfBirth);

  return (
    <div className="py-1">
      <div className="text-sm font-medium">{formattedDate}</div>
      <div className="text-xs text-gray-500">{age} years</div>
    </div>
  );
};

const PatientsPage = () => {
  const { data: patients = [], isLoading, error } = useGetPatients();

  // Column definitions for AG Grid
  const columnDefs: ColDef<Patient>[] = useMemo(
    () => [
      {
        headerName: "Name",
        field: "firstName",
        cellRenderer: NameCellRenderer,
        minWidth: 200,
        sort: "asc",
        flex: 1,
      },
      {
        headerName: "Contact Details",
        field: "email",
        cellRenderer: ContactDetailsCellRenderer,
        minWidth: 250,
        sortable: false,
        flex: 1,
      },
      {
        headerName: "Date of Birth",
        field: "dateOfBirth",
        cellRenderer: DateOfBirthCellRenderer,
        width: 200,
      },
      {
        headerName: "Medical History",
        field: "medicalHistory",
        cellRenderer: MedicalHistoryCellRenderer,
        minWidth: 240,
        flex: 1,
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: StatusCellRenderer,
        width: 150,
      },
      {
        headerName: "Created Date",
        field: "createdDate",
        width: 150,
        cellRenderer: ({ value }: { value: string }) =>
          new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  // Default column properties
  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">
          Error loading patients: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all patient information
        </p>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 ag-theme-alpine" style={{ height: "600px" }}>
        <AgGridReact
          rowData={patients}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          rowSelection="single"
          animateRows={true}
          enableCellTextSelection={true}
          suppressCellFocus={true}
          rowHeight={60}
        />
      </div>
    </div>
  );
};

export default PatientsPage;

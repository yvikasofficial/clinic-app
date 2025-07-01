"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useGetPatients } from "@/services/patients/use-get-patients";
import { Patient, Status } from "@/types/patient";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// Status cell renderer for better visual representation
const StatusCellRenderer = ({ value }: { value: Status }) => {
  const statusStyles = {
    [Status.ACTIVE]:
      "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
    [Status.INACTIVE]:
      "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium",
  };

  return <span className={statusStyles[value]}>{value}</span>;
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

const PatientsPage = () => {
  const { data: patients = [], isLoading, error } = useGetPatients();

  // Column definitions for AG Grid
  const columnDefs: ColDef<Patient>[] = useMemo(
    () => [
      {
        headerName: "Name",
        field: "firstName",
        cellRenderer: ({ data }: { data: Patient }) =>
          `${data.firstName} ${data.lastName}`,
        flex: 1,
        minWidth: 150,
        sort: "asc",
      },
      {
        headerName: "Email",
        field: "email",
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: "Phone",
        field: "phoneNumber",
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Age",
        valueGetter: ({ data }) => (data ? calculateAge(data.dateOfBirth) : 0),
        width: 80,
      },
      {
        headerName: "Gender",
        field: "gender",
        width: 100,
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: StatusCellRenderer,
        width: 120,
      },
      {
        headerName: "City",
        field: "city",
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "State",
        field: "state",
        width: 80,
      },
      {
        headerName: "Marital Status",
        field: "maritalStatus",
        width: 140,
      },
      {
        headerName: "Employment",
        field: "employmentStatus",
        width: 140,
      },
      {
        headerName: "Goal Weight",
        field: "goalWeight",
        width: 120,
        cellRenderer: ({ value }: { value: number }) => `${value} lbs`,
      },
      {
        headerName: "Created Date",
        field: "createdDate",
        width: 140,
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
        />
      </div>
    </div>
  );
};

export default PatientsPage;

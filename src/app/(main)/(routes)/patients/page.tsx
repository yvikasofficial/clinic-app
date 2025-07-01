"use client";

import { useGetPatients } from "@/services/patients/use-get-patients";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import PatientsTable from "./content/patients-table";

ModuleRegistry.registerModules([AllCommunityModule]);

const PatientsPage = () => {
  const { data: patients = [], isLoading, error } = useGetPatients();

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
    <div className="flex flex-col h-full p-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">
          Manage and view all patient information
        </p>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 ag-theme-alpine" style={{ height: "600px" }}>
        <PatientsTable patients={patients} />
      </div>
    </div>
  );
};

export default PatientsPage;

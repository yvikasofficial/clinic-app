"use client";

import { useGetPatients } from "@/services/patients/use-get-patients";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import PatientsTable from "./content/patients-table";
import { useState, useMemo } from "react";
import { Patient, Status, Gender } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

ModuleRegistry.registerModules([AllCommunityModule]);

const PatientsPage = () => {
  const { data: patients = [], isLoading, error } = useGetPatients();
  const router = useRouter();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Filter patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter((patient: Patient) => {
      // Search filter (across name, email, phone)
      const matchesSearch =
        searchQuery === "" ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phoneNumber.includes(searchQuery);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;

      // Gender filter
      const matchesGender =
        genderFilter === "all" || patient.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [patients, searchQuery, statusFilter, genderFilter]);

  const handleAddNewPatient = () => {
    router.push("/patients/new");
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all patient information
            </p>
          </div>
          <Button
            onClick={handleAddNewPatient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Patient
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value={Gender.MALE}>Male</SelectItem>
                <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                <SelectItem value={Gender.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 ag-theme-alpine" style={{ height: "600px" }}>
        <PatientsTable patients={filteredPatients} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default PatientsPage;

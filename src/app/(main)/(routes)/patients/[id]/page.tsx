"use client";

import { useGetPatient } from "@/services/patients/use-get-patient";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BasicInformation from "./content/basic-information";
import { Patient } from "@/types/patient";

const PatientPage = () => {
  const { id } = useParams();
  const { data: patient, isLoading, error } = useGetPatient(id as string);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="px-2">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/patients">Patients</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading
                  ? "Loading..."
                  : patient
                  ? `${patient.firstName} ${patient.lastName}`
                  : "Patient"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main content will go here */}
      <BasicInformation patient={patient as Patient} />
    </div>
  );
};

export default PatientPage;

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInformation from "./content/basic-information";
import { Patient } from "@/types/patient";
import MedicalInformation from "./content/medical-information";
import { Calendar, CreditCard, FileText, HeartPulse } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const PatientPage = () => {
  const { id } = useParams();
  const { data: patient, isLoading, error } = useGetPatient(id as string);
  const [activeTab, setActiveTab] = useState("medical");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const tabs = [
    {
      label: "Medical Information",
      value: "medical",
      icon: <HeartPulse />,
      component: <MedicalInformation patient={patient as Patient} />,
    },
    {
      label: "Appointments",
      value: "appointments",
      icon: <Calendar />,
      component: <div>Appointments</div>,
    },
    {
      label: "Memos",
      value: "memos",
      icon: <FileText />,
      component: <div>Memos</div>,
    },
    {
      label: "Doctor Notes",
      value: "doctor-notes",
      icon: <FileText />,
      component: <div>Doctor Notes</div>,
    },
    {
      label: "Payments",
      value: "payments",
      icon: <CreditCard />,
      component: <div>Payments</div>,
    },
  ];

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

      <BasicInformation patient={patient as Patient} />

      {/* Tabs for patient information */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full gap-0 mt-6"
      >
        <TabsList className="bg-transparent p-0 h-aut rounded-none  flex justify-between !mb-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="bg-transparent !w-fit !shadow-none data-[state=active]:bg-transparent border-0 rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-b-foreground"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator className="!mt-0 translate-y-[-1px]" />

        <TabsContent value={activeTab} className="mt-0 py-4 min-h-[80vh]">
          {tabs.find((tab) => tab.value === activeTab)?.component}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientPage;

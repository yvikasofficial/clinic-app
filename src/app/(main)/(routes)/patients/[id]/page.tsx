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
import Events from "./content/events";
import { useGetEventByPatientId } from "@/services/events/use-get-event-by-patinet-id";
import { Event } from "@/types/event";
import { useGetMemoByPatientId } from "@/services/memos/use-get-memo-by-patient-id";
import { Memo } from "@/types/memo";
import PatientMemos from "./content/patient-memos";
import DoctorNotes from "./content/doctor-notes";
import { DoctorNote } from "@/types/doctorNote";
import { useGetDoctorNotesByPatientId } from "@/services/doctorNotes/use-get-doctor-notes-by-patient-id";
import { useGetChargesByPatientId } from "@/services/charges/use-get-charges-by-patient-id";
import { Charge } from "@/types/charge";
import Charges from "./content/charges";
import { useGetAlertsByPatientId } from "@/services/alerts/use-get-alerts-by-patient-id";
import Alerts from "./content/alerts";
import { Alert } from "@/types/alert";

const PatientPage = () => {
  const { id } = useParams();
  const { data: patient, isLoading, error } = useGetPatient(id as string);
  const { data: events, isLoading: eventsLoading } = useGetEventByPatientId(
    id as string
  );
  const { data: memos, isLoading: memosLoading } = useGetMemoByPatientId(
    id as string
  );
  const { data: doctorNotes, isLoading: doctorNotesLoading } =
    useGetDoctorNotesByPatientId(id as string);
  const { data: charges, isLoading: chargesLoading } = useGetChargesByPatientId(
    id as string
  );
  const { data: alerts, isLoading: alertsLoading } = useGetAlertsByPatientId(
    id as string
  );

  const [activeTab, setActiveTab] = useState("medical");

  if (!isLoading && !patient) {
    return <div>Patient not found</div>;
  }

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
      component: (
        <Events events={events as Event[]} isLoading={eventsLoading} />
      ),
    },
    {
      label: "Memos",
      value: "memos",
      icon: <FileText />,
      component: (
        <PatientMemos memos={memos as Memo[]} isLoading={memosLoading} />
      ),
    },
    {
      label: "Doctor Notes",
      value: "doctor-notes",
      icon: <FileText />,
      component: (
        <DoctorNotes
          doctorNotes={doctorNotes as DoctorNote[]}
          isLoading={doctorNotesLoading}
        />
      ),
    },
    {
      label: "Charges",
      value: "charges",
      icon: <CreditCard />,
      component: (
        <Charges charges={charges as Charge[]} isLoading={chargesLoading} />
      ),
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

      <div className="flex gap-4">
        <div className="flex-1">
          <BasicInformation patient={patient as Patient} />
        </div>
        <Alerts alerts={alerts as Alert[]} isLoading={alertsLoading} />
      </div>

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
              className="bg-transparent text-gray-500 !w-fit !shadow-none data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
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

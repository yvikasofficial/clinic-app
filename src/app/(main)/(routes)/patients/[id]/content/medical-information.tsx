"use client";

import React from "react";
import {
  Scale,
  Ruler,
  Heart,
  Target,
  AlertTriangle,
  Users,
  FileText,
  Pill,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { Patient, MeasurementType } from "@/types/patient";

const MedicalInformation = ({ patient }: { patient: Patient }) => {
  // Helper function to get the latest measurement of a specific type
  const getLatestMeasurement = (type: MeasurementType) => {
    const measurements = patient.measurements
      .filter((m) => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return measurements[0] || null;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to convert height from inches to feet and inches
  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  };

  // Get latest measurements
  const latestWeight = getLatestMeasurement(MeasurementType.WEIGHT);
  const latestHeight = getLatestMeasurement(MeasurementType.HEIGHT);
  const latestBloodPressure = getLatestMeasurement(
    MeasurementType.BLOOD_PRESSURE
  );

  // Calculate progress percentage
  const currentWeight = (latestWeight?.value as number) || 0;
  const goalWeight = patient.goalWeight || 0;
  const progressPercentage =
    goalWeight > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((Math.max(currentWeight, goalWeight) -
              Math.abs(currentWeight - goalWeight)) /
              Math.max(currentWeight, goalWeight)) *
              100
          )
        )
      : 0;

  const vitalStats = [
    {
      label: "Current Weight",
      value: latestWeight
        ? `${latestWeight.value} ${latestWeight.unit}`
        : "No data",
      date: latestWeight ? formatDate(latestWeight.date) : "N/A",
      icon: Scale,
      iconColor: "text-blue-600",
    },
    {
      label: "Height",
      value: latestHeight
        ? formatHeight(latestHeight.value as number)
        : "No data",
      date: latestHeight ? formatDate(latestHeight.date) : "N/A",
      icon: Ruler,
      iconColor: "text-green-600",
    },
    {
      label: "Blood Pressure",
      value: latestBloodPressure ? `${latestBloodPressure.value}` : "No data",
      date: latestBloodPressure ? formatDate(latestBloodPressure.date) : "N/A",
      icon: Heart,
      iconColor: "text-red-600",
    },
    {
      label: "Goal Weight",
      value: `${patient.goalWeight} lbs`,
      date: "Target",
      icon: Target,
      iconColor: "text-purple-600",
    },
  ];

  // Get active medications
  const activeMedications = patient.medications.filter((med) => med.active);

  return (
    <div className="">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {vitalStats.map((stat, index) => (
            <div key={index} className="bg-zinc-50 border rounded-lg p-4 ">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {stat.date}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {stat.label}
              </h3>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Medical Information Grid - More compact */}
        <div className="bg-zinc-50 border rounded-lg p-4 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Badges */}
            <div className="space-y-4">
              {/* Allergies */}
              <div>
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  <h3 className="text-base font-semibold text-foreground">
                    Allergies
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.length > 0 ? (
                    <>
                      {patient.allergies.slice(0, 3).map((allergy, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200"
                        >
                          {allergy}
                        </span>
                      ))}
                      {patient.allergies.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                          +{patient.allergies.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                      No known allergies
                    </span>
                  )}
                </div>
              </div>

              {/* Family History */}
              <div>
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-indigo-600 mr-2" />
                  <h3 className="text-base font-semibold text-foreground">
                    Family History
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.familyHistory.length > 0 ? (
                    <>
                      {patient.familyHistory
                        .slice(0, 3)
                        .map((condition, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200"
                          >
                            {condition}
                          </span>
                        ))}
                      {patient.familyHistory.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                          +{patient.familyHistory.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                      No family history recorded
                    </span>
                  )}
                </div>
              </div>

              {/* Medical History */}
              <div>
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-teal-600 mr-2" />
                  <h3 className="text-base font-semibold text-foreground">
                    Medical History
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.medicalHistory.length > 0 ? (
                    <>
                      {patient.medicalHistory
                        .slice(0, 3)
                        .map((condition, index) => (
                          <span
                            key={index}
                            className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-1 rounded-full border border-teal-200"
                          >
                            {condition}
                          </span>
                        ))}
                      {patient.medicalHistory.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                          +{patient.medicalHistory.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border">
                      No medical history recorded
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Active Medications */}
            <div>
              <div className="flex items-center mb-2">
                <Pill className="h-4 w-4 text-pink-600 mr-2" />
                <h3 className="text-base font-semibold text-foreground">
                  Active Medications
                </h3>
              </div>
              <div className="space-y-2">
                {activeMedications.length > 0 ? (
                  activeMedications.map((medication, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3 border">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {medication.name}
                        </h4>
                        <span className="text-xs text-muted-foreground bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                          {medication.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {medication.frequency}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-muted rounded-lg p-3 border">
                    <span className="text-sm font-medium text-muted-foreground">
                      No active medications
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator - More compact */}
        {latestWeight && (
          <div className="mt-6 bg-zinc-50 border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <TrendingDown className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-foreground">
                Weight Progress
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Current</p>
                <p className="text-lg font-bold text-foreground">
                  {currentWeight} lbs
                </p>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {Math.round(progressPercentage)}% progress
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Goal</p>
                <p className="text-lg font-bold text-foreground">
                  {goalWeight} lbs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalInformation;

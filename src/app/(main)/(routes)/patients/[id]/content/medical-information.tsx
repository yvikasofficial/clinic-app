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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Medical Information
          </h1>
          <p className="text-muted-foreground">
            Comprehensive medical overview for {patient.firstName}{" "}
            {patient.lastName}
          </p>
        </div>

        {/* Vital Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {vitalStats.map((stat, index) => (
            <div key={index} className="bg-card border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {stat.date}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Medical Information Grid */}
        <div className="bg-card border rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Badges */}
            <div className="space-y-6">
              {/* Allergies */}
              <div>
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Allergies
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.length > 0 ? (
                    <>
                      {patient.allergies.slice(0, 3).map((allergy, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full border border-orange-200"
                        >
                          {allergy}
                        </span>
                      ))}
                      {patient.allergies.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                          +{patient.allergies.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                      No known allergies
                    </span>
                  )}
                </div>
              </div>

              {/* Family History */}
              <div>
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Family History
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.familyHistory.length > 0 ? (
                    <>
                      {patient.familyHistory
                        .slice(0, 3)
                        .map((condition, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full border border-indigo-200"
                          >
                            {condition}
                          </span>
                        ))}
                      {patient.familyHistory.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                          +{patient.familyHistory.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                      No family history recorded
                    </span>
                  )}
                </div>
              </div>

              {/* Medical History */}
              <div>
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Medical History
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.length > 0 ? (
                    <>
                      {patient.medicalHistory
                        .slice(0, 3)
                        .map((condition, index) => (
                          <span
                            key={index}
                            className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full border border-teal-200"
                          >
                            {condition}
                          </span>
                        ))}
                      {patient.medicalHistory.length > 3 && (
                        <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                          +{patient.medicalHistory.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full border">
                      No medical history recorded
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Active Medications */}
            <div>
              <div className="flex items-center mb-3">
                <Pill className="h-5 w-5 text-pink-600 mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Active Medications
                </h3>
              </div>
              <div className="space-y-3">
                {activeMedications.length > 0 ? (
                  activeMedications.map((medication, index) => (
                    <div key={index} className="bg-muted rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">
                          {medication.name}
                        </h4>
                        <span className="text-sm text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded-full">
                          {medication.dosage}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medication.frequency}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-muted rounded-lg p-4 border">
                    <span className="font-medium text-muted-foreground">
                      No active medications
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {latestWeight && (
          <div className="mt-8 bg-card border rounded-xl p-6">
            <div className="flex items-center mb-4">
              <TrendingDown className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-foreground">
                Weight Progress
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentWeight} lbs
                </p>
              </div>
              <div className="flex-1 mx-6">
                <div className="bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round(progressPercentage)}% progress
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Goal</p>
                <p className="text-2xl font-bold text-foreground">
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

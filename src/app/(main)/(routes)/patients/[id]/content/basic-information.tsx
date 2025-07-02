import { Patient } from "@/types/patient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Briefcase,
  Edit,
} from "lucide-react";
import { calculateAge, formatPhoneNumber } from "@/utils";
import { StatusCellRenderer } from "../../content/patients-table/columns";

const BasicInformation = ({ patient }: { patient: Patient }) => {
  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format marital status for display
  const formatMaritalStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Format employment status for display
  const formatEmploymentStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleEditClick = () => {
    // TODO: Implement edit functionality
    console.log("Edit user information clicked");
  };

  return (
    <Card className="shadow-none h-[400px] bg-zinc-50">
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials(patient.firstName, patient.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {patient.gender.charAt(0) +
                    patient.gender.slice(1).toLowerCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {calculateAge(patient.dateOfBirth)} years old
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex items-center gap-2">
            <StatusCellRenderer value={patient.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Info
            </Button>
          </div>
        </div>

        <Separator />

        {/* Compact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Born</p>
                <p className="text-sm font-medium">
                  {formatDate(patient.dateOfBirth)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{patient.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">
                  {formatPhoneNumber(patient.phoneNumber)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Marital Status</p>
                <p className="text-sm font-medium">
                  {formatMaritalStatus(patient.maritalStatus)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Employment</p>
                <p className="text-sm font-medium">
                  {formatEmploymentStatus(patient.employmentStatus)}
                </p>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{patient.address}</p>
                  {patient.addressLineTwo && (
                    <p className="text-sm text-muted-foreground">
                      {patient.addressLineTwo}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {patient.city}, {patient.state} {patient.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {patient.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformation;

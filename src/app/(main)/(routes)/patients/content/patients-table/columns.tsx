import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Patient, Status } from "@/types/patient";
import clsx from "clsx";
import { formatNumber, parsePhoneNumberWithError } from "libphonenumber-js";
import lodash from "lodash";

// Status cell renderer for better visual representation
export const StatusCellRenderer = ({ value }: { value: Status }) => {
  const statusStyles = {
    [Status.ACTIVE]: "bg-blue-100 text-blue-500",
    [Status.INACTIVE]: "bg-red-100 text-red-500",
  };

  return (
    <Badge
      variant="secondary"
      className={clsx(statusStyles[value], "rounded-sm py-1.5 px-2.5 text-xs")}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={clsx(
            "w-1.5 h-1.5 rounded-full",
            value === Status.ACTIVE ? "bg-blue-500" : "bg-red-500"
          )}
        />
        {lodash.capitalize(value.toLowerCase())}
      </div>
    </Badge>
  );
};

// Name cell renderer with avatar
export const NameCellRenderer = ({ data }: { data: Patient }) => {
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
          <Badge
            variant="secondary"
            className="text-xs text-gray-600 py-0.5 px-1.5 rounded-sm"
          >
            {data.gender?.toLowerCase() === "male" ? "Male" : "Female"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Format phone number to US format (xxx) xxx-xxxx
export const formatPhoneNumber = (phoneNumber: string): string => {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber, "US");
    return parsed ? formatNumber(parsed.number, "NATIONAL") : phoneNumber;
  } catch {
    return "N/A";
  }
};
// Contact Details cell renderer
export const ContactDetailsCellRenderer = ({ data }: { data: Patient }) => {
  return (
    <div className="py-1 flex flex-col gap-0.5">
      <div className="font-medium text-sm">{data.email}</div>
      <div className="text-xs text-gray-500">
        {formatPhoneNumber(data.phoneNumber)}
      </div>
    </div>
  );
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
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
export const DateOfBirthCellRenderer = ({ data }: { data: Patient }) => {
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

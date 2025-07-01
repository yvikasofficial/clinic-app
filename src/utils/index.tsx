import { formatNumber, parsePhoneNumberWithError } from "libphonenumber-js";

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

// Format phone number to US format (xxx) xxx-xxxx
export const formatPhoneNumber = (phoneNumber: string): string => {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber, "US");
    return parsed ? formatNumber(parsed.number, "NATIONAL") : phoneNumber;
  } catch {
    return "N/A";
  }
};

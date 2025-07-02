/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const NEXT_PUBLIC_JSON_BIN_API = process.env.NEXT_PUBLIC_JSON_BIN_API;

// Helper function to make JSONBin API requests
export async function makeJSONBinRequest(
  url: string,
  method: string,
  data?: any,
  apiKey?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add API key to headers if provided
  if (apiKey) {
    headers["X-Master-Key"] = NEXT_PUBLIC_JSON_BIN_API || "";
  }

  // Append /latest to URL if method is GET and /latest is not already present
  const finalUrl =
    method.toUpperCase() === "GET" && !url.includes("/latest")
      ? `${url}/latest`
      : url;

  try {
    const response = await axios({
      url: finalUrl,
      method: method.toLowerCase() as any,
      headers,
      data: data && (method === "PUT" || method === "POST") ? data : undefined,
    });

    return response.data;
  } catch (error: any) {
    console.error("JSONBin API error:", error.response || error);
    throw new Error(
      `JSONBin API error: ${error.response?.status || "Unknown"} ${
        error.response?.statusText || error.message
      }`
    );
  }
}

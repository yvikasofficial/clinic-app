/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper function to make JSONBin API requests
export async function makeJSONBinRequest(
  url: string,
  method: string,
  data?: any
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === "PUT" || method === "POST")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    console.error("JSONBin API error:", response);
    throw new Error(
      `JSONBin API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

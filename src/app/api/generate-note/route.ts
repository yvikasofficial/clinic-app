import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { patient, appointmentData } = await request.json();

    const openRouterApiKey = process.env.NEXT_PUBLIC_OPEN_ROUTER;

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Calculate patient age
    const patientAge = Math.floor(
      (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );

    // Create a prompt for the AI based on patient information
    const prompt = `Generate a comprehensive doctor note for the following patient:

Patient Information:
- Name: ${patient.firstName} ${patient.lastName}
- Age: ${patientAge}
- Gender: ${patient.gender}
- Date of Birth: ${patient.dateOfBirth}
- Phone: ${patient.phoneNumber}
- Medical History: ${patient.medicalHistory?.join(", ") || "None reported"}
- Allergies: ${patient.allergies?.join(", ") || "No known allergies"}
- Current Medications: ${patient.prescriptions?.join(", ") || "None reported"}
- Family History: ${patient.familyHistory?.join(", ") || "Non-contributory"}

${
  appointmentData
    ? `
Appointment Details:
- Date: ${appointmentData.date}
- Type: ${appointmentData.type}
- Reason: ${appointmentData.reason || "Routine visit"}
`
    : ""
}

Please generate a professional medical note following this structure:
1. Chief Complaint
2. History of Present Illness
3. Past Medical History
4. Allergies
5. Current Medications
6. Family History
7. Physical Examination (general findings)
8. Assessment and Plan

Make it professional, detailed, and appropriate for medical documentation.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Patient Note Generator",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free", // You can change this to other models
          messages: [
            {
              role: "system",
              content:
                "You are a professional medical assistant helping to generate doctor notes. Provide accurate, professional, and detailed medical documentation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate note with AI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    // Generate a summary from the content
    const summaryPrompt = `Please provide a brief 2-3 sentence summary of this doctor note:

${generatedContent}`;

    const summaryResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Patient Note Generator",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "user",
              content: summaryPrompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.5,
        }),
      }
    );

    let generatedSummary = `Visit summary for ${patient.firstName} ${patient.lastName}`;

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      generatedSummary =
        summaryData.choices[0]?.message?.content || generatedSummary;
    }

    return NextResponse.json({
      content: generatedContent,
      summary: generatedSummary,
    });
  } catch (error) {
    console.error("Error generating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

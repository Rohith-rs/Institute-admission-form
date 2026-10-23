
import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHmac } from "node:crypto";
import { supabaseServer } from "../../../lib/supabase-server";

const BUCKET = "admission-documents";
const MB = 1024 * 1024;

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const pdfType = "application/pdf";

function textValue(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

function getFile(form: FormData, name: string): File | null {
  const value = form.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "upload";
}

async function uploadFile(
  file: File,
  applicationId: string,
  field: string,
  allowedTypes: string[],
  maxBytes: number
): Promise<string> {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`${field}: unsupported file type.`);
  }

  if (file.size > maxBytes) {
    throw new Error(`${field}: file exceeds the size limit.`);
  }

  const path = `${applicationId}/${field}/${randomUUID()}-${safeFileName(file.name)}`;

  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error(`Supabase upload failed for ${field}:`, error.message);
    throw new Error(`Could not upload ${field}.`);
  }

  return path;
}

async function checkRateLimit(request: NextRequest) {
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!secret) {
    console.error("SUPABASE_SECRET_KEY is not configured.");
    throw new Error("Rate-limit configuration is missing.");
  }

  // Prefer the hosting platform's client IP header.
  // The forwarded header is also used for local/development environments.
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    realIp ||
    forwardedFor?.split(",")[0]?.trim() ||
    "local-development";

  const ipHash = createHmac("sha256", secret)
    .update(clientIp)
    .digest("hex");

  const { data, error } = await supabaseServer.rpc(
    "check_application_rate_limit",
    {
      p_key: ipHash,
      p_limit: 5,
      p_window_seconds: 3600,
    }
  );

  if (error) {
    console.error("Rate-limit check failed:", error.message);
    throw new Error("Rate-limit check unavailable.");
  }

  return data === true;
}

export async function POST(request: NextRequest) {
  const uploadedPaths: string[] = [];

  try {
    // Limit the total request size.
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 35 * MB) {
      return NextResponse.json(
        {
          error:
            "The total upload is too large. Please reduce your file sizes.",
        },
        { status: 413 }
      );
    }

    const form = await request.formData();

    // Basic bot-trap field.
    if (textValue(form, "website")) {
      return NextResponse.json({ message: "Application received." });
    }

    // Limit submission attempts before uploading files.
    let allowed: boolean;

    try {
      allowed = await checkRateLimit(request);
    } catch {
      return NextResponse.json(
        {
          error:
            "We couldn't verify your request right now. Please try again later.",
        },
        { status: 503 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many submission attempts. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": "3600" },
        }
      );
    }

    const email = textValue(form, "email");
    const fullName = textValue(form, "fullName");
    const mobile = textValue(form, "mobile");
    const dob = textValue(form, "dob");
    const location = textValue(form, "location");
    const medium = textValue(form, "medium");
    const applicantType = textValue(form, "applicantType");
    const educationLevel = textValue(form, "educationLevel");
    const college = textValue(form, "college");
    const degreeCourse = textValue(form, "degreeCourse");
    const passingYearText = textValue(form, "passingYear");
    const fatherName = textValue(form, "fatherName");
    const fatherMobile = textValue(form, "fatherMobile");
    const fatherOccupation = textValue(form, "fatherOccupation");
    const motherName = textValue(form, "motherName");
    const motherMobile = textValue(form, "motherMobile");
    const motherOccupation = textValue(form, "motherOccupation");
    const address = textValue(form, "address");
    const learningMode = textValue(form, "learningMode");
    const joiningDate = textValue(form, "joiningDate");
    const termsAccepted = form.get("termsAccepted") === "on";

    const requiredValues = [
      email,
      fullName,
      mobile,
      dob,
      location,
      medium,
      applicantType,
      educationLevel,
      fatherName,
      fatherMobile,
      fatherOccupation,
      motherName,
      address,
      learningMode,
      joiningDate,
    ];

    if (requiredValues.some((value) => !value)) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (fullName.length > 150 || address.length > 2000) {
      return NextResponse.json(
        { error: "Some fields are too long." },
        { status: 400 }
      );
    }

    if (!validDate(dob) || !validDate(joiningDate)) {
      return NextResponse.json(
        { error: "Enter valid dates." },
        { status: 400 }
      );
    }

    if (!["English", "Tamil", "Other"].includes(medium)) {
      return NextResponse.json(
        { error: "Invalid study medium." },
        { status: 400 }
      );
    }

    if (
      !["Student", "Working Professional", "Other"].includes(applicantType)
    ) {
      return NextResponse.json(
        { error: "Invalid applicant type." },
        { status: 400 }
      );
    }

    if (!["School", "Diploma", "Degree", "P.G."].includes(educationLevel)) {
      return NextResponse.json(
        { error: "Invalid education level." },
        { status: 400 }
      );
    }

    const allowedDegreeCourses = [
      "B.E. / B.Tech",
      "B.Sc.",
      "B.Com.",
      "B.A.",
      "BCA",
      "BBA",
      "B.Des.",
      "M.E. / M.Tech",
      "M.Sc.",
      "M.Com.",
      "M.A.",
      "MCA",
      "MBA",
      "Diploma",
      "Other",
    ];

    if (
      degreeCourse &&
      !allowedDegreeCourses.includes(degreeCourse)
    ) {
      return NextResponse.json(
        { error: "Invalid degree or course selection." },
        { status: 400 }
      );
    }

    if (
      ![
        "Offline Chennai",
        "Offline Bengaluru",
        "Online from Anywhere",
      ].includes(learningMode)
    ) {
      return NextResponse.json(
        { error: "Invalid learning mode." },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the terms." },
        { status: 400 }
      );
    }

    const passingYear = passingYearText
      ? Number(passingYearText)
      : null;

    if (
      passingYear !== null &&
      (!Number.isInteger(passingYear) ||
        passingYear < 1950 ||
        passingYear > 2100)
    ) {
      return NextResponse.json(
        { error: "Enter a valid passing year." },
        { status: 400 }
      );
    }

    const professionalPhoto = getFile(form, "professionalPhoto");
    const casualPhotos = form.getAll("casualPhotos").filter(
      (item): item is File => item instanceof File && item.size > 0
    );
    const studentId = getFile(form, "studentId");
    const aadhaarPdf = getFile(form, "aadhaarPdf");
    const signaturePdf = getFile(form, "signaturePdf");

    if (!professionalPhoto || !aadhaarPdf || !signaturePdf) {
      return NextResponse.json(
        {
          error:
            "Professional photo, Aadhaar PDF and signature PDF are required.",
        },
        { status: 400 }
      );
    }

    if (casualPhotos.length > 8) {
      return NextResponse.json(
        { error: "You can upload up to 8 casual photos." },
        { status: 400 }
      );
    }

    const allFiles = [
      professionalPhoto,
      ...casualPhotos,
      ...(studentId ? [studentId] : []),
      aadhaarPdf,
      signaturePdf,
    ];

    if (allFiles.some((file) => file.size > 10 * MB)) {
      return NextResponse.json(
        { error: "Each file must be 10 MB or smaller." },
        { status: 400 }
      );
    }

    if (
      aadhaarPdf.type !== pdfType ||
      signaturePdf.type !== pdfType ||
      signaturePdf.size > 1 * MB
    ) {
      return NextResponse.json(
        {
          error:
            "Aadhaar must be a PDF up to 10 MB; signature must be a PDF up to 1 MB.",
        },
        { status: 400 }
      );
    }

    if (
      !imageTypes.includes(professionalPhoto.type) ||
      casualPhotos.some((file) => !imageTypes.includes(file.type)) ||
      (studentId && ![...imageTypes, pdfType].includes(studentId.type))
    ) {
      return NextResponse.json(
        {
          error:
            "Please upload supported image files and a valid student ID image or PDF.",
        },
        { status: 400 }
      );
    }

    const applicationId = randomUUID();

    const professionalPath = await uploadFile(
      professionalPhoto,
      applicationId,
      "professional-photo",
      imageTypes,
      5 * MB
    );
    uploadedPaths.push(professionalPath);

    const casualPaths: string[] = [];

    for (const photo of casualPhotos) {
      const path = await uploadFile(
        photo,
        applicationId,
        "casual-photo",
        imageTypes,
        5 * MB
      );
      casualPaths.push(path);
      uploadedPaths.push(path);
    }

    let studentIdPath: string | null = null;

    if (studentId) {
      studentIdPath = await uploadFile(
        studentId,
        applicationId,
        "student-id",
        [...imageTypes, pdfType],
        10 * MB
      );
      uploadedPaths.push(studentIdPath);
    }

    const aadhaarPath = await uploadFile(
      aadhaarPdf,
      applicationId,
      "aadhaar",
      [pdfType],
      10 * MB
    );
    uploadedPaths.push(aadhaarPath);

    const signaturePath = await uploadFile(
      signaturePdf,
      applicationId,
      "signature",
      [pdfType],
      1 * MB
    );
    uploadedPaths.push(signaturePath);

    const { data: insertedApplication, error: insertError } =
      await supabaseServer
        .from("applications")
        .insert({
          id: applicationId,
          email,
          full_name: fullName,
          mobile_number: mobile,
          date_of_birth: dob,
          location,
          previous_study_medium: medium,
          applicant_type: applicantType,
          education_level: educationLevel,
          college_name: college || null,
          degree_course: degreeCourse || null,
          year_of_passing: passingYear,
          student_id_file_path: studentIdPath,
          father_name: fatherName,
          father_mobile: fatherMobile,
          father_occupation: fatherOccupation,
          mother_name: motherName,
          mother_mobile: motherMobile || null,
          mother_occupation: motherOccupation || null,
          address,
          learning_mode:
            learningMode === "Offline Chennai"
              ? "offline_chennai"
              : learningMode === "Offline Bengaluru"
                ? "offline_bengaluru"
                : "online",
          joining_date: joiningDate,
          professional_photo_path: professionalPath,
          casual_photo_paths: casualPaths,
          aadhaar_pdf_path: aadhaarPath,
          signature_pdf_path: signaturePath,
          terms_accepted: true,
        })
        .select("application_number")
        .single();

    if (insertError || !insertedApplication) {
      console.error(
        "Application database insert failed:",
        insertError?.message
      );
      throw new Error("Application could not be saved. Please try again.");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your application has been received.",
        applicationId,
        applicationNumber: insertedApplication.application_number,
      },
      { status: 201 }
    );
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabaseServer.storage
        .from(BUCKET)
        .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "Failed to clean up uploaded files:",
          cleanupError.message
        );
      }
    }

    console.error(
      "Application submission failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error &&
          error.message.startsWith("Could not upload ")
            ? error.message
            : "Submission failed. Please try again.",
      },
      { status: 400 }
    );
  }
}

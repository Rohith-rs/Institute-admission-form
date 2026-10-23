
"use client";

import { useRef, useState, type FormEvent } from "react";

const STEP_TITLES = [
  "Personal details",
  "Education details",
  "Family details",
  "Course and joining",
  "Required documents",
  "Terms and conditions",
];

export default function AdmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  function validateStep(stepIndex: number) {
    const step = formRef.current?.querySelector<HTMLElement>(
      `[data-step="${stepIndex}"]`
    );

    if (!step) return false;

    const fields = Array.from(
      step.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea"
      )
    );

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  }

  function goToNextStep() {
    if (!validateStep(currentStep)) return;

    setErrorMessage("");
    setCurrentStep((step) => Math.min(step + 1, STEP_TITLES.length - 1));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPreviousStep() {
    setErrorMessage("");
    setCurrentStep((step) => Math.max(step - 1, 0));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F4] px-4 py-8 text-[#242424] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
<header className="mb-8 rounded-2xl bg-slate-950 p-8 text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Institute Admission Form
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Student Admission Form
          </h1>

          <p className="mt-3 text-purple-100">
            Complete your details and prepare your documents for admission.
          </p>

          <p className="mt-5 text-sm text-purple-200">
            Fields marked * are required.
          </p>
        </header>

        {submitted ? (
          <div className="rounded-2xl border border-green-200 bg-white p-8">
            <h2 className="text-xl font-bold text-green-700">
              Application submitted successfully!
            </h2>

            <p className="mt-2 text-slate-600">
              Your application has been received. Please keep a record of your
              application reference for future communication.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setErrorMessage("");
              }}
              className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-white"
            >
              Return to form
            </button>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  Step {currentStep + 1} of {STEP_TITLES.length}
                </p>

                
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Form progress"
                aria-valuemin={1}
                aria-valuemax={STEP_TITLES.length}
                aria-valuenow={currentStep + 1}
              >
                <div
                  className="h-full rounded-full bg-[#5D00D2] transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / STEP_TITLES.length) * 100}%`,
                  }}
                />
              </div>

           
        
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6"
            >
              {/* Step 1: Personal details */}
              <section
                data-step="0"
                hidden={currentStep !== 0}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">01. Personal details</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Email address"
                    name="email"
                    type="email"
                    required
                  />

                  <Field
                    label="Your full name"
                    name="fullName"
                    required
                  />

                  <Field
                    label="Your mobile number"
                    name="mobile"
                    type="tel"
                    required
                  />

                  <Field
                    label="Date of birth"
                    name="dob"
                    type="date"
                    required
                  />

                  <Field label="City" name="location" required />

                  <SelectField
                    label="Medium of previous study"
                    name="medium"
                    options={["English", "Tamil", "Other"]}
                    required
                  />

                  <SelectField
                    label="I am a"
                    name="applicantType"
                    options={["Student", "Working Professional", "Other"]}
                    required
                  />

                  <FileField
                    label="Professional photo"
                    name="professionalPhoto"
                    accept="image/jpeg,image/png,image/webp"
                    hint="Choose one professional photo."
                    required
                  />

                  <FileField
                    label="Casual social media photos"
                    name="casualPhotos"
                    accept="image/jpeg,image/png,image/webp"
                    hint="You can select multiple images."
                    multiple
                  />
                </div>
              </section>

              {/* Step 2: Education details */}
              <section
                data-step="1"
                hidden={currentStep !== 1}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">02. Education details</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="I have completed / am pursuing"
                    name="educationLevel"
                    options={["School", "Diploma", "Degree", "P.G."]}
                    required
                  />

                  <SelectField
  label="Degree / Course Studied"
  name="degreeCourse"
  options={[
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
  ]}
/>

                  <Field
                    label="Name of college / institution"
                    name="college"
                  />

                  <SelectField
  label="Year of passing"
  name="passingYear"
  options={Array.from(
    { length: 2027 - 1950 + 1 },
    (_, index) => String(2027 - index)
  )}
/>

                  <FileField
                    label="Student ID card"
                    name="studentId"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    hint="Image or PDF."
                  />
                </div>
              </section>

              {/* Step 3: Family details */}
              <section
                data-step="2"
                hidden={currentStep !== 2}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">03. Family details</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Father's name"
                    name="fatherName"
                    required
                  />

                  <Field
                    label="Father's mobile number"
                    name="fatherMobile"
                    type="tel"
                    required
                  />

                  <Field
                    label="Father's occupation"
                    name="fatherOccupation"
                    required
                  />

                  <Field
                    label="Mother's name"
                    name="motherName"
                    required
                  />

                  <Field
                    label="Mother's mobile number"
                    name="motherMobile"
                    type="tel"
                  />

                  <Field
                    label="Mother's occupation"
                    name="motherOccupation"
                  />
                </div>

                <label className="block text-sm font-medium">
                  Residential address *
                  <textarea
                    name="address"
                    required
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-slate-950"
                  />
                </label>
              </section>

              {/* Step 4: Course and joining */}
              <section
                data-step="3"
                hidden={currentStep !== 3}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">04. Course and joining</h2>

                <SelectField
                  label="Mode of learning"
                  name="learningMode"
                  options={[
                    "Offline Chennai",
                    "Offline Bengaluru",
                    "Online from Anywhere",
                  ]}
                  required
                />

                <Field
                  label="Joining date"
                  name="joiningDate"
                  type="date"
                  required
                />

                <p className="text-sm text-slate-500">
                  Select your complete joining date, including day, month and
                  year.
                </p>
              </section>

              {/* Step 5: Required documents */}
              <section
                data-step="4"
                hidden={currentStep !== 4}
                className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">05. Required documents</h2>

                <FileField
                  label="Aadhaar card PDF"
                  name="aadhaarPdf"
                  accept="application/pdf"
                  hint="PDF only. Maximum 10 MB."
                  required
                  maxSizeMB={10}
                />

                <FileField
                  label="Signature PDF"
                  name="signaturePdf"
                  accept="application/pdf"
                  hint="PDF only. Maximum 1 MB. Name your signature file before uploading."
                  required
                  maxSizeMB={1}
                />
              </section>

              {/* Step 6: Terms and conditions */}
              <section
                data-step="5"
                hidden={currentStep !== 5}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">
                  06. Terms and conditions
                </h2>

                <a
                  href="/refund-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-blue-700 underline"
                >
                  Read Fee Cancellation &amp; Refund Policy
                </a>

                <label className="mt-5 flex items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    required
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    I accept the Terms &amp; Conditions and commit towards my
                    design journey. *
                  </span>
                </label>
              </section>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0 || isSubmitting}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                {currentStep < STEP_TITLES.length - 1 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save and continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit application"}
                  </button>
                )}
              </div>

              {currentStep === STEP_TITLES.length - 1 && (
                <p className="text-center text-sm text-slate-500">
                  Your application will be submitted securely.
                </p>
              )}
            </form>
          </>
        )}

        <footer className="mt-8 text-center text-sm text-slate-500">
          Institute Admission Form · Student Admissions
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  const isMobile = type === "tel";
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const mobileError =
    isMobile &&
    touched &&
    (required || value.length > 0) &&
    value.length !== 10;

  return (
    <label className="block text-sm font-medium">
      {label}
      {required ? " *" : ""}

      <input
        name={name}
        type={isMobile ? "text" : type}
        inputMode={isMobile ? "numeric" : undefined}
        autoComplete={isMobile ? "tel-national" : undefined}
        required={required}
        min={min}
        max={max}
        pattern={isMobile ? "[0-9]{10}" : undefined}
        maxLength={isMobile ? 10 : undefined}
        value={isMobile ? value : undefined}
        onChange={
          isMobile
            ? (event) => {
                const numbersOnly = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setValue(numbersOnly);
              }
            : undefined
        }
        onBlur={
          isMobile
            ? () => setTouched(true)
            : undefined
        }
        aria-invalid={mobileError || undefined}
        className={`mt-2 w-full rounded-lg border bg-white p-3 outline-none ${
          mobileError
            ? "border-red-500 focus:border-red-500"
            : "border-slate-300 focus:border-slate-950"
        }`}
      />

      {mobileError && (
        <p className="mt-2 text-sm text-red-600">
          Mobile number must contain exactly 10 digits.
        </p>
      )}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block min-w-0 text-sm font-medium text-[#444444]">
      {label}
      {required ? " *" : ""}

      <select
        name={name}
        required={required}
        defaultValue=""
        className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-[#242424] outline-none focus:border-slate-400 focus:ring-0"
      >
        <option value="" disabled>
          Select an option
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileField({
  label,
  name,
  accept,
  hint,
  required = false,
  multiple = false,
  maxSizeMB,
}: {
  label: string;
  name: string;
  accept: string;
  hint: string;
  required?: boolean;
  multiple?: boolean;
  maxSizeMB?: number;
}) {
  const [error, setError] = useState("");

  return (
    <label className="block text-sm font-medium">
      {label}
      {required ? " *" : ""}

      <input
        name={name}
        type="file"
        accept={accept}
        required={required}
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);

          const oversized = files.find(
            (file) => maxSizeMB && file.size > maxSizeMB * 1024 * 1024
          );

          if (oversized) {
            setError(`${oversized.name} exceeds ${maxSizeMB} MB.`);
            event.target.value = "";
          } else {
            setError("");
          }
        }}
        className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2"
      />

      <span className="mt-2 block text-xs font-normal text-slate-500">
        {hint}
      </span>

      {error && (
        <span className="mt-2 block text-sm font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

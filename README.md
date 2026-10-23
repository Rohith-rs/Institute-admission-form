# Institute Admission Form

A multi-step web application for collecting student admission details and supporting documents, built with Next.js, TypeScript, React, and Supabase.

## Overview

The Institute Admission Form is a web application designed to simplify the student admission process by collecting applicant information through a structured, multi-step form.

The application includes frontend input handling, server-side request processing, file uploads, and database integration. It is presented here as a portfolio project to demonstrate full-stack web development and the integration of a web application with a backend service.

**Portfolio note:** This repository is a demonstration of the application's implementation. Production credentials, private applicant data, and company-specific configuration must not be included.

## Features

- Multi-step student admission form.
- Personal and contact information collection.
- Educational background details.
- Family information and address collection.
- Course and joining information.
- Supporting document uploads.
- Frontend and server-side input validation.
- Supabase database integration.
- Supabase Storage integration for uploaded documents.
- API endpoint for processing application submissions.
- Environment-based configuration for local development.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework and server-side API |
| React | User interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Interface styling |
| Supabase | Database and file storage services |
| `@supabase/supabase-js` | Supabase client integration |
| ESLint | Code quality checks |
| Git and GitHub | Version control and source code hosting |
| Vercel | Supported deployment platform |

## Application Flow

1. The applicant opens the admission form.
2. The applicant enters personal, educational, family, and course information.
3. The applicant uploads the required supporting documents.
4. The frontend submits the form to the backend API.
5. The API validates the request and processes the document uploads.
6. The application record is inserted into the Supabase database.
7. The API returns a response indicating the result of the submission.

## Architecture

```text
Applicant
   |
   v
Next.js Frontend
   |
   v
POST /api/applications
   |
   +----------------------+
   |                      |
   v                      v
Supabase Storage     Supabase Database
   |                      |
   v                      v
Uploaded Documents   Application Record
```

The backend API handles application submission and uses server-side Supabase configuration for privileged operations.

## Project Structure

```text
Institute-admission-form/
├── app/
│   ├── api/
│   │   └── applications/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase-server.ts
│   └── supabase.ts
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Prerequisites

Before running the application, install:

- Node.js with npm.
- Git.
- A Supabase account and a project configured for this application.

Use a separate development Supabase project rather than connecting this portfolio copy to a production database.

## Getting Started

### 1. Clone the repository

After this project is published, clone it using your personal repository URL:

```bash
git clone YOUR_PERSONAL_REPOSITORY_URL
cd Institute-admission-form
```

Replace the placeholder URL with the actual repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file from the supplied template:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure the values for your own Supabase project.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_server_side_secret_key
```

Use the actual variable names required by the application. Keep real values in `.env.local` only.

**Security requirements:**

- Never commit `.env.local`.
- Never place the Supabase secret key in client-side code.
- Never share production credentials in screenshots, logs, or documentation.
- Use fictional test data when demonstrating the project.

### 4. Configure Supabase

The application expects a Supabase backend configured to support its database and file-upload workflow.

Before submitting a test application:

1. Create a separate Supabase development project.
2. Configure the environment variables.
3. Create the required database table and columns to match the API implementation.
4. Create the Storage bucket named `admission-documents`.
5. Configure appropriate database and Storage access policies.
6. Verify the server-side API's permissions and upload behaviour.

The complete database schema and access policies should be documented from the actual implementation before being treated as a ready-to-run setup. Do not use real student information for testing.

### 5. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

The application will run locally while the development server is active.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server after a successful build |
| `npm run lint` | Run ESLint |

## API Reference

### Submit an application

**Endpoint:** `/api/applications`

**Method:** `POST`

**Content type:** `multipart/form-data`

The endpoint processes the admission form submission, validates supported inputs, handles document uploads, and attempts to insert the application record into Supabase.

The API generates a UUID application identifier in the implementation reviewed for this project.

The complete list of accepted fields, validation rules, file restrictions, response codes, and database columns should be verified against `app/api/applications/route.ts`.

## Security Considerations

Security is an essential part of an application that handles personal information and supporting documents.

- Keep all secrets outside version control.
- Use server-side configuration for privileged database operations.
- Apply appropriate Supabase Row Level Security policies.
- Restrict document access to authorised users.
- Validate all incoming data on the server.
- Apply file type and file size restrictions.
- Use synthetic applicant data during development and testing.
- Avoid exposing sensitive information in error messages and logs.
- Rotate credentials if they have been exposed.
- Obtain permission before publishing company-owned source code publicly.

This repository should not be treated as a production-ready deployment until its security configuration, database policies, abuse prevention, and operational requirements have been reviewed.

## Testing and Validation

Before using the application in a new environment, verify:

- The form loads successfully.
- Required fields are validated.
- Invalid file types and oversized files are rejected.
- Application submissions are processed correctly.
- Uploaded documents are stored in the intended private bucket.
- Database records are created correctly.
- Error cases are handled appropriately.
- The production build completes successfully.

## Future Improvements

Potential future enhancements include:

- An internal admissions management dashboard.
- Secure staff authentication and role-based permissions.
- Application search, filtering, and status tracking.
- Counsellor assignment and follow-up management.
- Application reporting and analytics.
- Improved audit logging and abuse prevention.

These are proposed enhancements and should not be interpreted as existing features.

## Learning Outcomes

This project provides experience with:

- Building multi-step forms using React and Next.js.
- Structuring a full-stack web application.
- Creating backend API routes.
- Integrating Supabase with a web application.
- Processing multipart form submissions and file uploads.
- Managing environment configuration.
- Applying input validation and security practices.
- Using Git and GitHub for version control.

## Author

**Rohith R S**

This project is included in my software development portfolio to demonstrate my work with web application development, database integration, and backend API implementation.

## License

A license should be added only after confirming that public distribution of the source code is authorised. Do not assume that company-owned code can be redistributed under an open-source license.

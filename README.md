# Assignment Desk - Assignment Management System

Assignment Desk is a robust, full-stack web application designed for educational institutions to manage courses, assignments, and student submissions. The system supports three primary user roles: **Admin**, **Teacher**, and **Student**, each with a dedicated dashboard and role-specific permissions.

---

## 🏗️ Project Architecture

The project is divided into two main parts:
1. **Backend**: An ASP.NET Core Web API built with .NET 8, following Clean Architecture principles (Domain, Application, Infrastructure, and API layers).
2. **Frontend**: A Next.js 14 client application using TypeScript, React Context, and premium Vanilla CSS styling.

### Repository Structure
```text
Assignment-Desk/
├── Assignment Desk.sln               # .NET Solution File
├── Assignment Desk/                  # Backend API Layer (Controllers, Middlewares, Configuration)
├── AssignmentDesk.Application/       # Application Logic (Services, Interfaces, DTOs, Mapping)
├── AssignmentDesk.Domain/            # Enterprise Domain Layer (Entities, Enums)
├── AssignmentDesk.Infrastructure/    # Data Access Layer (DB Context, Repositories, Migrations)
├── AssignmentDesk.Tests/             # Unit and Integration Tests (xUnit)
└── frontend/                         # Next.js 14 Web Application
```

---

## 🛠️ Technology Stack

### Backend
*   **Core Framework**: ASP.NET Core Web API (.NET 8.0)
*   **Database**: PostgreSQL
*   **ORM**: Entity Framework Core (EF Core) with PostgreSQL Provider
*   **Logging**: Serilog (Console & daily rolling file logs)
*   **Mapping**: AutoMapper
*   **Security & Authentication**: JWT Bearer Tokens (Role-based authorization)
*   **Documentation**: Swagger / OpenAPI
*   **Testing**: xUnit, Moq, FluentAssertions

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Vanilla CSS (Tailored variables, dark/light glassmorphism)
*   **State Management**: React Context (`AuthContext` for JWT authentication)
*   **Routing Guard**: Next.js Middleware (Role validation and token expiration checks)
*   **Icons**: Custom SVGs / Lucide-style vectors

---

## 🌟 Key Features

### 👤 Admin Panel
*   **Dashboard**: High-level statistics (total students, teachers, classes, subjects, recent assignments, recent submissions).
*   **User Management**: Create, edit, and delete teachers and students.
*   **Class & Subject Configuration**: Add, edit, and delete classes/subjects.
*   **Teacher-Subject Association**: Map teachers to specific subjects and classes.
*   **Student Enrollment**: Enroll students in their respective classes.

### 👨‍🏫 Teacher Portal
*   **Dashboard**: Overview of classes, assignments created, and pending submissions.
*   **Assignment Management**: Create, edit, publish, and delete assignments with deadline dates, files, and marks.
*   **Submissions Review**: View student submissions, open submitted PDF attachments, grade submissions, and provide text feedback.

### 🎓 Student Portal
*   **Dashboard**: Overview of active assignments, upcoming deadlines, and graded reviews.
*   **Assignment Hub**: View list of assigned tasks and deadlines.
*   **Submission Center**: Upload and submit files (PDF format) for assignments, resubmit before deadlines, and check grading feedback.

---

## ⚙️ Prerequisites

Before running the application locally, make sure you have the following installed:
- [**.NET 8.0 SDK**](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [**Node.js (v18.x or later)**](https://nodejs.org/)
- [**PostgreSQL Database**](https://www.postgresql.org/)

---

## 🚀 Getting Started

### 1. Database Configuration
1. Start your local PostgreSQL server.
2. Open `Assignment Desk/Assignment Desk/appsettings.json`.
3. Update the `DefaultConnection` connection string under `ConnectionStrings` with your PostgreSQL server credentials:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=AssignmentManagementDb;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
   }
   ```

### 2. Run the Backend API
1. Navigate to the backend project root folder.
2. Build the solution and run the API:
   ```bash
   dotnet build
   dotnet run --project "Assignment Desk"
   ```
3. The backend will automatically apply migrations, seed the initial Administrator account (`admin@school.com` / `Admin@12345`), and start listening on:
   - **HTTPS**: `https://localhost:7156`
   - **HTTP**: `http://localhost:5145`
4. Access Swagger documentation at `https://localhost:7156/swagger/index.html` to explore the API endpoints.

### 3. Run the Frontend App
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Configure your local environment file: Create a `.env.local` file inside the `frontend/` directory:
   ```env
   BACKEND_URL=http://localhost:5145
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `https://localhost:3000`.

---

## 🛡️ HTTPS & Security in Development

*   **Next.js HTTPS Support**: The frontend is configured to run on HTTPS out of the box using `--experimental-https`. Ensure you accept the development certificate in the browser upon first load.
*   **CORS Configuration**: The backend restricts cross-origin resource sharing to `http://localhost:3000` and `https://localhost:3000` for security.
*   **Self-Signed SSL Proxy**: In development, Next.js ignores self-signed certificate validation via `cross-env NODE_TLS_REJECT_UNAUTHORIZED=0` to allow seamless proxying of `/api/*` and `/uploads/*` requests to the HTTPS backend endpoint.

---

## 🧪 Running Tests

Unit tests are written in the `AssignmentDesk.Tests` project. To run all backend tests, execute:
```bash
dotnet test
```

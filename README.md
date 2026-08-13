# 🎓 Assignment Desk - Assignment Management System

> [!IMPORTANT]
> 🚀 **Live Demo URL**: [https://assignmentdesk.vercel.app/login](https://assignmentdesk.vercel.app/login)

Assignment Desk is a robust, full-stack enterprise web application designed for educational institutions to manage courses, assignments, and student submissions. The system supports three primary user roles: **Admin**, **Teacher**, and **Student**, each with a dedicated dashboard, custom metrics, and role-specific permissions.

---

## 🏗️ Project Architecture

The project is built following Clean Architecture principles, ensuring scalability, maintainability, and clean separation of concerns.

### Repository Structure
```text
Assignment-Desk/
├── Assignment Desk.sln               # .NET Solution File
├── Assignment Desk/                  # Backend API Layer (Controllers, Middlewares, App Startup)
├── AssignmentDesk.Application/       # Application Logic (Services, Interfaces, DTOs, Mapping)
├── AssignmentDesk.Domain/            # Domain Layer (Entities, Enums, Exceptions)
├── AssignmentDesk.Infrastructure/    # Data Access Layer (DB Context, Repositories, Migrations, Seed)
├── AssignmentDesk.Tests/             # Unit and Integration Tests (xUnit, Moq, FluentAssertions)
└── frontend/                         # Next.js 14 Client App (App Router, TS, Vanilla CSS)
```

---

## 🛠️ Technology Stack

### Backend API
*   **Core Framework**: ASP.NET Core Web API (.NET 8.0)
*   **Database**: PostgreSQL
*   **ORM**: Entity Framework Core (EF Core) with Npgsql Provider
*   **Logging**: Serilog (Console & rolling daily file logging)
*   **Mapping**: AutoMapper
*   **Authentication**: JWT Bearer Tokens (Role-based security)
*   **Documentation**: Swagger / OpenAPI
*   **Unit Testing**: xUnit, Moq, FluentAssertions

### Frontend Client
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Premium Vanilla CSS (custom variables, modern dark/light glassmorphism)
*   **State Management**: React Context (`AuthContext` for JWT authentication)
*   **Route Protection**: Next.js Middleware (Role validation and token expiration checks)

---

## 🌟 Main Features

### 👤 Admin Panel
*   **Dashboard**: High-level statistics (total students, teachers, classes, subjects, recent assignments, recent submissions).
*   **User Management**: Create, edit, and delete teachers and students.
*   **Class & Subject Configuration**: Add, edit, and delete classes/subjects.
*   **Teacher-Subject Association**: Map teachers to specific subjects and classes.
*   **Student Enrollment**: Enroll students in their respective classes.

### 👨‍🏫 Teacher Portal
*   **Dashboard**: Overview of classes, assignments created, and pending submissions.
*   **Assignment Management**: Create, edit, publish, and delete assignments with deadline dates, PDF files, and marks.
*   **Submissions Review**: View student submissions, open submitted PDF attachments, grade submissions, and provide text feedback.

### 🎓 Student Portal
*   **Dashboard**: Overview of active assignments, upcoming deadlines, and graded reviews.
*   **Assignment Hub**: View list of assigned tasks and deadlines.
*   **Submission Center**: Upload and submit files (PDF format) for assignments, resubmit before deadlines, and check grading feedback.

### ✉️ Email Integration & Authentication
*   **New User Password Setup**: When a new user (Teacher or Student) is created by the Admin, the system automatically sends an email containing a secure invitation link, enabling the user to set up their own password.
*   **Forgot Password Recovery**: Users can request a password reset from the login screen. The system sends a verification link via email, allowing them to securely reset and recover their password.

---

## ⚙️ Prerequisites

Before running the application locally, make sure you have the following installed:
- [**.NET 8.0 SDK**](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [**Node.js (v18.x or later)**](https://nodejs.org/)
- [**PostgreSQL Database Server**](https://www.postgresql.org/)

---

## 💾 Database Setup Instructions

To set up the database without manually creating tables or collections, you can use one of the two methods below:

### Method A: Restore database from `backup.sql` (Recommended)
This restores the database schema along with complete demo data (including pre-configured Admin, Teacher, and Student accounts).

1. Ensure PostgreSQL server is running.
2. Run the following command in your terminal (adjust credentials and file path if necessary):
   ```bash
   psql -U postgres -d assignmentmanagementdb --no-owner -f backup.sql
   ```
3. Update the database connection string in your backend configuration as described in the **Environment Configuration** section below.

### Method B: Run Entity Framework Migrations
If you want to start with a fresh, empty database, you can run migrations directly:

1. Open your terminal in the backend root directory.
2. Run the database update command:
   ```bash
   dotnet ef database update --project AssignmentDesk.Infrastructure --startup-project "Assignment Desk"
   ```
3. The backend database schema will be generated, and the system will automatically seed the initial Administrator account (`admin@assignmentdesk.com` / `admin@123`).

---

## 🔒 Environment Configuration

Do not upload real passwords, API keys, or other sensitive information to production. Use `.env` or `appsettings.json` local configurations.

### 1. Backend Configuration (`Assignment Desk/appsettings.json`)
Configure your PostgreSQL Connection String under the `ConnectionStrings` section:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=AssignmentManagementDb;Username=postgres;Password=YOUR_DATABASE_PASSWORD"
}
```

### 2. Frontend Configuration (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend/` directory (refer to [frontend/.env.example](file:///c:/Users/Rifatul/Desktop/Assignment-Desk/Assignment%20Desk/frontend/.env.example)):

```env
BACKEND_URL=http://localhost:5145
```

---

## 🚀 Easy Local Setup Instructions

### 1. Run the Backend API
1. Navigate to the backend project root folder:
   ```bash
   dotnet build
   dotnet run --project "Assignment Desk"
   ```
2. The backend will start and listen on:
   - **HTTPS**: `https://localhost:7156`
   - **HTTP**: `http://localhost:5145`
3. Access the interactive Swagger UI documentation at:
   `https://localhost:7156/swagger/index.html`

### 2. Run the Frontend Client
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   `http://localhost:3000` or `https://localhost:3000` (The system is configured to run on HTTPS out of the box using `--experimental-https`).

---

## 🧪 Running Unit Tests

Unit tests are written using xUnit, Moq, and FluentAssertions. To execute all unit tests, run the following command in the solution root directory:
```bash
dotnet test
```

---

### Database Setup Instructions
The database script and seed data are included in the `Database/backup.sql` file.

To setup the database locally using PostgreSQL:

1. Create a database named `AssignmentManagementDb`.
2. Run the SQL script:
   ```bash
   psql -U postgres -d AssignmentManagementDb --no-owner -f backup.sql



## 🔑 Demo Credentials

Use the following working credentials to log in to the different roles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@assignmentdesk.com` | `admin@123` | Pre-seeded / Full access to user management, classes, subjects |
| **Teacher** | `rifatuul@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Create assignments & grade submissions |
| **Teacher** | `hello.rfatul@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Create assignments & grade submissions |
| **Student** | `rifatul.exe@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Submit PDF assignments & view grades |
| **Student** | `rifatul.exe@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Submit PDF assignments & view grades |
| **Student** | `hey.rifatul@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Submit PDF assignments & view grades |
| **Student** | `	drubo614@gmail.com@gmail.com` | `12345678` | Pre-seeded in `backup.sql` / Submit PDF assignments & view grades |

> [!NOTE]
> If you set up the database using Method B (EF Migrations), only the Admin account is seeded. You can log in as Admin and navigate to the User Management dashboard to create and configure Teacher and Student accounts.

---

## ⚡ Optional / Advanced Features

*   **API/Swagger Documentation**: Interactive Swagger API Explorer is available at `https://localhost:7156/swagger/index.html`.
*   **Docker Integration**: A multi-stage `Dockerfile` is provided in the repository to build and package the backend API container.
*   **Advanced Filtering**: The teacher portal allows real-time dynamic filtering of submissions and assignments based on class name and subject.
*   **Pagination Support**: The backend repository layer has built-in support for paging parameters (`pageNumber`, `pageSize`) to optimize heavy data queries.

---

## 📝 Assumptions & Known Limitations

1.  **PDF Submission Format**: The system assumes assignment submissions are in PDF format to enable cross-platform viewing in the browser.
2.  **HTTPS Developer Certificates**: When running Next.js with HTTPS enabled, you may need to accept the self-signed developer certificate in your browser.
3.  **Local Storage Mocking**: For testing and simplicity in local environments, files uploaded by students and teachers are stored inside the backend `wwwroot/uploads` directory.

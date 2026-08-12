// User roles enum matching ASP.NET Core backend Enums
export type UserRole = "Admin" | "Teacher" | "Student";

export enum UserRoleEnum {
  Admin = 1,
  Teacher = 2,
  Student = 3
}

// Assignment status enum matching backend Enums
export enum AssignmentStatus {
  Draft = 0,
  Publish = 1,
  Closed = 2
}

// Submission status enum matching backend Enums
export enum SubmissionStatus {
  Submitted = 1,
  Reviewed = 2
}

// Auth Request & Response DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActivateAccountDto {
  token: string;
  password: string;
  confirmPassword: string;
}

// Stats & Dashboard DTOs
export interface AdminDashboardDto {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  recentAssignments: AssignmentResponseDto[];
  recentSubmissions: SubmissionResponseDto[];
}

export interface TeacherDashboardDto {
  mySubjects: number;
  myAssignments: number;
  pendingReview: number;
}

export interface StudentDashboardDto {
  mySubjects: number;
  myAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  reviewedAssignments: number;
}

// User response
export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: string; // "Admin" | "Teacher" | "Student"
  isActive: boolean;
}

// Register (Create User) payload
export interface RegisterDto {
  fullName: string;
  email: string;
  role: UserRoleEnum;
}

// Class DTOs
export interface ClassResponseDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateClassDto {
  name: string;
  description?: string;
}

// Subject DTOs
export interface SubjectResponseDto {
  id: number;
  name: string;
  classId: number;
}

export interface CreateSubjectDto {
  name: string;
  classId: number;
}

// Student Class Association DTOs
export interface StudentClassResponseDto {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
}

export interface CreateStudentClassDto {
  studentId: number;
  classId: number;
}

// Teacher Subject Association DTOs
export interface TeacherSubjectResponseDto {
  id: number;
  subjectId: number;
  subjectName: string;
}

export interface AssignTeacherSubjectDto {
  teacherId: number;
  subjectId: number;
}

// Assignment DTOs
export interface AssignmentResponseDto {
  id: number;
  title: string;
  description: string;
  deadline: string; // ISO date-time string
  maximumMarks: number;
  status: AssignmentStatus;
  subjectName: string;
  className?: string;
  teacherName?: string;
  teacherId: number;
  createdAt: string; // ISO date-time string
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  deadline: string; // ISO date-time string
  maximumMarks: number;
  status: AssignmentStatus;
  classId: number;
  subjectId: number;
}

// Submission DTOs
export interface SubmissionResponseDto {
  id: number;
  studentId: number;
  studentName: string;
  assignmentId: number;
  assignmentTitle: string;
  subjectName: string;
  className?: string;
  fileUrl: string;
  submittedAt: string; // ISO date-time string
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
}

export interface CreateSubmissionDto {
  assignmentId: number;
  pdfFile: File;
}

export interface ResubmitSubmissionDto {
  pdfFile: File;
}

export interface ReviewSubmissionDto {
  marks: number;
  feedback: string;
}

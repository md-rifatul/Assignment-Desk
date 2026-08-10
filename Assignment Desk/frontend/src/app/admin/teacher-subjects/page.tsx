"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { UserResponseDto, SubjectResponseDto, TeacherSubjectResponseDto, AssignTeacherSubjectDto, ClassResponseDto } from "@/types";

interface DisplayAssignment {
  id: number; // Mapping ID from database
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  className?: string;
}

export default function AdminTeacherSubjectsPage() {
  const [teachers, setTeachers] = useState<UserResponseDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [assignments, setAssignments] = useState<DisplayAssignment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch teachers, subjects and classes
      const [allUsers, allSubjects, allClasses] = await Promise.all([
        apiFetch<UserResponseDto[]>("/api/user/all"),
        apiFetch<SubjectResponseDto[]>("/api/subject/all"),
        apiFetch<ClassResponseDto[]>("/api/class/all"),
      ]);

      const teacherUsers = allUsers.filter((u) => u.role === "Teacher");
      setTeachers(teacherUsers);
      setSubjects(allSubjects || []);
      setClasses(allClasses || []);

      // 2. Fetch assignments for each teacher
      const aggregated: DisplayAssignment[] = [];
      await Promise.all(
        teacherUsers.map(async (t) => {
          try {
            // Note: route has no slash, e.g., get{id}
            const teacherSubs = await apiFetch<TeacherSubjectResponseDto[]>(`/api/teachersubject/get${t.id}`);
            if (teacherSubs && Array.isArray(teacherSubs)) {
              teacherSubs.forEach((sub) => {
                const matchingSubject = allSubjects.find((s) => s.id === sub.subjectId);
                const matchingClass = matchingSubject
                  ? (allClasses || []).find((c) => c.id === matchingSubject.classId)
                  : null;

                aggregated.push({
                  id: sub.id,
                  teacherId: t.id,
                  teacherName: t.fullName,
                  subjectId: sub.subjectId,
                  subjectName: sub.subjectName,
                  className: matchingClass ? matchingClass.name : undefined,
                });
              });
            }
          } catch (err) {
            console.error(`Failed to fetch assignments for teacher ${t.fullName}`, err);
          }
        })
      );

      // Sort assignments by teacher name
      aggregated.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
      setAssignments(aggregated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load mapping data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!selectedTeacherId) {
      setFormError("Please select a teacher.");
      return;
    }
    if (!selectedSubjectId) {
      setFormError("Please select a subject.");
      return;
    }

    // Check if duplicate assignment exists in UI to prevent bad UX
    const isDuplicate = assignments.some(
      (a) => a.teacherId === selectedTeacherId && a.subjectId === selectedSubjectId
    );
    if (isDuplicate) {
      setFormError("This teacher is already assigned to this subject.");
      return;
    }

    setFormLoading(true);
    try {
      const payload: AssignTeacherSubjectDto = {
        teacherId: selectedTeacherId,
        subjectId: selectedSubjectId,
      };

      await apiFetch("/api/teachersubject/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
      const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
      setSuccess(`Assigned "${selectedTeacher?.fullName}" to "${selectedSubject?.name}" successfully.`);
      
      // Reset form selection
      setSelectedTeacherId(0);
      setSelectedSubjectId(0);
      
      // Refresh assignments
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign teacher to subject.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUnassign = async (id: number, teacherName: string, subjectName: string) => {
    if (!confirm(`Are you sure you want to unassign "${teacherName}" from "${subjectName}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Note: Delete uses POST verb as defined by C# [HttpPost("delete/{id}")]
      await apiFetch(`/api/teachersubject/delete/${id}`, {
        method: "POST",
      });
      setSuccess(`Successfully unassigned "${teacherName}" from "${subjectName}".`);
      fetchAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete assignment.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Assign Teacher to Subject
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "32px" }}>
        Allocate academic subjects to instructors
      </p>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: "24px" }} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "24px" }} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", alignItems: "start" }} className="grid-2">
        {/* Assignment Form */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Create Allocation</h2>
          
          {formError && (
            <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacherSelect">Select Instructor</label>
              <select
                id="teacherSelect"
                className="form-control"
                style={{ background: "rgba(15, 23, 42, 0.95)" }}
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(parseInt(e.target.value));
                  setFormError(null);
                }}
                disabled={formLoading || loading}
              >
                <option value={0}>-- Select a Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.email})
                  </option>
                ))}
              </select>
              {teachers.length === 0 && !loading && (
                <span className="error-message">No teachers found in database. Create them in Manage Users.</span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label" htmlFor="subjectSelect">Select Subject</label>
              <select
                id="subjectSelect"
                className="form-control"
                style={{ background: "rgba(15, 23, 42, 0.95)" }}
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(parseInt(e.target.value));
                  setFormError(null);
                }}
                disabled={formLoading || loading}
              >
                <option value={0}>-- Select a Subject --</option>
                {subjects.map((s) => {
                  const matchingClass = classes.find((c) => c.id === s.classId);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} {matchingClass ? `(${matchingClass.name})` : ""}
                    </option>
                  );
                })}
              </select>
              {subjects.length === 0 && !loading && (
                <span className="error-message">No subjects found in database. Create them in Manage Subjects.</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "28px" }} disabled={formLoading || loading || teachers.length === 0 || subjects.length === 0}>
              {formLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Assigning...
                </>
              ) : (
                "Assign Subject"
              )}
            </button>
          </form>
        </div>

        {/* Existing Allocations List */}
        <div className="auth-card" style={{ maxWidth: "none", padding: "0", overflow: "hidden", border: "1px solid var(--border-color)" }}>
          <div style={{ padding: "20px 24px", background: "rgba(15, 23, 42, 0.4)", borderBottom: "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Active Assignments</h2>
          </div>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <div className="btn-spinner" style={{ width: "32px", height: "32px", borderTopColor: "var(--primary)" }}></div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "rgba(15, 23, 42, 0.2)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Teacher</th>
                    <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontWeight: "600" }}>Subject</th>
                    <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontWeight: "600", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                        No teacher-subject allocations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background var(--transition-fast)" }} className="table-row-hover">
                        <td style={{ padding: "12px 24px", fontWeight: "500" }}>{item.teacherName}</td>
                        <td style={{ padding: "12px 24px", color: "var(--text-secondary)" }}>
                          {item.subjectName} {item.className ? `(${item.className})` : ""}
                        </td>
                        <td style={{ padding: "12px 24px", textAlign: "right" }}>
                          <button className="btn" style={{ width: "auto", padding: "4px 8px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }} onClick={() => handleUnassign(item.id, item.teacherName, item.subjectName)}>
                            Unassign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

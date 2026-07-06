/**
 * Types for Polytechnic SMS Result Dissemination System
 * Case Study: Computer Science Department, Federal Polytechnic Oko, Atani Campus
 */

export interface Student {
  id: string;
  matricNo: string; // e.g., FPO/CS/ND/2024/001
  name: string;
  phone: string; // e.g., +2348012345678
  department: string; // Computer Science
  programme: "ND" | "HND";
  entrySession: string; // e.g., 2024/2025
  currentSemester: number; // 1, 2, 3, or 4
}

export interface Course {
  id: string;
  code: string; // e.g., COM 111
  title: string; // e.g., Introduction to Computing
  units: number; // Credit hours/units (e.g., 2, 3, 4)
  semester: number; // 1, 2, 3, or 4
  programme: "ND" | "HND";
}

export interface Result {
  id: string;
  studentId: string;
  courseId: string;
  score: number; // 0 - 100
  grade: string; // A, AB, B, BC, C, CD, D, E, F
  gp: number; // Grade Point: A=4.0, AB=3.5, B=3.0, etc.
  semester: number; // 1, 2, 3, or 4
  session: string; // e.g., 2024/2025
  isApproved: boolean; // Must be true to be queryable via SMS
}

export interface SMSLog {
  id: string;
  timestamp: string;
  sender: string; // Student phone number or system "30012"
  recipient: string; // Student phone number or system "30012"
  message: string;
  direction: "INBOUND" | "OUTBOUND"; // INBOUND (pull request), OUTBOUND (response / push notification)
  status: "DELIVERED" | "FAILED" | "PENDING";
  type: "PULL" | "PUSH"; // PULL query, PUSH automatic broadcast
}

export interface GPAInfo {
  semester: number;
  gpa: number;
  totalUnits: number;
  totalGradePoints: number;
  results: Array<{
    courseCode: string;
    courseTitle: string;
    units: number;
    score: number;
    grade: string;
    gp: number;
    isApproved: boolean;
  }>;
}

export interface AcademicSummary {
  student: Student;
  gpas: Record<number, GPAInfo>;
  cgpa: number; // Cumulative GPA
  fcgpa: number; // Final Cumulative GPA (if completed all semesters, otherwise same as CGPA)
  classOfDegree: string; // Distinction, Upper Credit, Lower Credit, Pass, Fail
}

// Grading Scale Constant (NBTE Unified Grading System for Polytechnics)
export const GRADING_SCALE = [
  { scoreRange: [75, 100], grade: "A", gp: 4.00, remarks: "Excellent" },
  { scoreRange: [70, 74], grade: "AB", gp: 3.50, remarks: "Very Good" },
  { scoreRange: [65, 69], grade: "B", gp: 3.00, remarks: "Good" },
  { scoreRange: [60, 64], grade: "BC", gp: 2.50, remarks: "Satisfactory" },
  { scoreRange: [55, 59], grade: "C", gp: 2.00, remarks: "Fair" },
  { scoreRange: [50, 54], grade: "CD", gp: 1.50, remarks: "Pass" },
  { scoreRange: [45, 49], grade: "D", gp: 1.00, remarks: "Weak Pass" },
  { scoreRange: [40, 44], grade: "E", gp: 0.50, remarks: "Very Weak Pass" },
  { scoreRange: [0, 39], grade: "F", gp: 0.00, remarks: "Fail" },
];

export function getGradeAndGP(score: number): { grade: string; gp: number; remarks: string } {
  const rounded = Math.round(score);
  const match = GRADING_SCALE.find(
    (scale) => rounded >= scale.scoreRange[0] && rounded <= scale.scoreRange[1]
  );
  return match
    ? { grade: match.grade, gp: match.gp, remarks: match.remarks }
    : { grade: "F", gp: 0, remarks: "Fail" };
}

export function getClassOfDegree(cgpa: number): string {
  if (cgpa >= 3.50) return "Distinction";
  if (cgpa >= 3.00) return "Upper Credit";
  if (cgpa >= 2.50) return "Lower Credit";
  if (cgpa >= 2.00) return "Pass";
  return "Fail";
}

import React from "react";
import { 
  Users, BookOpen, Award, MessageSquare, TrendingUp, 
  CheckCircle, ShieldAlert, GraduationCap, Percent, Star 
} from "lucide-react";
import { Student, Course, Result, getClassOfDegree } from "../types.ts";

interface AdminStatsProps {
  students: Student[];
  courses: Course[];
  results: Result[];
  smsLogs: any[];
}

export default function AdminStats({ students, courses, results, smsLogs }: AdminStatsProps) {
  // Compute metrics
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalResults = results.length;
  const approvedResults = results.filter((r) => r.isApproved).length;
  const unapprovedResults = totalResults - approvedResults;
  
  const approvalPercentage = totalResults > 0 
    ? Math.round((approvedResults / totalResults) * 100) 
    : 0;

  const totalSms = smsLogs.length;
  const smsPush = smsLogs.filter((log) => log.type === "PUSH").length;
  const smsPull = smsLogs.filter((log) => log.type === "PULL").length;

  // Compute student class standings (based on currently approved results)
  let distinctions = 0;
  let upperCredits = 0;
  let lowerCredits = 0;
  let passes = 0;
  let fails = 0;
  let gradedStudents = 0;

  students.forEach((student) => {
    const studentResults = results.filter((r) => r.studentId === student.id && r.isApproved);
    if (studentResults.length === 0) return;

    gradedStudents++;
    // Calculate simple GP average
    const totalGP = studentResults.reduce((acc, curr) => acc + curr.gp, 0);
    const avgGP = totalGP / studentResults.length;
    
    const ratingClass = getClassOfDegree(avgGP);
    if (ratingClass === "Distinction") distinctions++;
    else if (ratingClass === "Upper Credit") upperCredits++;
    else if (ratingClass === "Lower Credit") lowerCredits++;
    else if (ratingClass === "Pass") passes++;
    else fails++;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Performance & Statistics</h2>
        <p className="text-xs text-slate-500">Live operational monitoring of Federal Polytechnic Oko, Atani Campus Computer Science database.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div id="stat-students" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Enrolled Students</span>
            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold">ND: {students.filter(s => s.programme === "ND").length}</span>
              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">HND: {students.filter(s => s.programme === "HND").length}</span>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Courses */}
        <div id="stat-courses" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Total Curriculum Courses</span>
            <div className="text-2xl font-bold text-slate-900">{totalCourses}</div>
            <p className="text-[10px] text-slate-500">Structured across 4-Semesters program</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Grade Statistics */}
        <div id="stat-results" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Approved Results Ratio</span>
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
              {approvedResults} <span className="text-xs font-normal text-slate-400">/ {totalResults} total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${approvalPercentage}%` }} />
              </div>
              <span className="text-[10px] text-amber-600 font-bold">{approvalPercentage}% Approved</span>
            </div>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* SMS Telecom Gateways */}
        <div id="stat-sms" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Telephony SMS Volume</span>
            <div className="text-2xl font-bold text-slate-900">{totalSms}</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span className="bg-purple-50 text-purple-600 px-1 py-0.5 rounded font-semibold">PUSH: {smsPush}</span>
              <span className="bg-sky-50 text-sky-600 px-1 py-0.5 rounded font-semibold">PULL: {smsPull}</span>
            </div>
          </div>
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class of Degrees list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Class of Diploma Breakdown</h3>
              <p className="text-xs text-slate-500">Computed strictly using NBTE 4.0 grading system.</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
              Graded Students: {gradedStudents} / {totalStudents}
            </span>
          </div>

          <div className="space-y-4">
            {/* Distinction */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Distinction (3.50 - 4.00)
                </span>
                <span className="font-mono text-slate-500 font-semibold">{distinctions} students ({gradedStudents > 0 ? Math.round((distinctions / gradedStudents) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full" style={{ width: `${gradedStudents > 0 ? (distinctions / gradedStudents) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Upper Credit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Upper Credit (3.00 - 3.49)
                </span>
                <span className="font-mono text-slate-500 font-semibold">{upperCredits} students ({gradedStudents > 0 ? Math.round((upperCredits / gradedStudents) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${gradedStudents > 0 ? (upperCredits / gradedStudents) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Lower Credit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Lower Credit (2.50 - 2.99)
                </span>
                <span className="font-mono text-slate-500 font-semibold">{lowerCredits} students ({gradedStudents > 0 ? Math.round((lowerCredits / gradedStudents) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${gradedStudents > 0 ? (lowerCredits / gradedStudents) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Pass */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-400" /> Pass (2.00 - 2.49)
                </span>
                <span className="font-mono text-slate-500 font-semibold">{passes} students ({gradedStudents > 0 ? Math.round((passes / gradedStudents) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: `${gradedStudents > 0 ? (passes / gradedStudents) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Fail */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Fail (Below 2.00)
                </span>
                <span className="font-mono text-slate-500 font-semibold">{fails} students ({gradedStudents > 0 ? Math.round((fails / gradedStudents) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${gradedStudents > 0 ? (fails / gradedStudents) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Instructions / Definitions Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">grading guidelines</h4>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Federal Polytechnic Oko uses the NBTE 4.0 grading guidelines. Results are entered by Course Lecturers, verified by HOD, and approved by the Academic Board.
            </p>

            <ul className="space-y-2.5 text-[11px] text-slate-300">
              <li className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-mono font-bold text-slate-400">A (75+):</span>
                <span className="font-semibold text-slate-100">4.00 GP</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-mono font-bold text-slate-400">AB (70-74):</span>
                <span className="font-semibold text-slate-100">3.50 GP</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-mono font-bold text-slate-400">B (65-69):</span>
                <span className="font-semibold text-slate-100">3.00 GP</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-mono font-bold text-slate-400">BC (60-64):</span>
                <span className="font-semibold text-slate-100">2.50 GP</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-400">F (Below 40):</span>
                <span className="font-semibold text-red-400 font-bold">0.00 GP</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Federal Polytechnic Oko</span>
            <span>Atani Campus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

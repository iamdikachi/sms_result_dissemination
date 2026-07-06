import React, { useState, useEffect } from "react";
import { 
  Award, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Send, 
  HelpCircle, ChevronRight, FileSpreadsheet, PlayCircle 
} from "lucide-react";
import { Student, Course, Result, getGradeAndGP } from "../types.ts";

interface ResultManagerProps {
  students: Student[];
  courses: Course[];
  results: Result[];
  onRefresh: () => void;
}

export default function ResultManager({ students, courses, results, onRefresh }: ResultManagerProps) {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedProgramme, setSelectedProgramme] = useState<"ND" | "HND">("ND");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [session, setSession] = useState<string>("2024/2025");

  // Grades entry local storage
  const [scores, setScores] = useState<Record<string, string>>({}); // studentId -> raw score string
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Approval Form State
  const [approveSemester, setApproveSemester] = useState<number>(1);
  const [approveSession, setApproveSession] = useState<string>("2024/2025");
  const [triggerSMS, setTriggerSMS] = useState<boolean>(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalSummary, setApprovalSummary] = useState<any | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  // Filter courses based on selected semester & programme
  const filteredCourses = courses.filter(
    (c) => c.semester === selectedSemester && c.programme === selectedProgramme
  );

  // Filter students matching the programme and semester
  const filteredStudents = students.filter(
    (s) => s.programme === selectedProgramme
  );

  // Auto-select course when list changes
  useEffect(() => {
    if (filteredCourses.length > 0) {
      setSelectedCourseId(filteredCourses[0].id);
    } else {
      setSelectedCourseId("");
    }
  }, [selectedSemester, selectedProgramme]);

  // Load existing results into the scores state
  useEffect(() => {
    if (!selectedCourseId) {
      setScores({});
      return;
    }

    const initialScores: Record<string, string> = {};
    filteredStudents.forEach((student) => {
      const match = results.find(
        (r) => r.studentId === student.id && r.courseId === selectedCourseId
      );
      if (match) {
        initialScores[student.id] = match.score.toString();
      } else {
        initialScores[student.id] = "";
      }
    });
    setScores(initialScores);
    setSaveStatus("");
  }, [selectedCourseId, results, selectedProgramme]);

  const handleScoreChange = (studentId: string, value: string) => {
    // Only allow decimals/numbers or empty
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setScores((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedCourseId) {
      alert("Please select a course first.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("");
    let savedCount = 0;

    try {
      for (const studentId of Object.keys(scores)) {
        const scoreVal = scores[studentId];
        if (scoreVal === "") continue; // Skip empty inputs

        const scoreNum = parseFloat(scoreVal);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) continue;

        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            courseId: selectedCourseId,
            score: scoreNum,
            semester: selectedSemester,
            session,
          }),
        });

        if (res.ok) {
          savedCount++;
        }
      }

      setSaveStatus(`Successfully saved grades for ${savedCount} students!`);
      onRefresh();
    } catch (err) {
      console.error(err);
      setSaveStatus("Failed to save some grades.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkApprove = async () => {
    setApprovalLoading(true);
    setApprovalSummary(null);
    setApprovalError("");

    try {
      const res = await fetch("/api/results/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: approveSemester,
          session: approveSession,
          triggerSMS,
        }),
      });

      if (!res.ok) throw new Error("Approval transaction failed");

      const data = await res.json();
      setApprovalSummary(data);
      setShowApproveConfirm(false);
      onRefresh();
    } catch (err: any) {
      setApprovalError(err.message || "Failed to complete approval process.");
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: GRADE ENTRY PANEL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Verifiable Course Result Sheets Entry</span>
          </h2>
          <p className="text-xs text-slate-500">Input raw semester examination percentages to instantly translate to standard grade points.</p>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Programme</label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value as "ND" | "HND")}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              <option value="ND">ND (National Diploma)</option>
              <option value="HND">HND (Higher National Diploma)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              <option value={1}>Semester 1 (Year 1 First)</option>
              <option value={2}>Semester 2 (Year 1 Second)</option>
              <option value={3}>Semester 3 (Year 2 First)</option>
              <option value={4}>Semester 4 (Year 2 Second)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Session</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g., 2024/2025"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course Sheet *</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none disabled:bg-slate-100"
              disabled={filteredCourses.length === 0}
            >
              {filteredCourses.length === 0 ? (
                <option value="">No registered courses found</option>
              ) : (
                filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title} ({c.units} Units)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Grades Entry Sheet */}
        {selectedCourseId ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Student Matric ID</th>
                    <th className="py-2.5 px-4">Full Name</th>
                    <th className="py-2.5 px-4 w-32 text-center">Score (0-100)</th>
                    <th className="py-2.5 px-4 w-24 text-center">Grade</th>
                    <th className="py-2.5 px-4 w-24 text-center">Grade Point</th>
                    <th className="py-2.5 px-4 w-32 text-center">Senate Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        No students enrolled in {selectedProgramme} programme records yet.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const rawScore = scores[student.id] || "";
                      const scoreNum = parseFloat(rawScore);
                      const hasScore = rawScore !== "" && !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100;
                      const { grade, gp, remarks } = hasScore ? getGradeAndGP(scoreNum) : { grade: "-", gp: 0, remarks: "" };
                      
                      const existingResult = results.find(
                        (r) => r.studentId === student.id && r.courseId === selectedCourseId
                      );

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/40">
                          {/* Matric ID */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{student.matricNo}</td>
                          
                          {/* Name */}
                          <td className="py-3 px-4 font-medium">{student.name}</td>
                          
                          {/* Score Input */}
                          <td className="py-2 px-4 text-center">
                            <input
                              type="text"
                              value={rawScore}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              placeholder="Score"
                              className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-mono font-bold text-xs"
                            />
                          </td>

                          {/* Computed Grade */}
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              grade === "A" ? "bg-amber-100 text-amber-800" :
                              grade === "AB" || grade === "B" ? "bg-blue-100 text-blue-800" :
                              grade === "F" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"
                            }`}>
                              {grade}
                            </span>
                          </td>

                          {/* Grade Point */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                            {hasScore ? gp.toFixed(2) : "-"}
                          </td>

                          {/* Approval Status */}
                          <td className="py-3 px-4 text-center">
                            {existingResult ? (
                              existingResult.isApproved ? (
                                <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                  ● Approved
                                </span>
                              ) : (
                                <span className="text-amber-600 bg-amber-50 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                                  ● Verified
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-[10px] inline-flex items-center">
                                No record
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveGrades}
                disabled={isSaving || filteredStudents.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl px-5 py-2.5 shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Save Grade Sheet Records</span>
              </button>

              {saveStatus && (
                <span className="text-xs text-blue-600 font-semibold">{saveStatus}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            Please register and select a course curriculum sheet above to enter marks.
          </div>
        )}
      </div>

      {/* SECTION 2: SENATE VERIFICATION & BULK APPROVAL */}
      <div id="senate-approval-panel" className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
        <div>
          <span className="bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
            academic senate panel
          </span>
          <h2 className="text-base font-bold text-slate-100 mt-2 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-amber-500" />
            <span>Official Semester Results Senate Approval & SMS Blast</span>
          </h2>
          <p className="text-xs text-slate-300">Verify and officially lock exam results. Approved grades are immediately available for SMS Pull requests and optionally broadcasted via SMS Push.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-950 rounded-xl border border-slate-800/80">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Senate Release Semester</label>
            <select
              value={approveSemester}
              onChange={(e) => setApproveSemester(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
              <option value={4}>Semester 4</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Session</label>
            <input
              type="text"
              value={approveSession}
              onChange={(e) => setApproveSession(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={triggerSMS}
                onChange={(e) => setTriggerSMS(e.target.checked)}
                className="w-4 h-4 bg-slate-900 border border-slate-800 rounded text-amber-500 focus:ring-amber-500/30"
              />
              <span className="text-xs text-slate-300 font-semibold">Broadcast SMS Push notifications instantly</span>
            </label>
          </div>
        </div>

        {/* Approval action trigger button or confirmation */}
        {showApproveConfirm ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold">Are you sure you want to approve Semester {approveSemester} ({approveSession}) results?</p>
                <p className="text-slate-400 mt-1">This will lock the grades, make them instantly queryable by students via SMS Pull, and broadcast SMS Push notifications if enabled.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkApprove}
                disabled={approvalLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {approvalLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Yes, Approve & Publish Results</span>
              </button>
              <button
                onClick={() => setShowApproveConfirm(false)}
                disabled={approvalLoading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setApprovalError("");
                setApprovalSummary(null);
                setShowApproveConfirm(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 font-bold text-xs rounded-xl px-5 py-2.5 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Verify, Approve & Blast Results</span>
            </button>
          </div>
        )}

        {approvalError && (
          <div className="bg-red-950/40 p-4 rounded-xl border border-red-800/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{approvalError}</span>
          </div>
        )}

        {/* Approval Action Results Summary feedback */}
        {approvalSummary && (
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/40 text-emerald-300 text-xs space-y-2 animate-pulse">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL SENATE RELEASE COMPLETE</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Locked & Released <strong className="text-white">{approvalSummary.approvedCount}</strong> course result slips.</li>
              {triggerSMS ? (
                <li>Pushed automated transcripts to <strong className="text-white">{approvalSummary.smsPushedCount}</strong> registered student mobile devices!</li>
              ) : (
                <li className="text-slate-400">SMS Push alert broadcast bypassed.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

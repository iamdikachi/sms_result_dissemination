import React, { useState, useEffect } from "react";
import { 
  Sparkles, GraduationCap, ArrowRight, RefreshCw, Send, CheckCircle2, 
  HelpCircle, BookOpen, Star, Award, TrendingUp, AlertTriangle 
} from "lucide-react";
import { Student } from "../types.ts";

interface AiCounselorProps {
  students: Student[];
  onRefresh: () => void;
}

export default function AiCounselor({ students, onRefresh }: AiCounselorProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentReport, setStudentReport] = useState<any | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isCounseling, setIsCounseling] = useState(false);
  const [adviceResult, setAdviceResult] = useState<string>("");
  const [error, setError] = useState("");

  const activeStudent = students.find((s) => s.id === selectedStudentId);

  // Quick preset questions
  const presets = [
    {
      label: "⭐ Distinction Pathway Goal",
      text: "This student is aiming for a Distinction (3.50+ CGPA) by graduation. Perform a thorough audit of their current grades, and project the exact semester-by-semester GPAs they need in remaining terms to hit this goal.",
    },
    {
      label: "📈 Upper Credit Pathway Goal",
      text: "This student wants to secure an Upper Credit (3.00+ CGPA). Calculate what GPAs are required in their future semesters to lock in this standard.",
    },
    {
      label: "💻 CS Programming Remediation",
      text: "Examine this student's grades specifically in computer science programming, math, and digital courses. Provide a direct, actionable academic recovery study roadmap for coding courses.",
    },
    {
      label: "🔍 Performance SWOT Analysis",
      text: "Conduct a standard academic SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on their transcript details. Highlight specific risks.",
    }
  ];

  // Fetch student report when student selection changes
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students]);

  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchReport = async () => {
      setIsLoadingReport(true);
      setError("");
      try {
        const student = students.find((s) => s.id === selectedStudentId);
        if (!student) return;

        const res = await fetch(`/api/gpa/${encodeURIComponent(student.matricNo)}`);
        if (!res.ok) throw new Error("Failed to load student transcript report");

        const data = await res.json();
        setStudentReport(data);
      } catch (err: any) {
        setError(err.message || "Failed to load academic records");
      } finally {
        setIsLoadingReport(false);
      }
    };

    fetchReport();
  }, [selectedStudentId, students]);

  const handlePresetClick = (presetText: string) => {
    setCustomQuestion(presetText);
  };

  const handleQueryCounselor = async () => {
    if (!selectedStudentId) {
      alert("Please select a student first.");
      return;
    }

    setIsCounseling(true);
    setAdviceResult("");
    setError("");

    try {
      const res = await fetch("/api/ai/advise-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          customQuestion: customQuestion.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate academic advice.");
      }

      const data = await res.json();
      setAdviceResult(data.advice);
    } catch (err: any) {
      setError(err.message || "Failed to generate counsel. Check your internet or API key.");
    } finally {
      setIsCounseling(false);
    }
  };

  // Simple Markdown-like custom regex text formatter for React-19 safety
  const formatAdviceText = (text: string) => {
    if (!text) return null;

    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();

      // Titles h3
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 uppercase tracking-wide border-b border-slate-100 pb-1">{trimmed.replace("###", "").trim()}</h4>;
      }
      // Titles h2
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-base font-extrabold text-slate-900 mt-5 mb-2 border-l-4 border-blue-500 pl-2">{trimmed.replace("##", "").trim()}</h3>;
      }
      // Titles h1
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-lg font-extrabold text-slate-950 mt-6 mb-3 bg-slate-50 p-2 rounded border border-slate-100">{trimmed.replace("#", "").trim()}</h2>;
      }
      // Bullet points
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.substring(2);
        return (
          <li key={idx} className="list-disc ml-5 my-1.5 text-slate-700 leading-relaxed text-xs">
            {parseBoldText(content)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, "");
        return (
          <li key={idx} className="list-decimal ml-5 my-1.5 text-slate-700 leading-relaxed text-xs">
            {parseBoldText(content)}
          </li>
        );
      }
      // Paragraphs
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-2 font-sans">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper to parse double asterisks for bold highlights
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900 bg-amber-50 px-0.5 rounded">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LEFT COLUMN: Student Profile & Selector (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Counselee Profile</h3>
            <h2 className="text-base font-bold text-slate-800">Select Student Profile</h2>
          </div>

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                🧑‍🎓 {student.name} ({student.matricNo})
              </option>
            ))}
          </select>

          {isLoadingReport ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              <span>Recalculating transcript statistics...</span>
            </div>
          ) : studentReport ? (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">program</span>
                  <span className="font-bold text-slate-800">{studentReport.student.programme} ({studentReport.student.entrySession})</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">registered phone</span>
                  <span className="font-mono text-slate-700">{studentReport.student.phone}</span>
                </div>
              </div>

              {/* GPA summaries */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl text-white">
                <span className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Current Official CGPA</span>
                <div className="text-3xl font-extrabold mt-1 tracking-tight flex items-baseline gap-2">
                  {studentReport.approvedCgpa.toFixed(2)}
                  <span className="text-xs font-normal text-blue-100">/ 4.00</span>
                </div>
                <div className="mt-2 text-xs text-blue-100 flex items-center gap-1.5 font-semibold">
                  <Award className="w-4 h-4" />
                  <span>Standing: {studentReport.classOfDegree}</span>
                </div>
              </div>

              {/* Semesters list */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester Performance</span>
                {Object.values(studentReport.gpas).map((semInfo: any) => (
                  <div key={semInfo.semester} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <span className="font-medium text-slate-700">Semester {semInfo.semester}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[10px]">{semInfo.totalUnits} Units</span>
                      <span className="font-bold text-slate-800">{semInfo.gpa.toFixed(2)} GPA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Presets Selection Drawer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Counseling Objectives Presets</h3>
          <div className="flex flex-col gap-2">
            {presets.map((preset, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handlePresetClick(preset.text)}
                className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-700 p-2.5 rounded-xl transition-all duration-200 text-xs font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI COUNSELING INTERFACE (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 min-h-[500px] flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">High Reasoning Academic Advisor</h3>
                  <p className="text-[11px] text-slate-500">Utilizing <strong className="font-bold text-slate-600">Gemini 3.1 Pro High-Thinking API</strong> for precise projections.</p>
                </div>
              </div>
            </div>

            {/* Counsel prompt input text area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Counsellor Focus Question / Custom Scenario</label>
              <textarea
                placeholder="Type custom academic planning instructions or select from the quick presets on the left..."
                rows={3}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Generate Trigger */}
            <div>
              <button
                onClick={handleQueryCounselor}
                disabled={isCounseling || !selectedStudentId || !customQuestion.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCounseling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                    <span>Analyzing performance records & projecting pathways... (High Thinking Mode)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Run High-Reasoning AI Counselor Analysis</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Output Board */}
            <div className="pt-4">
              {isCounseling ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center text-slate-400 space-y-4">
                  <div className="inline-block bg-indigo-50 text-indigo-600 p-3 rounded-full animate-bounce">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Deep Reasoning In Progress...</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Gemini 3.1 Pro is auditing student credit units, calculating score thresholds, and structuring the academic roadmap.</p>
                  </div>
                </div>
              ) : adviceResult ? (
                <div className="p-5 border border-slate-200/60 rounded-2xl bg-slate-50 shadow-inner max-h-[500px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 mb-4 text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Official AI Counseling Statement</span>
                  </div>
                  
                  <div className="space-y-3 prose max-w-none">
                    {formatAdviceText(adviceResult)}
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-dashed border-slate-100 rounded-xl text-center text-slate-400 text-xs">
                  Provide an objective query and run the counselor to receive a structured mathematical roadmap and study advisory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

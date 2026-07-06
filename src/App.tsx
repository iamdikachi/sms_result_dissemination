import React, { useState, useEffect } from "react";
import { 
  Users, BookOpen, FileText, MessageSquare, TrendingUp, Sparkles, 
  RefreshCw, GraduationCap, Server, ShieldCheck, HelpCircle, PhoneCall,
  Lock, LogOut, ShieldAlert, Key, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, Course, Result } from "./types.ts";
import AdminStats from "./components/AdminStats.tsx";
import StudentManager from "./components/StudentManager.tsx";
import CourseManager from "./components/CourseManager.tsx";
import ResultManager from "./components/ResultManager.tsx";
import SmsLogViewer from "./components/SmsLogViewer.tsx";
import AiCounselor from "./components/AiCounselor.tsx";
import SmsSimulator from "./components/SmsSimulator.tsx";
import PublicLanding from "./components/PublicLanding.tsx";

type TabType = "overview" | "students" | "courses" | "results" | "advisor" | "sms-logs";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");
  
  // API State
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  const fetchAllData = async () => {
    try {
      const [resStudents, resCourses, resResults, resSms] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/courses"),
        fetch("/api/results"),
        fetch("/api/sms/logs")
      ]);

      if (resStudents.ok && resCourses.ok && resResults.ok && resSms.ok) {
        setStudents(await resStudents.json());
        setCourses(await resCourses.json());
        setResults(await resResults.json());
        setSmsLogs(await resSms.json());
        setServerOnline(true);
      }
    } catch (err) {
      console.error("API Fetch Error", err);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll data occasionally for smooth simulated updates
    const timer = setInterval(fetchAllData, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between">
      {/* 1. Header Banner */}
      <header className="bg-white border-b border-slate-150 py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                Federal Polytechnic Oko, Atani Campus
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
                Computer Science Dept • Automated SMS Result Dissemination Portal
              </p>
            </div>
          </div>

          {/* System Indicators & Mode Toggles */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {isAdminMode ? (
              <button
                onClick={() => setIsAdminMode(false)}
                className="text-[11px] bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all"
                title="Exit Staff Admin Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>EXIT STAFF ADMIN</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all"
                title="Staff Portal Login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>STAFF ADMIN LOGIN</span>
              </button>
            )}

            <span className="text-[11px] font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 text-slate-500 flex items-center gap-1.5 font-bold">
              <Server className="w-3.5 h-3.5" />
              PORT: 3000
            </span>

            {serverOnline ? (
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM ONLINE
              </span>
            ) : (
              <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                OFFLINE
              </span>
            )}

            <button
              onClick={() => {
                setLoading(true);
                fetchAllData();
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* LEFT COMPONENT: Public Landing or Admin Dashboard (3/5 width) */}
        <div className="xl:col-span-3 space-y-6 flex flex-col justify-start min-h-[600px]">
          {isAdminMode ? (
            <>
              {/* Staff Console Notification Badge */}
              <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl flex items-center justify-between shadow-sm border border-amber-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wide">
                    Academic Staff Console Authorized — Faculty Registry Mode
                  </span>
                </div>
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Navigation Tab Menu */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-1.5 overflow-x-auto w-full max-w-full">
                {[
                  { id: "overview", label: "Overview", icon: TrendingUp },
                  { id: "students", label: "Registry", icon: Users },
                  { id: "courses", label: "Curriculum", icon: BookOpen },
                  { id: "results", label: "Grades Entry", icon: FileText },
                  { id: "advisor", label: "AI Counselor", icon: Sparkles },
                  { id: "sms-logs", label: "Gateway Logs", icon: PhoneCall },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
                        isActive 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel Body */}
              <div className="flex-1">
                {loading ? (
                  <div className="bg-white p-16 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                    <RefreshCw className="w-10 h-10 text-slate-300 animate-spin" />
                    <p className="text-xs font-medium">Synchronizing Federal Polytechnic Oko data repositories...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      {activeTab === "overview" && (
                        <AdminStats 
                          students={students} 
                          courses={courses} 
                          results={results} 
                          smsLogs={smsLogs} 
                        />
                      )}
                      {activeTab === "students" && (
                        <StudentManager 
                          students={students} 
                          onRefresh={fetchAllData} 
                        />
                      )}
                      {activeTab === "courses" && (
                        <CourseManager 
                          courses={courses} 
                          onRefresh={fetchAllData} 
                        />
                      )}
                      {activeTab === "results" && (
                        <ResultManager 
                          students={students} 
                          courses={courses} 
                          results={results} 
                          onRefresh={fetchAllData} 
                        />
                      )}
                      {activeTab === "advisor" && (
                        <AiCounselor 
                          students={students} 
                          onRefresh={fetchAllData} 
                        />
                      )}
                      {activeTab === "sms-logs" && (
                        <SmsLogViewer 
                          smsLogs={smsLogs} 
                          onRefresh={fetchAllData} 
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </>
          ) : (
            /* Public Student Marketing & Explainer view */
            <PublicLanding 
              students={students} 
              onOpenAdminLogin={() => setShowAdminModal(true)} 
            />
          )}
        </div>

        {/* RIGHT COMPONENT: Interactive Phone SMS Gateway Simulator (2/5 width) */}
        <div className="xl:col-span-2 h-full">
          <div className="sticky top-24">
            <SmsSimulator 
              students={students} 
              onSmsSentOrReceived={fetchAllData} 
              smsLogs={smsLogs} 
            />
          </div>
        </div>

      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-150 py-5 text-center text-xs text-slate-400 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Department of Computer Science, Federal Polytechnic Oko, Atani Campus, Nigeria.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-slate-400 hover:text-indigo-600 transition-colors font-semibold"
            >
              Academic Login
            </button>
            <span>•</span>
            <p className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Designed for secure NDPR compliant SMS dissemination.
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Passcode Modal Overlay */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Staff Credentials</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPasscode("");
                    setAdminError("");
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter the computer science departmental access passcode to unlock grading matrices, curriculum tables, and student registries.
                </p>
                <p className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1.5 rounded-lg">
                  💡 Sandbox Passcode: <span className="font-mono font-extrabold select-all">admin</span>
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasscode.trim().toLowerCase() === "admin") {
                    setIsAdminMode(true);
                    setShowAdminModal(false);
                    setAdminPasscode("");
                    setAdminError("");
                  } else {
                    setAdminError("Access Denied. Passcode is incorrect.");
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Administrative Key</label>
                  <input
                    type="password"
                    placeholder="Enter security key..."
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-indigo-600"
                    autoFocus
                  />
                </div>

                {adminError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {adminError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl py-3 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Authorize Staff Credentials</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

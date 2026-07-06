import React, { useState, useEffect } from "react";
import { 
  Smartphone, ShieldCheck, GraduationCap, Sparkles, HelpCircle, 
  Info, ArrowRight, EyeOff, CheckCircle2, ChevronRight, Lock, 
  BookOpen, Users, MessageSquare, LogOut, Key, FileText, ArrowLeft,
  AlertCircle, RefreshCw, Star, TrendingUp, ShieldAlert
} from "lucide-react";
import { Student } from "../types.ts";

interface PublicLandingProps {
  students: Student[];
  onOpenAdminLogin: () => void;
}

export default function PublicLanding({ students, onOpenAdminLogin }: PublicLandingProps) {
  // Navigation View State
  const [currentView, setCurrentView] = useState<"home" | "student-portal" | "student-dashboard">("home");
  const [activePortalTab, setActivePortalTab] = useState<"login" | "register">("login");

  // Login Form State
  const [loginMatric, setLoginMatric] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // Register Form State
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [regMatric, setRegMatric] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regConfirmPin, setRegConfirmPin] = useState("");

  // Feedback State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Student Dashboard State
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [transcript, setTranscript] = useState<any | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  // Student AI Advisor State
  const [adviceQuestion, setAdviceQuestion] = useState("");
  const [adviceResponse, setAdviceResponse] = useState("");
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Default sample matriculations for user reference
  const sampleMatric1 = students[0]?.matricNo || "FPO/CS/ND/2024/001";
  const sampleMatric2 = students[1]?.matricNo || "FPO/CS/ND/2024/002";

  // Reset feedback on view change
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [currentView, activePortalTab]);

  // Handle Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regMatric || !regPhone) {
      setError("Please fill in all registration fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/student/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNo: regMatric, phone: regPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate security OTP");
      }

      setSuccess(data.message);
      setRegisterStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP & Set PIN
  const handleVerifyOtpAndSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp || !regPin || !regConfirmPin) {
      setError("Please fill in all verification fields.");
      return;
    }

    if (regPin.length < 4) {
      setError("PIN must be at least 4 digits long.");
      return;
    }

    if (regPin !== regConfirmPin) {
      setError("Passwords/PINs do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNo: regMatric,
          otp: regOtp,
          pin: regPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "PIN registration failed.");
      }

      setSuccess("Your secure PIN was registered successfully! You can now log in below.");
      setActivePortalTab("login");
      setLoginMatric(regMatric);
      // Clear registration state
      setRegMatric("");
      setRegPhone("");
      setRegOtp("");
      setRegPin("");
      setRegConfirmPin("");
      setRegisterStep(1);
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMatric || !loginPin) {
      setError("Matric number and PIN are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricNo: loginMatric, pin: loginPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresRegister) {
          setError(data.error);
          setActivePortalTab("register");
          setRegMatric(loginMatric);
          return;
        }
        throw new Error(data.error || "Authentication failed.");
      }

      // Successful Auth
      setLoggedInStudent(data.student);
      // Fetch dynamic student GPA transcript
      await fetchTranscript(data.student.matricNo);
      setCurrentView("student-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate student.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student transcript details
  const fetchTranscript = async (matricNo: string) => {
    try {
      const res = await fetch(`/api/gpa/${encodeURIComponent(matricNo)}`);
      if (res.ok) {
        const data = await res.json();
        setTranscript(data);
        // Default to their latest available semester
        if (data.gpas && Object.keys(data.gpas).length > 0) {
          const semKeys = Object.keys(data.gpas).map(Number);
          setSelectedSemester(Math.max(...semKeys));
        }
      }
    } catch (err) {
      console.error("Failed to load transcript", err);
    }
  };

  // Ask AI Advisor on Dashboard
  const handleAskAiAdvisor = async () => {
    if (!adviceQuestion.trim() || !loggedInStudent) return;

    setAdviceLoading(true);
    setAdviceResponse("");

    try {
      const res = await fetch("/api/ai/advise-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: loggedInStudent.id,
          customQuestion: adviceQuestion,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Advisor failed to respond.");
      }

      setAdviceResponse(data.advice);
    } catch (err: any) {
      setAdviceResponse(`⚠️ Error: ${err.message || "Failed to query high-thinking AI counselor. Please make sure GEMINI_API_KEY is configured."}`);
    } finally {
      setAdviceLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setTranscript(null);
    setLoginPin("");
    setCurrentView("home");
  };

  // Current semester details
  const semDetails = transcript?.gpas?.[selectedSemester];
  const allCoursesForSelectedSemester = semDetails?.results || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HOMEPAGE VIEW */}
      {currentView === "home" && (
        <div className="space-y-8">
          {/* Hero Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="bg-blue-500/20 text-blue-200 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-blue-400/20 tracking-wider">
                Atani Campus • Computer Science Department
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Automated SMS Result Dissemination & AI Counselor Portal
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                A specialized, secure academic utility designed to bridge the digital divide. Students can securely log in to view validated semester transcripts or query official results, computed GPAs, and high-reasoning advisory plans entirely offline via GSM SMS messages.
              </p>
              
              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentView("student-portal")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Access Student Grade Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenAdminLogin}
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs md:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Departmental Staff Login</span>
                </button>
              </div>

              <div className="pt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  100% Offline Access via SMS
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  NDPR Privacy Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  Gemini Core Advisor
                </span>
              </div>
            </div>
          </div>

          {/* 3-Step "How It Works" Visual Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">How the SMS Gateway Operates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <div className="absolute top-4 left-4 text-xs font-bold bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center">1</div>
                <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-1">Text Shortcode</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Send a SMS with format <code className="bg-slate-200 px-1 rounded font-mono font-bold text-slate-900">RESULT [MatricNo] [Semester]</code> to <span className="font-mono font-bold text-blue-700">30012</span>.
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <div className="absolute top-4 left-4 text-xs font-bold bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center">2</div>
                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-1">Auto Lookup & Secure Auth</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The system validates your incoming registered SIM card number and fetches only officially approved senate files.
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <div className="absolute top-4 left-4 text-xs font-bold bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center">3</div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase mb-1">Instant SMS Response</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A high-speed GSM response returns your exact scores, semester GPAs, and cumulative class totals without any internet data.
                </p>
              </div>
            </div>
          </div>

          {/* Prominent SMS Instructions Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>SMS Shortcode Commands & Directory</span>
                </h3>
                <p className="text-xs text-slate-500">Official shortcode format structures for instant automated text responses.</p>
              </div>
              <div className="bg-blue-600 text-white font-mono font-extrabold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto">
                <span>SHORTCODE:</span>
                <span className="bg-blue-800 px-2 py-0.5 rounded text-white tracking-widest text-base">30012</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format 1: Pull Results */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/50 p-5 space-y-4 hover:border-slate-300/80 transition-all">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                    pull grades transcript
                  </span>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Syntax Format</h4>
                  <div className="bg-slate-900 text-white font-mono text-xs p-3 rounded-xl border border-slate-800 relative select-all leading-relaxed">
                    RESULT <span className="text-blue-300 font-extrabold">&lt;matric_no&gt;</span> <span className="text-emerald-300 font-extrabold">&lt;semester&gt;</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold">Example message:</p>
                  <code className="block bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-200">
                    RESULT {sampleMatric1} 1
                  </code>
                  <p className="text-[10px] text-slate-500 leading-normal pt-1">
                    Returns official grades, credit load weights, computed GPA, academic standing, and any remarks for that semester.
                  </p>
                </div>
              </div>

              {/* Format 2: AI Counselor */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/50 p-5 space-y-4 hover:border-slate-300/80 transition-all">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                    AI academic advisory
                  </span>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Syntax Format</h4>
                  <div className="bg-slate-900 text-white font-mono text-xs p-3 rounded-xl border border-slate-800 relative select-all leading-relaxed">
                    ADVISE <span className="text-blue-300 font-extrabold">&lt;matric_no&gt;</span> <span className="text-indigo-300 font-extrabold">&lt;question_or_objective&gt;</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold">Example message:</p>
                  <code className="block bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-200">
                    ADVISE {sampleMatric1} how can I get upper credit?
                  </code>
                  <p className="text-[10px] text-slate-500 leading-normal pt-1">
                    Initiates a high-reasoning Gemini Pro audit of all your transcripts, outputting a precise path-analysis via SMS.
                  </p>
                </div>
              </div>
            </div>

            {/* Sandbox Instruction Banner */}
            <div className="bg-amber-50 text-amber-900 rounded-2xl border border-amber-100 p-4 flex items-start gap-3 text-xs leading-relaxed">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">How to Test the Service Instantly:</p>
                <p className="text-amber-800 font-medium">
                  We have integrated a real-time **SMS Telephony Simulator** on the right side of this screen. 
                  Simply select any student profile in the device dropdown, look up their matriculation number in the examples, 
                  and use the quick buttons or type manual texts to test the immediate automated replies!
                </p>
              </div>
            </div>
          </div>

          {/* Security & Data Privacy Box */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Zero Sensitive Data Exposure Guarantee</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike traditional web portals where private GPA records and grades are published on search-indexed web pages, the **Federal Polytechnic Oko SMS Gateway maintains absolute privacy**. 
              No individual grades, transcript sheets, or cumulative points are displayed anywhere on this public website. 
              Results can only be pulled securely through encrypted SMS handshakes. 
              The SMS gateway strictly verifies that the incoming request originates from the **specific registered mobile SIM phone number** mapped to the student profile in the secure offline department records.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Compliance with Nigerian Data Protection Regulation (NDPR) guidelines.</span>
            </div>
          </div>

          {/* General FAQ Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Frequently Asked Questions</h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3.5 space-y-1">
                <h4 className="font-bold text-slate-800">Who is eligible to use this service?</h4>
                <p className="text-slate-500 leading-relaxed">All active ND and HND computer science students registered at Federal Polytechnic Oko, Atani Campus.</p>
              </div>
              <div className="py-3.5 space-y-1">
                <h4 className="font-bold text-slate-800">What happens if my phone number changes?</h4>
                <p className="text-slate-500 leading-relaxed">You must visit the Computer Science Department registry office to update your registered mobile SIM. Results cannot be fetched from unregistered numbers.</p>
              </div>
              <div className="py-3.5 space-y-1">
                <h4 className="font-bold text-slate-800">Does it work on old non-smartphone devices?</h4>
                <p className="text-slate-500 leading-relaxed">Yes! This is the primary objective of the portal. It operates strictly using basic GSM SMS protocol, meaning even legacy 2G torch phones receive instant grades and counseling.</p>
              </div>
            </div>
          </div>

          {/* Staff Admin Login Drawer Hook */}
          <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Are you an administrative staff member?</span>
            </div>
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl px-4 py-2.5 transition-colors border border-slate-200"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Staff Academic Portal Login</span>
            </button>
          </div>
        </div>
      )}

      {/* STUDENT PORTAL PORT/AUTH TAB CONTROLLER */}
      {currentView === "student-portal" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
              Student Access Gate
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto">
            {/* Tab selector */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              <button
                onClick={() => setActivePortalTab("login")}
                className={`flex-1 py-4 text-center text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all ${
                  activePortalTab === "login"
                    ? "border-emerald-500 text-emerald-800 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Sign In to Portal
              </button>
              <button
                onClick={() => setActivePortalTab("register")}
                className={`flex-1 py-4 text-center text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all ${
                  activePortalTab === "register"
                    ? "border-emerald-500 text-emerald-800 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Register Security PIN
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Notifications Banner */}
              {error && (
                <div className="bg-red-50 text-red-800 rounded-2xl border border-red-100 p-3.5 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 p-3.5 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{success}</span>
                </div>
              )}

              {/* 1. LOGIN STATE */}
              {activePortalTab === "login" && (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-sm">Secure Sign In</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Enter your official matriculation number and your registered security PIN to audit your approved GPA scores.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Academic Matric Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FPO/CS/ND/2024/001"
                        value={loginMatric}
                        onChange={(e) => setLoginMatric(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Private 4-Digit PIN
                      </label>
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={6}
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold tracking-widest focus:outline-none focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl py-3.5 shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span>Authorize & Open Portal</span>
                      </>
                    )}
                  </button>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <p className="text-[11px] text-slate-500">
                      Haven't set your portal security PIN yet?{" "}
                      <button
                        type="button"
                        onClick={() => setActivePortalTab("register")}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Register PIN now
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 2. REGISTER FLOW */}
              {activePortalTab === "register" && (
                <div className="space-y-4">
                  {registerStep === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-800 text-sm">Step 1: Request Registration OTP</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          For security and NDPR compliance, the portal must verify that you possess the phone number registered on our offline databases.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Matriculation Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. FPO/CS/ND/2024/001"
                            value={regMatric}
                            onChange={(e) => setRegMatric(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Registered Mobile Phone Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +2348031234567"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            Must match your registry record. Check the active phone dropdown on the right!
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-slate-950 font-extrabold text-xs rounded-xl py-3.5 shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Dispatching SMS OTP...</span>
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4" />
                            <span>Request Validation OTP</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtpAndSetPin} className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>OTP Dispatched Successfully</span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-sm">Step 2: Verify OTP & Choose PIN</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          We sent a 6-digit verification code to <span className="font-bold text-slate-700">{regPhone}</span>. 
                          Check the **SMS Telephony Simulator** chat on the right side of the screen to view the incoming code!
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            6-Digit Verification Code (OTP)
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP code"
                            maxLength={6}
                            value={regOtp}
                            onChange={(e) => setRegOtp(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold tracking-widest focus:outline-none focus:bg-white focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                              Desired 4-Digit PIN
                            </label>
                            <input
                              type="password"
                              placeholder="••••"
                              maxLength={4}
                              value={regPin}
                              onChange={(e) => setRegPin(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold tracking-widest focus:outline-none focus:bg-white focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                              Confirm PIN
                            </label>
                            <input
                              type="password"
                              placeholder="••••"
                              maxLength={4}
                              value={regConfirmPin}
                              onChange={(e) => setRegConfirmPin(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold tracking-widest focus:outline-none focus:bg-white focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl py-3.5 transition-colors border border-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl py-3.5 shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                              <span>Registering PIN...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Activate Secure Account</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PORTAL DASHBOARD */}
      {currentView === "student-dashboard" && loggedInStudent && (
        <div className="space-y-6">
          {/* Dashboard Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1.5">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-emerald-400/20 tracking-wider">
                Official Student Portal Session
              </span>
              <h2 className="text-xl font-black text-slate-100">{loggedInStudent.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                <span>MATRIC: <strong className="font-mono text-slate-200">{loggedInStudent.matricNo}</strong></span>
                <span>•</span>
                <span>DEPT: <strong className="text-slate-200">{loggedInStudent.department}</strong></span>
                <span>•</span>
                <span>CLASS: <strong className="text-slate-200">{loggedInStudent.programme} ({loggedInStudent.entrySession})</strong></span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl px-4 py-2.5 transition-all border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Academic Summary Stats Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. CGPA Total */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Academic Cumulative CGPA
                </span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">
                  {transcript?.fcgpa?.toFixed(2) || "0.00"}
                </span>
                <span className="text-xs text-slate-400">/ 4.00</span>
              </div>
              <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                Class: {transcript?.classOfDegree || "N/A"}
              </div>
            </div>

            {/* 2. Semester GPA */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Selected Semester GPA
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">
                  {semDetails?.gpa?.toFixed(2) || "0.00"}
                </span>
                <span className="text-xs text-slate-400">for Semester {selectedSemester}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Cumulative Load: <strong className="text-slate-700">{semDetails?.totalUnits || 0} Credits</strong>
              </p>
            </div>

            {/* 3. Senate Verification Card */}
            <div className="bg-emerald-950 text-emerald-100 rounded-2xl border border-emerald-800 p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Official Security Status
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved Records Only
                </h4>
                <p className="text-[10px] text-emerald-400 leading-normal">
                  Grades entry undergoes double auditing prior to senate clearance. Pending courses are kept confidential.
                </p>
              </div>
            </div>
          </div>

          {/* Table list of grades */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden space-y-4">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Semester Transcript Audit</h3>
                <p className="text-[11px] text-slate-400">View official validated results approved by the Department Academic Board.</p>
              </div>

              {/* Semester Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase shrink-0">Semester:</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-5">Course Code</th>
                    <th className="py-3 px-5">Course Title</th>
                    <th className="py-3 px-5 text-center">Credit Units</th>
                    <th className="py-3 px-5 text-center">Letter Grade</th>
                    <th className="py-3 px-5 text-center">Grade Point</th>
                    <th className="py-3 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allCoursesForSelectedSemester.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No results have been uploaded yet for Semester {selectedSemester}.
                      </td>
                    </tr>
                  ) : (
                    allCoursesForSelectedSemester.map((course: any, idx: number) => {
                      const isApproved = course.isApproved;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-mono text-slate-900 font-bold">{course.courseCode}</td>
                          <td className="py-3.5 px-5 text-slate-600">{course.courseTitle}</td>
                          <td className="py-3.5 px-5 text-center text-slate-700 font-mono">{course.units}</td>
                          
                          {/* Grade column (Locked if unapproved) */}
                          <td className="py-3.5 px-5 text-center">
                            {isApproved ? (
                              <span className={`px-2.5 py-1 rounded text-xs font-bold inline-block font-mono ${
                                ["A", "AB", "B"].includes(course.grade)
                                  ? "bg-emerald-50 text-emerald-800"
                                  : ["BC", "C", "CD"].includes(course.grade)
                                    ? "bg-blue-50 text-blue-800"
                                    : "bg-red-50 text-red-800"
                              }`}>
                                {course.grade}
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </span>
                            )}
                          </td>

                          {/* GP column (Locked if unapproved) */}
                          <td className="py-3.5 px-5 text-center font-mono text-slate-700">
                            {isApproved ? course.gp.toFixed(2) : "—"}
                          </td>

                          {/* Approval Status */}
                          <td className="py-3.5 px-5 text-center">
                            {isApproved ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                APPROVED
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> PENDING BOARD
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
          </div>

          {/* AI ADVISOR INSIGHTS DRAWER */}
          <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">High-Reasoning Private AI Academic Advisor</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded">
                Gemini 3.1 Pro Core Enabled
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Our embedded AI models can audit your cumulative polytechnic grades and synthesize a target-focused strategic action plan to lift your academic standing. Enter an objective or query below.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. How can I lift my CGPA to Distinction? What computer science careers fit my best courses?"
                  value={adviceQuestion}
                  onChange={(e) => setAdviceQuestion(e.target.value)}
                  disabled={adviceLoading}
                  className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-900 focus:border-indigo-400 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskAiAdvisor();
                  }}
                />
                <button
                  onClick={handleAskAiAdvisor}
                  disabled={adviceLoading || !adviceQuestion.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-xl px-5 py-3 shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5"
                >
                  {adviceLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Consult AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Display Presets */}
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-300">
                <button
                  onClick={() => {
                    setAdviceQuestion("Analyze my performance and calculate what grades I need to elevate my CGPA to Upper Credit / Distinction.");
                  }}
                  className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all"
                >
                  📈 Projections Target Calculator
                </button>
                <button
                  onClick={() => {
                    setAdviceQuestion("What are my core academic strengths and what critical risk courses should I focus on next semester?");
                  }}
                  className="bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg border border-white/5 transition-all"
                >
                  🔍 Weakness & Risk Diagnosis
                </button>
              </div>

              {/* AI response panel */}
              {(adviceLoading || adviceResponse) && (
                <div className="bg-slate-950/80 rounded-2xl border border-indigo-500/10 p-5 mt-2 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 border-b border-white/5 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Academic Counseling Response</span>
                  </div>

                  {adviceLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                      <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                      <p className="text-[11px] font-medium animate-pulse">
                        Advisor is running deep reasoning model to formulate target CGPA equations...
                      </p>
                    </div>
                  ) : (
                    <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto pr-2">
                      {adviceResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

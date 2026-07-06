import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { getGradeAndGP, getClassOfDegree } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database file path
const DATA_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default database setup
const defaultDb = {
  students: [
    {
      id: "s1",
      matricNo: "FPO/CS/ND/2024/001",
      name: "Obi Emeka Peter",
      phone: "+2348031234567",
      department: "Computer Science",
      programme: "ND",
      entrySession: "2024/2025",
      currentSemester: 2
    },
    {
      id: "s2",
      matricNo: "FPO/CS/ND/2024/002",
      name: "Chinedu Ada Evelyn",
      phone: "+2348067891011",
      department: "Computer Science",
      programme: "ND",
      entrySession: "2024/2025",
      currentSemester: 2
    },
    {
      id: "s3",
      matricNo: "FPO/CS/ND/2024/003",
      name: "Aliyu Musa Bello",
      phone: "+2348091122334",
      department: "Computer Science",
      programme: "ND",
      entrySession: "2024/2025",
      currentSemester: 2
    },
    {
      id: "s4",
      matricNo: "FPO/CS/ND/2024/004",
      name: "Adebayo Segun Samuel",
      phone: "+2348055667788",
      department: "Computer Science",
      programme: "ND",
      entrySession: "2024/2025",
      currentSemester: 2
    }
  ],
  courses: [
    // ND Semester 1
    { id: "c1", code: "COM 111", title: "Introduction to Computing", units: 3, semester: 1, programme: "ND" },
    { id: "c2", code: "COM 112", title: "Introduction to Digital Electronics", units: 2, semester: 1, programme: "ND" },
    { id: "c3", code: "COM 113", title: "Introduction to Programming", units: 3, semester: 1, programme: "ND" },
    { id: "c4", code: "COM 114", title: "Statistics for Computing I", units: 2, semester: 1, programme: "ND" },
    { id: "c5", code: "GNS 111", title: "Citizenship Education I", units: 2, semester: 1, programme: "ND" },
    // ND Semester 2
    { id: "c6", code: "COM 121", title: "Programming in QBasic", units: 3, semester: 2, programme: "ND" },
    { id: "c7", code: "COM 122", title: "Computer Operations", units: 2, semester: 2, programme: "ND" },
    { id: "c8", code: "COM 123", title: "File Organization and Management", units: 2, semester: 2, programme: "ND" },
    { id: "c9", code: "COM 124", title: "Data Structures and Algorithms", units: 3, semester: 2, programme: "ND" },
    { id: "c10", code: "MTH 111", title: "Algebra and Trigonometry", units: 2, semester: 2, programme: "ND" },
    // ND Semester 3
    { id: "c11", code: "COM 211", title: "Programming in C", units: 3, semester: 3, programme: "ND" },
    { id: "c12", code: "COM 212", title: "Systems Analysis and Design", units: 2, semester: 3, programme: "ND" },
    { id: "c13", code: "COM 213", title: "Object-Oriented Programming (Java)", units: 3, semester: 3, programme: "ND" },
    { id: "c14", code: "COM 214", title: "Database Design I", units: 3, semester: 3, programme: "ND" },
    // ND Semester 4
    { id: "c15", code: "COM 221", title: "Programming in Visual Basic", units: 3, semester: 4, programme: "ND" },
    { id: "c16", code: "COM 222", title: "Operating Systems", units: 2, semester: 4, programme: "ND" },
    { id: "c17", code: "COM 223", title: "Database Design II", units: 3, semester: 4, programme: "ND" },
    { id: "c18", code: "COM 224", title: "Project Seminar", units: 4, semester: 4, programme: "ND" }
  ],
  results: [
    // Obi Emeka Peter (s1) Semester 1 (Approved)
    { id: "r1_1", studentId: "s1", courseId: "c1", score: 82, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r1_2", studentId: "s1", courseId: "c2", score: 72, grade: "AB", gp: 3.5, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r1_3", studentId: "s1", courseId: "c3", score: 68, grade: "B", gp: 3.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r1_4", studentId: "s1", courseId: "c4", score: 61, grade: "BC", gp: 2.5, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r1_5", studentId: "s1", courseId: "c5", score: 77, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },

    // Obi Emeka Peter (s1) Semester 2 (Pending/Unapproved)
    { id: "r1_6", studentId: "s1", courseId: "c6", score: 78, grade: "A", gp: 4.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r1_7", studentId: "s1", courseId: "c7", score: 66, grade: "B", gp: 3.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r1_8", studentId: "s1", courseId: "c8", score: 73, grade: "AB", gp: 3.5, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r1_9", studentId: "s1", courseId: "c9", score: 70, grade: "AB", gp: 3.5, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r1_10", studentId: "s1", courseId: "c10", score: 58, grade: "C", gp: 2.0, semester: 2, session: "2024/2025", isApproved: false },

    // Chinedu Ada Evelyn (s2) Semester 1 (Approved)
    { id: "r2_1", studentId: "s2", courseId: "c1", score: 88, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r2_2", studentId: "s2", courseId: "c2", score: 81, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r2_3", studentId: "s2", courseId: "c3", score: 76, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r2_4", studentId: "s2", courseId: "c4", score: 71, grade: "AB", gp: 3.5, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r2_5", studentId: "s2", courseId: "c5", score: 80, grade: "A", gp: 4.0, semester: 1, session: "2024/2025", isApproved: true },

    // Chinedu Ada Evelyn (s2) Semester 2 (Pending/Unapproved)
    { id: "r2_6", studentId: "s2", courseId: "c6", score: 85, grade: "A", gp: 4.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r2_7", studentId: "s2", courseId: "c7", score: 74, grade: "AB", gp: 3.5, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r2_8", studentId: "s2", courseId: "c8", score: 82, grade: "A", gp: 4.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r2_9", studentId: "s2", courseId: "c9", score: 79, grade: "A", gp: 4.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r2_10", studentId: "s2", courseId: "c10", score: 72, grade: "AB", gp: 3.5, semester: 2, session: "2024/2025", isApproved: false },

    // Aliyu Musa Bello (s3) Semester 1 (Approved)
    { id: "r3_1", studentId: "s3", courseId: "c1", score: 52, grade: "CD", gp: 1.5, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r3_2", studentId: "s3", courseId: "c2", score: 48, grade: "D", gp: 1.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r3_3", studentId: "s3", courseId: "c3", score: 42, grade: "E", gp: 0.5, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r3_4", studentId: "s3", courseId: "c4", score: 55, grade: "C", gp: 2.0, semester: 1, session: "2024/2025", isApproved: true },
    { id: "r3_5", studentId: "s3", courseId: "c5", score: 58, grade: "C", gp: 2.0, semester: 1, session: "2024/2025", isApproved: true },

    // Aliyu Musa Bello (s3) Semester 2 (Pending/Unapproved)
    { id: "r3_6", studentId: "s3", courseId: "c6", score: 62, grade: "BC", gp: 2.5, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r3_7", studentId: "s3", courseId: "c7", score: 51, grade: "CD", gp: 1.5, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r3_8", studentId: "s3", courseId: "c8", score: 56, grade: "C", gp: 2.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r3_9", studentId: "s3", courseId: "c9", score: 48, grade: "D", gp: 1.0, semester: 2, session: "2024/2025", isApproved: false },
    { id: "r3_10", studentId: "s3", courseId: "c10", score: 60, grade: "BC", gp: 2.5, semester: 2, session: "2024/2025", isApproved: false }
  ],
  smsLogs: [
    {
      id: "sms1",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender: "+2348031234567",
      recipient: "30012",
      message: "RESULT FPO/CS/ND/2024/001 1",
      direction: "INBOUND",
      status: "DELIVERED",
      type: "PULL"
    },
    {
      id: "sms2",
      timestamp: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(),
      sender: "30012",
      recipient: "+2348031234567",
      message: "FPO Atani Computer Science ND Sem 1 Result:\nObi Emeka Peter\nCOM 111: A (4.0)\nCOM 112: AB (3.5)\nCOM 113: B (3.0)\nCOM 114: BC (2.5)\nGNS 111: A (4.0)\nGPA: 3.42\nCGPA: 3.42 (Upper Credit)\nThank you.",
      direction: "OUTBOUND",
      status: "DELIVERED",
      type: "PULL"
    }
  ]
};

// Helper to read database
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, returning defaultDb", err);
    return defaultDb;
  }
}

// Helper to write database
function writeDb(data: typeof defaultDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Lazy-initialization of Gemini AI Client for environment safety
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in user secrets. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper: Calculate GPA and transcripts for a single student
function calculateStudentGPA(db: typeof defaultDb, studentId: string): any {
  const student = db.students.find((s) => s.id === studentId || s.matricNo === studentId);
  if (!student) return null;

  const results = db.results.filter((r) => r.studentId === student.id);
  const courses = db.courses;

  const gpas: Record<number, any> = {};

  // Group by semester (1 to 4)
  for (let sem = 1; sem <= 4; sem++) {
    const semResults = results.filter((r) => r.semester === sem);
    if (semResults.length === 0) continue;

    let totalUnits = 0;
    let totalGradePoints = 0;
    const list = [];

    for (const r of semResults) {
      const course = courses.find((c) => c.id === r.courseId);
      if (!course) continue;

      totalUnits += course.units;
      totalGradePoints += r.gp * course.units;

      list.push({
        courseCode: course.code,
        courseTitle: course.title,
        units: course.units,
        score: r.score,
        grade: r.grade,
        gp: r.gp,
        isApproved: r.isApproved,
      });
    }

    const gpa = totalUnits > 0 ? parseFloat((totalGradePoints / totalUnits).toFixed(2)) : 0;

    gpas[sem] = {
      semester: sem,
      gpa,
      totalUnits,
      totalGradePoints,
      results: list,
    };
  }

  // Calculate Cumulative GPA (CGPA) - strictly from approved semesters
  let cumulativeUnits = 0;
  let cumulativePoints = 0;

  // Let's also compute separate Approved CGPA and Unapproved CGPA
  let approvedCumulativeUnits = 0;
  let approvedCumulativePoints = 0;

  Object.values(gpas).forEach((semInfo: any) => {
    // For general stats, we might show both, but the actual official CGPA is only based on approved results
    semInfo.results.forEach((res: any) => {
      cumulativeUnits += res.units;
      cumulativePoints += res.gp * res.units;

      if (res.isApproved) {
        approvedCumulativeUnits += res.units;
        approvedCumulativePoints += res.gp * res.units;
      }
    });
  });

  const cgpa = cumulativeUnits > 0 ? parseFloat((cumulativePoints / cumulativeUnits).toFixed(2)) : 0;
  const approvedCgpa = approvedCumulativeUnits > 0 ? parseFloat((approvedCumulativePoints / approvedCumulativeUnits).toFixed(2)) : 0;

  const finalCgpa = approvedCgpa || cgpa; // Fallback to raw cgpa if none approved yet
  const classOfDegree = getClassOfDegree(finalCgpa);

  return {
    student,
    gpas,
    cgpa: parseFloat(cgpa.toFixed(2)),
    approvedCgpa: parseFloat(approvedCgpa.toFixed(2)),
    fcgpa: parseFloat(finalCgpa.toFixed(2)),
    classOfDegree,
  };
}

// --- API ROUTES ---

// Temporary in-memory storage for OTPs
const tempOtps: Record<string, { otp: string; phone: string; expires: number }> = {};

// Student Auth: Request OTP to Set PIN
app.post("/api/auth/student/request-otp", (req, res) => {
  const db = readDb();
  const { matricNo, phone } = req.body;

  if (!matricNo || !phone) {
    return res.status(400).json({ error: "Matriculation number and registered phone number are required." });
  }

  const student = db.students.find(
    (s: any) => s.matricNo.toUpperCase() === matricNo.toUpperCase()
  );

  if (!student) {
    return res.status(404).json({ error: "Matriculation Number not found in our registry." });
  }

  // Clean phones for basic match comparison
  const dbPhoneClean = student.phone.replace(/[^0-9]/g, "");
  const inputPhoneClean = phone.replace(/[^0-9]/g, "");

  if (dbPhoneClean !== inputPhoneClean && !student.phone.includes(phone) && !phone.includes(student.phone)) {
    return res.status(400).json({ 
      error: `The phone number provided does not match the registered phone number (${student.phone}) in our records.` 
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  tempOtps[matricNo.toUpperCase()] = {
    otp,
    phone: student.phone,
    expires: Date.now() + 600000 // 10 minutes
  };

  // Dispatch automated outbound SMS to the student's simulator
  const registerSms = {
    id: "sms_reg_" + Date.now(),
    timestamp: new Date().toISOString(),
    sender: "30012",
    recipient: student.phone,
    message: `[FPO Academic Portal] Verification code for Matric ${student.matricNo} is: ${otp}. Enter this OTP on the portal to set your private 4-digit PIN.`,
    direction: "OUTBOUND" as const,
    status: "DELIVERED" as const,
    type: "PUSH" as const,
  };
  
  db.smsLogs.push(registerSms);
  writeDb(db);

  res.json({ 
    success: true, 
    message: "OTP has been generated and dispatched to your registered SIM. Please check your SMS Telephony Simulator on the right!" 
  });
});

// Student Auth: Verify OTP and Register PIN
app.post("/api/auth/student/verify-otp", (req, res) => {
  const db = readDb();
  const { matricNo, otp, pin } = req.body;

  if (!matricNo || !otp || !pin) {
    return res.status(400).json({ error: "Matriculation number, OTP, and desired PIN are required." });
  }

  const record = tempOtps[matricNo.toUpperCase()];
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ error: "OTP has expired or was not requested. Please request a new OTP." });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid OTP code. Please check the SMS Simulator on the right." });
  }

  const studentIdx = db.students.findIndex(
    (s: any) => s.matricNo.toUpperCase() === matricNo.toUpperCase()
  );

  if (studentIdx === -1) {
    return res.status(404).json({ error: "Student profile not found in registry." });
  }

  // Save the security PIN directly on student
  db.students[studentIdx] = {
    ...db.students[studentIdx],
    pin: pin.trim()
  } as any;

  delete tempOtps[matricNo.toUpperCase()];
  writeDb(db);

  res.json({ 
    success: true, 
    message: "Security PIN registered successfully! You can now log in to your Student Portal." 
  });
});

// Student Auth: Portal Login
app.post("/api/auth/student/login", (req, res) => {
  const db = readDb();
  const { matricNo, pin } = req.body;

  if (!matricNo || !pin) {
    return res.status(400).json({ error: "Matriculation number and security PIN are required." });
  }

  const student = db.students.find(
    (s: any) => s.matricNo.toUpperCase() === matricNo.toUpperCase()
  );

  if (!student) {
    return res.status(404).json({ error: "Student not found with this Matriculation Number." });
  }

  if (!(student as any).pin) {
    return res.status(400).json({ 
      error: "You have not registered a security PIN yet. Please click the Register tab above to set your PIN.",
      requiresRegister: true 
    });
  }

  if ((student as any).pin !== pin.trim()) {
    return res.status(400).json({ error: "Incorrect security PIN. Access denied." });
  }

  res.json({ 
    success: true, 
    student, 
    token: "simulated-jwt-token-for-" + student.id 
  });
});

// 1. Student Routes
app.get("/api/students", (req, res) => {
  const db = readDb();
  res.json(db.students);
});

app.post("/api/students", (req, res) => {
  const db = readDb();
  const newStudent = {
    id: "s_" + Date.now(),
    matricNo: req.body.matricNo,
    name: req.body.name,
    phone: req.body.phone,
    department: req.body.department || "Computer Science",
    programme: req.body.programme || "ND",
    entrySession: req.body.entrySession || "2024/2025",
    currentSemester: parseInt(req.body.currentSemester) || 1
  };

  // Check if matricNo already exists
  if (db.students.some((s) => s.matricNo === newStudent.matricNo)) {
    return res.status(400).json({ error: "Student with this Matriculation Number already exists." });
  }

  db.students.push(newStudent);
  writeDb(db);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const db = readDb();
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Student not found" });

  db.students[idx] = {
    ...db.students[idx],
    name: req.body.name || db.students[idx].name,
    phone: req.body.phone || db.students[idx].phone,
    programme: req.body.programme || db.students[idx].programme,
    entrySession: req.body.entrySession || db.students[idx].entrySession,
    currentSemester: parseInt(req.body.currentSemester) || db.students[idx].currentSemester,
  };

  writeDb(db);
  res.json(db.students[idx]);
});

app.delete("/api/students/:id", (req, res) => {
  const db = readDb();
  db.students = db.students.filter((s) => s.id !== req.params.id);
  db.results = db.results.filter((r) => r.studentId !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});


// 2. Course Routes
app.get("/api/courses", (req, res) => {
  const db = readDb();
  res.json(db.courses);
});

app.post("/api/courses", (req, res) => {
  const db = readDb();
  const newCourse = {
    id: "c_" + Date.now(),
    code: req.body.code,
    title: req.body.title,
    units: parseInt(req.body.units) || 2,
    semester: parseInt(req.body.semester) || 1,
    programme: req.body.programme || "ND"
  };

  if (db.courses.some((c) => c.code === newCourse.code)) {
    return res.status(400).json({ error: "Course with this code already exists." });
  }

  db.courses.push(newCourse);
  writeDb(db);
  res.status(201).json(newCourse);
});

app.delete("/api/courses/:id", (req, res) => {
  const db = readDb();
  db.courses = db.courses.filter((c) => c.id !== req.params.id);
  db.results = db.results.filter((r) => r.courseId !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});


// 3. Result Routes
app.get("/api/results", (req, res) => {
  const db = readDb();
  res.json(db.results);
});

app.post("/api/results", (req, res) => {
  const db = readDb();
  const { studentId, courseId, score, semester, session } = req.body;

  if (!studentId || !courseId || score === undefined || !semester || !session) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { grade, gp } = getGradeAndGP(parseFloat(score));

  // Check if result already exists for this student + course
  const existingIdx = db.results.findIndex(
    (r) => r.studentId === studentId && r.courseId === courseId
  );

  const resultObj = {
    id: existingIdx !== -1 ? db.results[existingIdx].id : "r_" + Date.now(),
    studentId,
    courseId,
    score: parseFloat(score),
    grade,
    gp,
    semester: parseInt(semester),
    session,
    isApproved: existingIdx !== -1 ? db.results[existingIdx].isApproved : false
  };

  if (existingIdx !== -1) {
    db.results[existingIdx] = resultObj;
  } else {
    db.results.push(resultObj);
  }

  writeDb(db);
  res.json(resultObj);
});

// Approve Results & Trigger optional SMS PUSH notifications
app.post("/api/results/approve", (req, res) => {
  const db = readDb();
  const { semester, session, triggerSMS } = req.body;

  if (!semester || !session) {
    return res.status(400).json({ error: "Semester and session are required." });
  }

  const semInt = parseInt(semester);
  let approveCount = 0;
  const pushedSMSList: any[] = [];

  // Approve matches
  db.results = db.results.map((r) => {
    if (r.semester === semInt && r.session === session && !r.isApproved) {
      approveCount++;
      return { ...r, isApproved: true };
    }
    return r;
  });

  writeDb(db);

  // If SMS Push is selected, compile and send results to all matching students
  if (triggerSMS && approveCount > 0) {
    const studentsInvolved = db.students;
    studentsInvolved.forEach((student) => {
      const report = calculateStudentGPA(db, student.id);
      if (report && report.gpas[semInt]) {
        const semInfo = report.gpas[semInt];
        
        // Compile short result text
        let smsText = `FPO Atani CS ${student.programme} Sem ${semInt} Result APPROVED:\n${student.name}\n`;
        semInfo.results.forEach((res: any) => {
          smsText += `${res.courseCode}: ${res.grade} (${res.gp.toFixed(1)})\n`;
        });
        smsText += `GPA: ${semInfo.gpa.toFixed(2)}\nCGPA: ${report.approvedCgpa.toFixed(2)} (${report.classOfDegree})\nCheck via SMS shortcode 30012.`;

        // Save SMS Outbound Log
        const newSMS = {
          id: "sms_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
          timestamp: new Date().toISOString(),
          sender: "30012",
          recipient: student.phone,
          message: smsText,
          direction: "OUTBOUND" as const,
          status: "DELIVERED" as const,
          type: "PUSH" as const,
        };

        db.smsLogs.push(newSMS);
        pushedSMSList.push(newSMS);
      }
    });

    writeDb(db);
  }

  res.json({
    success: true,
    approvedCount: approveCount,
    smsPushedCount: pushedSMSList.length,
    pushedSMS: pushedSMSList
  });
});


// 4. GPA / Analytics endpoint
app.get("/api/gpa/:matricNo", (req, res) => {
  const db = readDb();
  const matricNo = decodeURIComponent(req.params.matricNo);
  const report = calculateStudentGPA(db, matricNo);

  if (!report) {
    return res.status(404).json({ error: "Student not found with matric number: " + matricNo });
  }

  res.json(report);
});


// 5. SMS simulation endpoints
app.get("/api/sms/logs", (req, res) => {
  const db = readDb();
  res.json(db.smsLogs);
});

app.post("/api/sms/logs/clear", (req, res) => {
  const db = readDb();
  db.smsLogs = [];
  writeDb(db);
  res.json({ success: true });
});

// Pull result query or advice request simulation
app.post("/api/sms/simulate-receive", async (req, res) => {
  const db = readDb();
  const { senderPhone, messageText } = req.body;

  if (!senderPhone || !messageText) {
    return res.status(400).json({ error: "senderPhone and messageText are required" });
  }

  const cleanMsg = messageText.trim();
  const timestamp = new Date().toISOString();

  // Save Inbound message first
  const inboundSms = {
    id: "sms_in_" + Date.now(),
    timestamp,
    sender: senderPhone,
    recipient: "30012",
    message: cleanMsg,
    direction: "INBOUND" as const,
    status: "DELIVERED" as const,
    type: "PULL" as const,
  };
  db.smsLogs.push(inboundSms);
  writeDb(db);

  // Parse command
  const parts = cleanMsg.split(/\s+/);
  const command = parts[0].toUpperCase();

  let replyText = "";

  if (command === "HELP") {
    replyText = "FPO Result Service Menu:\n1. RESULT [MatricNo] [Semester]\ne.g. RESULT FPO/CS/ND/2024/001 1\n2. ADVISE [MatricNo] [Your question]\ne.g. ADVISE FPO/CS/ND/2024/001 how can I get upper credit?";
  } 
  else if (command === "RESULT") {
    const matricNo = parts[1];
    const requestedSem = parts[2] ? parseInt(parts[2]) : null;

    if (!matricNo) {
      replyText = "Error: Please provide Matriculation Number. Reply HELP for format.";
    } else {
      const student = db.students.find(
        (s) => s.matricNo.toUpperCase() === matricNo.toUpperCase() || s.phone === senderPhone
      );

      if (!student) {
        replyText = `FPO SMS Gateway:\nError: Phone number or Matric number (${matricNo}) is not registered in our records. Please contact ICT Unit.`;
      } else {
        // Authenticate phone matching as requested in "registered student phone numbers only"
        if (student.phone !== senderPhone) {
          replyText = `Security Alert:\nUnauthorised access. Results can only be requested from the registered student's phone number (${student.phone}).`;
        } else {
          const report = calculateStudentGPA(db, student.id);
          
          if (!report || Object.keys(report.gpas).length === 0) {
            replyText = `FPO SMS Gateway:\nHello ${student.name}, no results are currently uploaded for your profile.`;
          } else {
            // If no specific semester provided, default to their current/latest available approved semester
            const semToQuery = requestedSem || Math.max(...Object.keys(report.gpas).map(Number));
            const semInfo = report.gpas[semToQuery];

            if (!semInfo) {
              replyText = `FPO SMS Gateway:\nNo results uploaded or approved yet for Semester ${semToQuery}. Available semesters: ${Object.keys(report.gpas).join(", ")}`;
            } else {
              // Ensure at least some course results are approved
              const approvedCourses = semInfo.results.filter((r: any) => r.isApproved);
              
              if (approvedCourses.length === 0) {
                replyText = `FPO SMS Gateway:\nSemester ${semToQuery} results are compiled but pending Senate/Academic Board approval.`;
              } else {
                replyText = `FPO Atani Computer Science ${student.programme}\nSemester ${semToQuery} Results:\n`;
                approvedCourses.forEach((r: any) => {
                  replyText += `${r.courseCode}: ${r.grade} (${r.gp.toFixed(1)})\n`;
                });
                // Calculate GPA on approved items only
                let approvedTotalUnits = 0;
                let approvedPoints = 0;
                approvedCourses.forEach((c: any) => {
                  approvedTotalUnits += c.units;
                  approvedPoints += c.gp * c.units;
                });
                const semGpa = approvedTotalUnits > 0 ? (approvedPoints / approvedTotalUnits) : 0;

                replyText += `Sem GPA: ${semGpa.toFixed(2)}\n`;
                replyText += `Official CGPA: ${report.approvedCgpa.toFixed(2)} (${report.classOfDegree})\n`;
                replyText += `FPO ICT Sec Portal.`;
              }
            }
          }
        }
      }
    }
  } 
  else if (command === "ADVISE") {
    // Interactive High Thinking Advisor
    const matricNo = parts[1];
    const question = parts.slice(2).join(" ");

    if (!matricNo || !question) {
      replyText = "Error: Please use format:\nADVISE [MatricNo] [Your academic question]";
    } else {
      const student = db.students.find(
        (s) => s.matricNo.toUpperCase() === matricNo.toUpperCase()
      );

      if (!student) {
        replyText = `Error: Student ${matricNo} not found.`;
      } else if (student.phone !== senderPhone) {
        replyText = `Security Alert:\nAI counseling is restricted to the registered student's phone number.`;
      } else {
        const report = calculateStudentGPA(db, student.id);
        
        try {
          // CALL GEMINI WITH HIGH THINKING MODE
          const ai = getAiClient();
          const transcriptText = JSON.stringify(report, null, 2);

          const systemPrompt = `You are "FPO CS Advisor AI", the high-thinking Academic Advising system for the Computer Science Department at Federal Polytechnic Oko, Atani Campus, Nigeria.
The user is querying you via simulated SMS text. You MUST reply in a concise, highly insightful, encouraging, and actionable manner, suitable for an SMS or mobile chat bubble (keep it within 250-400 words max, structured cleanly with line breaks, avoiding complex markdown formatting).

We use a standard Nigerian Polytechnic 4-point grading scale:
- Distinction: CGPA 3.50 - 4.00
- Upper Credit: CGPA 3.00 - 3.49
- Lower Credit: CGPA 2.50 - 2.99
- Pass: CGPA 2.00 - 2.49
- Fail: CGPA Below 2.00

Here is the student's full academic transcript, profile and CGPA records:
${transcriptText}

The student is asking: "${question}"

Provide a deep, logical, customized response. Address them by name. Check their specific grades. Point out what courses pulled them down or pushed them up, and calculate exactly what grades/GPAs they need in subsequent semesters to reach their goals (e.g. raise CGPA to Distinction or Upper Credit). Be highly encouraging but academically precise! Use the real-time context.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: systemPrompt,
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH
              }
            }
          });

          replyText = response.text || "Sorry, I could not compute an academic advice response at this moment. Please check your network connection.";
        } catch (error: any) {
          console.error("Gemini Advisor AI Error:", error);
          replyText = `FPO Advisor AI:\nError retrieving academic advice. Please check that your GEMINI_API_KEY is configured in Secrets.\nMessage: ${error.message || "Unknown API error"}`;
        }
      }
    }
  } 
  else {
    replyText = `FPO Atani SMS Gateway:\nInvalid SMS format. Text HELP to 30012 to get standard commands list.`;
  }

  // Save Outbound message response
  const outboundSms = {
    id: "sms_out_" + Date.now(),
    timestamp: new Date().toISOString(),
    sender: "30012",
    recipient: senderPhone,
    message: replyText,
    direction: "OUTBOUND" as const,
    status: "DELIVERED" as const,
    type: "PULL" as const,
  };
  
  db.smsLogs.push(outboundSms);
  writeDb(db);

  res.json({ inbound: inboundSms, outbound: outboundSms });
});

// Admin Panel Academic counseling API
app.post("/api/ai/advise-panel", async (req, res) => {
  const { studentId, customQuestion } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  const db = readDb();
  const student = db.students.find((s) => s.id === studentId || s.matricNo === studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const report = calculateStudentGPA(db, student.id);

  try {
    const ai = getAiClient();
    const transcriptText = JSON.stringify(report, null, 2);

    const systemPrompt = `You are "Polytechnic Senate Academic Advisor", an advanced counseling assistant for Federal Polytechnic Oko, Atani Campus.
An administrator is asking you for deep, high-thinking academic advice regarding a student: ${student.name} (${student.matricNo}).

Standard 4-point Scale Class of Degrees:
- Distinction: 3.50 - 4.00
- Upper Credit: 3.00 - 3.49
- Lower Credit: 2.50 - 2.99
- Pass: 2.00 - 2.49

Here is the student's full grade points and semester records:
${transcriptText}

The administrator's question/concern is: "${customQuestion || "Analyze this student's performance and provide a target-focused counseling roadmap."}"

Provide an incredibly detailed, comprehensive, high-quality, professional academic analysis and advisement plan. Include:
1. Performance Diagnosis: Highlight strengths (courses with A or AB) and critical risk areas (failures, passes, or low C/D grades).
2. GPA & CGPA projections: Compute exactly what semester GPAs are needed in subsequent semesters (semesters 3 & 4) to elevate the CGPA to higher classes (e.g., Distinction or Upper Credit).
3. Strategic Remediation plan: Offer custom action items specifically for computer science courses (like programming, math, digital electronics).

Format your output beautifully using rich Markdown so it displays elegantly on the dashboard.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: systemPrompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error("Panel AI Advice Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with high-thinking Gemini model" });
  }
});


// --- INTEGRATE VITE DEVELOPER SERVER OR SERVE STATIC BUILD ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

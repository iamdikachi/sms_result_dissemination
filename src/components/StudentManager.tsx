import React, { useState } from "react";
import { 
  Users, Plus, Search, Edit2, Trash2, X, Check, 
  UserPlus, Smartphone, Hash, FileText 
} from "lucide-react";
import { Student } from "../types.ts";

interface StudentManagerProps {
  students: Student[];
  onRefresh: () => void;
}

export default function StudentManager({ students, onRefresh }: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [phone, setPhone] = useState("");
  const [programme, setProgramme] = useState<"ND" | "HND">("ND");
  const [entrySession, setEntrySession] = useState("2024/2025");
  const [currentSemester, setCurrentSemester] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProgramme, setEditProgramme] = useState<"ND" | "HND">("ND");
  const [editSession, setEditSession] = useState("2024/2025");
  const [editSemester, setEditSemester] = useState(1);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !matricNo || !phone) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          matricNo,
          phone,
          programme,
          entrySession,
          currentSemester,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create student.");
      }

      setSuccess("Student successfully registered in the Oko poly database!");
      setName("");
      setMatricNo("");
      setPhone("");
      setIsAdding(false);
      onRefresh();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditPhone(student.phone);
    setEditProgramme(student.programme);
    setEditSession(student.entrySession);
    setEditSemester(student.currentSemester);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          programme: editProgramme,
          entrySession: editSession,
          currentSemester: editSemester,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes");
      }

      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to completely delete ${name}? This will also delete all their academic results.`)) {
      try {
        const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete student");
        onRefresh();
      } catch (err) {
        alert("Deletion failed.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Student Registry & Records</h2>
          <p className="text-xs text-slate-500">Manage student profiles, matriculation IDs, phone registrations, and current semester statuses.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl px-4 py-2.5 shadow-md transition-all self-start sm:self-auto"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Cancel Registration" : "Register New Student"}</span>
        </button>
      </div>

      {/* Adding Student Panel Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">register new student</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Obi Emeka Peter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Matric Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Matriculation Number *</label>
              <input
                type="text"
                required
                placeholder="e.g., FPO/CS/ND/2024/001"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mobile Number (Registered) *</label>
              <input
                type="text"
                required
                placeholder="e.g., +2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400">Important: This phone number is required to simulate SMS pulling!</span>
            </div>

            {/* Program */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Programme *</label>
              <select
                value={programme}
                onChange={(e) => setProgramme(e.target.value as "ND" | "HND")}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="ND">ND (National Diploma)</option>
                <option value="HND">HND (Higher National Diploma)</option>
              </select>
            </div>

            {/* Current Session */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Entry Session</label>
              <input
                type="text"
                value={entrySession}
                onChange={(e) => setEntrySession(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Current Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Current Semester</label>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={1}>Semester 1 (Year 1 First)</option>
                <option value={2}>Semester 2 (Year 1 Second)</option>
                <option value={3}>Semester 3 (Year 2 First)</option>
                <option value={4}>Semester 4 (Year 2 Second)</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl px-4 py-2.5 transition-all"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Success Notification Banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold animate-pulse">
          {success}
        </div>
      )}

      {/* Search Input Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or matriculation number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 focus:shadow-sm transition-all"
        />
      </div>

      {/* Student Records List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Matriculation ID</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5">Phone (SIM)</th>
                <th className="py-3 px-5">Programme</th>
                <th className="py-3 px-5">Current Semester</th>
                <th className="py-3 px-5">Session</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <span>No students found in the current registry.</span>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isEditing = editingId === student.id;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Matric No */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 tracking-tight">
                        {student.matricNo}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="font-medium">{student.name}</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-5 font-mono text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          student.phone
                        )}
                      </td>

                      {/* Programme */}
                      <td className="py-3.5 px-5">
                        {isEditing ? (
                          <select
                            value={editProgramme}
                            onChange={(e) => setEditProgramme(e.target.value as "ND" | "HND")}
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value="ND">ND</option>
                            <option value="HND">HND</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.programme === "ND" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"}`}>
                            {student.programme}
                          </span>
                        )}
                      </td>

                      {/* Semester */}
                      <td className="py-3.5 px-5 font-medium">
                        {isEditing ? (
                          <select
                            value={editSemester}
                            onChange={(e) => setEditSemester(parseInt(e.target.value))}
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                          >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                            <option value={3}>Semester 3</option>
                            <option value={4}>Semester 4</option>
                          </select>
                        ) : (
                          `Semester ${student.currentSemester}`
                        )}
                      </td>

                      {/* Session */}
                      <td className="py-3.5 px-5 text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSession}
                            onChange={(e) => setEditSession(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs w-24 focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          student.entrySession
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(student.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-md transition-colors"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1 rounded-md transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(student)}
                              className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                              title="Edit Student"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id, student.name)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
    </div>
  );
}

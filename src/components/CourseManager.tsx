import React, { useState } from "react";
import { 
  BookOpen, Plus, Search, Trash2, X, GraduationCap, 
  Hash, Calendar, Layers 
} from "lucide-react";
import { Course } from "../types.ts";

interface CourseManagerProps {
  courses: Course[];
  onRefresh: () => void;
}

export default function CourseManager({ courses, onRefresh }: CourseManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Filter by semester/program
  const [filterSem, setFilterSem] = useState<string>("all");
  const [filterProg, setFilterProg] = useState<string>("all");

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState(3);
  const [semester, setSemester] = useState(1);
  const [programme, setProgramme] = useState<"ND" | "HND">("ND");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSem = filterSem === "all" || c.semester === parseInt(filterSem);
    const matchesProg = filterProg === "all" || c.programme === filterProg;

    return matchesSearch && matchesSem && matchesProg;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || !title || !units) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          title,
          units,
          semester,
          programme,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create course.");
      }

      setSuccess("New course registered successfully in curriculum!");
      setCode("");
      setTitle("");
      setIsAdding(false);
      onRefresh();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete ${code}? This will also delete any grades recorded for this course.`)) {
      try {
        const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete course");
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
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Departmental Curriculum Courses</h2>
          <p className="text-xs text-slate-500">Manage the computer science curriculum, credit load units, and semester arrangements.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl px-4 py-2.5 shadow-md transition-all self-start sm:self-auto"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Cancel Addition" : "Add Course to Curriculum"}</span>
        </button>
      </div>

      {/* Adding Course Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">register new course</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Code */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g., COM 111"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Introduction to Programming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Credit Units */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Credit Units *</label>
              <input
                type="number"
                required
                min={1}
                max={6}
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 2)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
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

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Semester Assignment</label>
              <select
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value))}
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
              Confirm Course Registration
            </button>
          </div>
        </form>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold animate-pulse">
          {success}
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code or course title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Programme Filter */}
          <select
            value={filterProg}
            onChange={(e) => setFilterProg(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-600"
          >
            <option value="all">All Programmes</option>
            <option value="ND">ND (National Diploma)</option>
            <option value="HND">HND (Higher National Diploma)</option>
          </select>

          {/* Semester Filter */}
          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-600"
          >
            <option value="all">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
          </select>
        </div>
      </div>

      {/* Course Records Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Course Code</th>
                <th className="py-3 px-5">Course Title</th>
                <th className="py-3 px-5">Credit Load Units</th>
                <th className="py-3 px-5">Semester Assignment</th>
                <th className="py-3 px-5">Programme</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <span>No matching curriculum courses found.</span>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Course Code */}
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                      {course.code}
                    </td>

                    {/* Course Title */}
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {course.title}
                    </td>

                    {/* Credit Load Units */}
                    <td className="py-3.5 px-5 font-semibold text-slate-500">
                      {course.units} Credit Units
                    </td>

                    {/* Semester */}
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      Semester {course.semester}
                    </td>

                    {/* Programme */}
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${course.programme === "ND" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"}`}>
                        {course.programme}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(course.id, course.code)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

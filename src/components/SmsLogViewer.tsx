import React, { useState } from "react";
import { 
  MessageSquare, Trash2, Search, ArrowDownLeft, ArrowUpRight, 
  Smartphone, Filter, Clock, ShieldCheck, MailWarning 
} from "lucide-react";

interface SmsLogViewerProps {
  smsLogs: any[];
  onRefresh: () => void;
}

export default function SmsLogViewer({ smsLogs, onRefresh }: SmsLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = smsLogs.filter((log) => {
    const matchesSearch = 
      log.sender.includes(searchTerm) || 
      log.recipient.includes(searchTerm) || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDir = filterDirection === "all" || log.direction === filterDirection;
    const matchesType = filterType === "all" || log.type === filterType;

    return matchesSearch && matchesDir && matchesType;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to delete all log entries?")) {
      try {
        await fetch("/api/sms/logs/clear", { method: "POST" });
        onRefresh();
      } catch (err) {
        console.error("Failed to clear logs", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Telephony Gateway Logs</h2>
          <p className="text-xs text-slate-500">Live operational auditing of SMS pull requests, automated result push broadcasts, and AI counselor answers.</p>
        </div>
        <button
          onClick={handleClear}
          disabled={smsLogs.length === 0}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 font-medium text-xs rounded-xl px-4 py-2.5 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Logs Database</span>
        </button>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">total transactions</span>
          <span className="text-xl font-bold text-slate-800">{smsLogs.length}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">student queries (pull)</span>
          <span className="text-xl font-bold text-blue-600">{smsLogs.filter(l => l.type === "PULL" && l.direction === "INBOUND").length}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">automated broadcasts (push)</span>
          <span className="text-xl font-bold text-emerald-600">{smsLogs.filter(l => l.type === "PUSH").length}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">successful delivery rate</span>
          <span className="text-xl font-bold text-indigo-600">100%</span>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by phone number or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Direction */}
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-600"
          >
            <option value="all">All Directions</option>
            <option value="INBOUND">Inbound (Student Queries)</option>
            <option value="OUTBOUND">Outbound (Gateway Responses)</option>
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-600"
          >
            <option value="all">All Channels</option>
            <option value="PULL">PULL (On-demand queries)</option>
            <option value="PUSH">PUSH (Bulk Approved broadcasts)</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5 w-44">Date & Time</th>
                <th className="py-3 px-5 w-32 text-center">Direction</th>
                <th className="py-3 px-5 w-36">Sender ID</th>
                <th className="py-3 px-5 w-36">Recipient ID</th>
                <th className="py-3 px-5">Message Text</th>
                <th className="py-3 px-5 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <span>No simulated gateway logs match the criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isInbound = log.direction === "INBOUND";
                  const isSecurityAlert = log.message.includes("Security Alert");
                  return (
                    <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors ${isSecurityAlert ? "bg-red-50/20" : ""}`}>
                      {/* Date & Time */}
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>

                      {/* Direction */}
                      <td className="py-3.5 px-5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          isInbound 
                            ? "bg-blue-50 text-blue-700 border border-blue-200" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {isInbound ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                              INBOUND
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              OUTBOUND
                            </>
                          )}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600">
                        {log.sender === "30012" ? (
                          <span className="text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded">Shortcode 30012</span>
                        ) : (
                          log.sender
                        )}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-600">
                        {log.recipient === "30012" ? (
                          <span className="text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded">Shortcode 30012</span>
                        ) : (
                          log.recipient
                        )}
                      </td>

                      {/* Message Content */}
                      <td className="py-3.5 px-5">
                        <div className={`p-2 rounded-lg font-sans max-w-xl whitespace-pre-wrap leading-relaxed ${
                          isInbound 
                            ? "bg-slate-50 text-slate-800 font-mono text-[11px]" 
                            : isSecurityAlert 
                              ? "bg-red-50 text-red-900 border border-red-200/50" 
                              : "bg-indigo-950/5 text-slate-700 border border-slate-100"
                        }`}>
                          {log.message}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        {isSecurityAlert ? (
                          <span className="text-red-600 bg-red-50 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                            <MailWarning className="w-3 h-3" /> Alerted
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Sent
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
    </div>
  );
}

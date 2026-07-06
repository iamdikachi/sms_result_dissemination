import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Send, Smartphone, MessageSquare, Shield, HelpCircle, 
  Sparkles, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2 
} from "lucide-react";
import { Student } from "../types.ts";
import { motion, AnimatePresence } from "motion/react";

interface SmsSimulatorProps {
  students: Student[];
  onSmsSentOrReceived: () => void;
  smsLogs: any[];
}

export default function SmsSimulator({ students, onSmsSentOrReceived, smsLogs }: SmsSimulatorProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [customPhone, setCustomPhone] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Active phone number
  const activeStudent = students.find(s => s.id === selectedStudentId);
  const activePhoneNumber = activeStudent ? activeStudent.phone : (customPhone || "+2348011223344");

  // Filter logs associated with this active phone number
  const activeChatLogs = smsLogs.filter(
    log => log.sender === activePhoneNumber || log.recipient === activePhoneNumber
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Synchronize selectedStudentId with students list dynamically
  useEffect(() => {
    if (students.length > 0) {
      const exists = students.some(s => s.id === selectedStudentId);
      if (!exists && selectedStudentId !== "custom") {
        setSelectedStudentId(students[0].id);
      }
    }
  }, [students, selectedStudentId]);

  // Scroll to bottom of chat container only, preventing window auto-scrolling
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeChatLogs]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    setIsSending(true);
    setInputText("");

    try {
      const response = await fetch("/api/sms/simulate-receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderPhone: activePhoneNumber,
          messageText: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message to simulator");
      }

      onSmsSentOrReceived();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const handleClearLogs = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setConfirmClear(false);
    try {
      await fetch("/api/sms/logs/clear", { method: "POST" });
      onSmsSentOrReceived();
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-h-[680px] bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Simulation Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-blue-300 animate-pulse" />
          <div>
            <h3 className="font-semibold text-sm tracking-wide text-white">SMS TELEPHONY SIMULATOR</h3>
            <p className="text-xs text-blue-200">Interactive Student Gateway (Shortcode: 30012)</p>
          </div>
        </div>
        <button 
          onClick={handleClearLogs}
          className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200"
          title="Clear all SMS records"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex flex-col gap-3 shrink-0">
        {/* Student Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Active Mobile Device Profile
          </label>
          <div className="flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                if (e.target.value !== "custom") {
                  setCustomPhone("");
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500/80 transition-colors"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  📱 {student.name} ({student.matricNo})
                </option>
              ))}
              <option value="custom">⚠️ Unregistered / Custom Number</option>
            </select>
          </div>
        </div>

        {/* Custom Phone Number Input if Custom selected */}
        {selectedStudentId === "custom" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter custom phone (e.g. +234...)"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </motion.div>
        )}

        {/* Active Number Status Badge */}
        <div className="flex items-center justify-between text-xs bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/60">
          <span className="text-slate-400">Simulated Phone:</span>
          <span className="font-mono text-emerald-400 font-bold tracking-wide">{activePhoneNumber}</span>
        </div>
      </div>

      {/* Realistic Interactive Phone Screen */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-950 to-black flex flex-col gap-3"
      >
        {activeChatLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-xs font-semibold text-slate-400 mb-1">No Active Chat History</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              Use the quick buttons below or type an SMS message to query the server database.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeChatLogs.map((log) => {
              const isInbound = log.direction === "INBOUND";
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col max-w-[85%] ${isInbound ? "self-end items-end" : "self-start items-start"}`}
                >
                  {/* Header */}
                  <span className="text-[9px] text-slate-500 mb-1 px-1">
                    {isInbound ? "To: Shortcode 30012" : `From: Shortcode 30012 [${log.type}]`}
                  </span>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-3 py-2.5 text-xs shadow-md whitespace-pre-wrap leading-relaxed ${
                      isInbound
                        ? "bg-blue-600 text-white rounded-br-none"
                        : log.message.includes("Security Alert") || log.message.includes("Error:")
                          ? "bg-red-950/90 text-red-100 border border-red-800/50 rounded-bl-none font-sans"
                          : log.message.includes("APPROVED:") 
                            ? "bg-emerald-950/90 text-emerald-100 border border-emerald-800/50 rounded-bl-none"
                            : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50"
                    }`}
                  >
                    {log.message}
                    
                    {/* Interactive visual details */}
                    {!isInbound && log.message.includes("APPROVED:") && (
                      <div className="mt-2 pt-1 border-t border-emerald-800/30 flex items-center justify-between text-[10px] text-emerald-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Official SMS Alert
                        </span>
                        <span className="font-mono text-[9px]">Delivered</span>
                      </div>
                    )}
                  </div>
                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-600 mt-1 px-1 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Commands Drawer (Docked stably below the screen) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
          Quick SMS Commands
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleSend("HELP")}
            disabled={isSending}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl py-2 px-2 text-xs transition-colors hover:text-white cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Send HELP</span>
          </button>
          <button
            onClick={() => {
              if (activeStudent) {
                handleSend(`RESULT ${activeStudent.matricNo} 1`);
              }
            }}
            disabled={isSending || !activeStudent}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl py-2 px-2 text-xs transition-colors hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Pull Sem 1</span>
          </button>
          <button
            onClick={() => {
              if (activeStudent) {
                handleSend(`RESULT ${activeStudent.matricNo} 2`);
              }
            }}
            disabled={isSending || !activeStudent}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl py-2 px-2 text-xs transition-colors hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pull Sem 2</span>
          </button>
          <button
            onClick={() => {
              if (activeStudent) {
                setInputText(`ADVISE ${activeStudent.matricNo} how can I get a distinction next semester?`);
              }
            }}
            disabled={isSending || !activeStudent}
            type="button"
            className="flex items-center justify-center gap-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/40 text-indigo-200 rounded-xl py-2 px-2 text-xs transition-colors hover:text-white disabled:opacity-50 cursor-pointer"
            title="Queries Gemini 3.1 Pro High-Thinking Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI Advisory</span>
          </button>
        </div>
      </div>

      {/* Input Message Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder={isSending ? "Processing request..." : "Type SMS message..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-2xl transition-all duration-200 cursor-pointer"
        >
          {isSending ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}

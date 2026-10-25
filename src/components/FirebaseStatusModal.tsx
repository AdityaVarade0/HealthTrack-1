import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, Server, Key, Copy, Check, X, FileCode } from 'lucide-react';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const schemaTree = `users/
  {uid}/
    displayName, email, phone, role, status, createdAt

patients/
  {uid}/
    medications/
      {medicationId} -> name, dosage, time, instructions, takenDate, pillsRemaining
    healthRecords/
      {recordId} -> bp, systolic, diastolic, sugar, weight, pulse, notes, date
    medicationLogs/
      {logId} -> medicationId, scheduledAt, status, recordedAt
    activity/
      {activityId} -> title, description, icon, date`;

  const copyConfigExample = () => {
    navigator.clipboard.writeText(`window.__FIREBASE_CONFIG__ = {
  apiKey: "AIzaSy...",
  authDomain: "healthtrack-demo.firebaseapp.com",
  projectId: "healthtrack-demo",
  storageBucket: "healthtrack-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#f0f3f8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef8f5] text-[#239b76] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#172b4d]">
                  Cloud & Firebase Architecture
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f9f2] text-[#239b76]">
                  Phase A Ready
                </span>
              </div>
              <p className="text-xs text-[#8b96aa] mt-0.5">
                Architecture implementation from FIREBASE_IMPLEMENTATION_PLAN.md
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#172b4d]">
          {/* Active Mode Banner */}
          <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#e2e8f0] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#239b76] text-white flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-extrabold text-[#172b4d] block">
                Local-First & Multi-Patient Isolated Storage Active
              </strong>
              <p className="text-[11px] text-[#6b778c] mt-0.5 leading-relaxed">
                The application runs seamlessly with instant local persistence and zero-delay offline capability. Multi-patient accounts (Sarah Jenkins, Alex Rivera, custom patients) store their medications, health readings, and activity safely in partitioned local storage.
              </p>
            </div>
          </div>

          {/* Firestore Collections Schema */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-[#172b4d] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <Server className="w-3.5 h-3.5 text-[#6558d3]" />
                <span>Planned Firestore Document Tree</span>
              </div>
              <span className="text-[10px] text-[#6b778c]">Native Mode</span>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto">
              {schemaTree}
            </pre>
          </div>

          {/* Security Rules Preview */}
          <div>
            <div className="font-extrabold text-[#172b4d] flex items-center gap-1.5 uppercase text-[11px] tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#239b76]" />
              <span>Security Rules Isolation (`firestore.rules`)</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#e2e8f0] space-y-2 text-[11px] text-[#596780]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#239b76]"></span>
                <span>
                  <strong>Strict Patient Isolation:</strong> Users can only read/write their own subcollections (
                  <code>patients/&#123;uid&#125;/**</code>).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#239b76]"></span>
                <span>
                  <strong>Deny by Default:</strong> Unauthenticated requests are blocked at the rule level.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#239b76]"></span>
                <span>
                  <strong>Immutable Ownership:</strong> Client cannot escalate role from patient to admin.
                </span>
              </div>
            </div>
          </div>

          {/* Connect Live Firebase Instructions */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#172b4d] flex items-center gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5 text-[#6558d3]" />
                <span>Live Project Configuration Template</span>
              </div>
              <button
                onClick={copyConfigExample}
                className="flex items-center gap-1 text-[11px] font-bold text-[#6558d3] hover:underline"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#6b778c]">
              When you are ready to connect to a live Firebase Console project, copy <code>firebase-config.example.js</code> to <code>firebase-config.js</code> with your project's credentials.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#f0f3f8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#6558d3] text-white text-xs font-bold hover:bg-[#5446c7] transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};

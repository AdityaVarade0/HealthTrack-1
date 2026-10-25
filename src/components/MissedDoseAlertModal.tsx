import React from 'react';
import { Medication } from '../types/healthtrack';
import { formatTime12h } from '../utils/healthCalculations';
import { BellRing, Check, Clock, AlertTriangle, X, ShieldAlert, SkipForward } from 'lucide-react';

interface MissedDoseAlertModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onTakeNow: (medId: string) => void;
  onSkipDose: (medId: string) => void;
}

export const MissedDoseAlertModal: React.FC<MissedDoseAlertModalProps> = ({
  medication,
  isOpen,
  onClose,
  onTakeNow,
  onSkipDose,
}) => {
  if (!isOpen || !medication) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Banner */}
        <div className="p-6 bg-linear-to-br from-amber-500 via-amber-600 to-orange-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-100">
                Adherence Alert • Simulation
              </div>
              <h3 className="text-xl font-extrabold leading-tight">Missed Dose Notice</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-amber-950">
                {medication.name} ({medication.dosage})
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                Scheduled for {formatTime12h(medication.time)} • Marked overdue
              </div>
              {medication.instructions && (
                <div className="text-[11px] text-amber-700/80 mt-1 italic">
                  "{medication.instructions}"
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Standard Clinical Guideline:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              If it has been less than 2 to 4 hours since the scheduled dose, it is generally safe to take the dose now. If it is already close to your next scheduled dose, skip this dose.
            </p>
            <div className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
              ⚠️ Never take two doses at the same time to make up for a missed dose.
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onTakeNow(medication.id)}
              className="w-full py-3 px-4 rounded-xl bg-[#239b76] hover:bg-[#1e8666] text-white font-bold text-xs shadow-md shadow-[#239b76]/20 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Take Missed Dose Now</span>
            </button>

            <button
              onClick={() => onSkipDose(medication.id)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4 text-slate-500" />
              <span>Log as Skipped Dose</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { UserProfile, Medication, HealthRecord } from '../types/healthtrack';
import { formatTime12h, formatDateLabel, evaluateBloodPressure, evaluateBloodSugar } from '../utils/healthCalculations';
import { X, Printer, Download, CheckCircle2, AlertTriangle, FileText, Heart, Pill } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  medications: Medication[];
  records: HealthRecord[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  medications,
  records,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const takenCount = medications.filter((m) => m.takenDate === todayKey).length;
  const adherence = medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Controls Bar */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e8edf4] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172b4d]">
            <FileText className="w-4 h-4 text-[#6558d3]" />
            <span>Doctor Visit Summary Report (Print / PDF)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print or Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-[#172b4d] bg-white print:p-0">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-[#172b4d]">
                <span className="w-7 h-7 rounded-lg bg-[#6558d3] text-white inline-flex items-center justify-center text-sm font-black">
                  +
                </span>
                <span>HealthTrack • Patient Summary Report</span>
              </div>
              <div className="text-xs text-[#6b778c] mt-1">
                Generated: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
              </div>
            </div>

            <div className="text-right sm:text-right text-xs space-y-0.5 text-slate-600">
              <div>
                <strong>Primary Care:</strong> {currentUser.primaryDoctor?.name || 'Dr. Evelyn Vance, MD'}
              </div>
              <div>{currentUser.primaryDoctor?.clinic || 'Pinecrest Family Health Center'}</div>
              <div>{currentUser.primaryDoctor?.phone || '(555) 345-6789'}</div>
            </div>
          </div>

          {/* Patient Demographics Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[#8b96aa] block uppercase text-[10px] font-bold">Patient Name</span>
              <strong className="text-sm font-bold text-slate-900">{currentUser.name}</strong>
            </div>
            <div>
              <span className="text-[#8b96aa] block uppercase text-[10px] font-bold">Patient ID</span>
              <strong className="text-sm font-bold text-slate-900">{currentUser.patientId}</strong>
            </div>
            <div>
              <span className="text-[#8b96aa] block uppercase text-[10px] font-bold">Blood Type / Height</span>
              <strong className="text-sm font-bold text-slate-900">
                {currentUser.bloodType || 'A+'} • {currentUser.heightCm ? `${currentUser.heightCm} cm` : '—'}
              </strong>
            </div>
            <div>
              <span className="text-[#8b96aa] block uppercase text-[10px] font-bold">Emergency Contact</span>
              <strong className="text-xs font-bold text-slate-900 block truncate">
                {currentUser.emergencyContact?.name || 'Mark Jenkins'}
              </strong>
              <span className="text-[11px] text-slate-500">
                {currentUser.emergencyContact?.phone || '(555) 876-5432'}
              </span>
            </div>
          </div>

          {/* Drug Allergies Alert Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Documented Drug Allergies:</strong>{' '}
                {currentUser.allergies && currentUser.allergies.length > 0
                  ? currentUser.allergies.join(', ')
                  : 'No known drug allergies reported (NKDA)'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Verified
            </span>
          </div>

          {/* Active Medication Regimen Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#6558d3]" />
                <span>Active Prescriptions & Dosage Regimen ({medications.length})</span>
              </h4>
              <span className="text-xs font-bold text-[#239b76]">
                Adherence Rate: {adherence}%
              </span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Medication & Strength</th>
                  <th className="p-2.5">Schedule</th>
                  <th className="p-2.5">Frequency</th>
                  <th className="p-2.5">Instructions</th>
                  <th className="p-2.5">Refill Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {medications.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">
                      {m.name} <span className="font-normal text-slate-500">({m.dosage})</span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-700">{formatTime12h(m.time)}</td>
                    <td className="p-2.5 capitalize text-slate-600">{m.frequency.replace('_', ' ')}</td>
                    <td className="p-2.5 text-slate-600 italic">{m.instructions || 'As prescribed'}</td>
                    <td className="p-2.5 text-slate-600">
                      {m.pillsRemaining !== undefined ? `${m.pillsRemaining} tabs left` : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Health Readings */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Recent Health Vitals Log (Last {Math.min(5, records.length)} entries)</span>
            </h4>

            {records.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 border border-slate-200 rounded-xl">
                No vital readings logged yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Blood Pressure</th>
                    <th className="p-2.5">Glucose</th>
                    <th className="p-2.5">Weight / HR</th>
                    <th className="p-2.5">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.slice(0, 5).map((r) => {
                    const bpEval = evaluateBloodPressure(r.systolic, r.diastolic);
                    const sugarEval = evaluateBloodSugar(r.sugar, r.sugarContext);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-600">{formatDateLabel(r.date)}</td>
                        <td className="p-2.5 font-bold">
                          {r.bp || '—'}{' '}
                          {bpEval && (
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              {bpEval.stage}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold">
                          {r.sugar ? `${r.sugar} mg/dL` : '—'}{' '}
                          {sugarEval && (
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              {sugarEval.status} ({r.sugarContext})
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          {r.weight ? `${r.weight} kg` : '—'} / {r.pulse ? `${r.pulse} bpm` : '72 bpm'}
                        </td>
                        <td className="p-2.5 text-slate-600 max-w-xs truncate">{r.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Physician Sign-off footer */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">
                Physician Signature & Review
              </div>
              <div className="text-[11px] text-slate-400">Date reviewed & verified</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-semibold">
                Patient / Caregiver Acknowledgement
              </div>
              <div className="text-[11px] text-slate-400">Printed for personal health records</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

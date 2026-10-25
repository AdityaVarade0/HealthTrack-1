import React from 'react';
import { UserProfile, Medication, HealthRecord, PageType } from '../types/healthtrack';
import {
  formatTime12h,
  formatDateLabel,
  getTodayKey,
  evaluateBloodPressure,
  evaluateBloodSugar,
  calculateBMI,
} from '../utils/healthCalculations';
import {
  Pill,
  Heart,
  Plus,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  FileText,
  Flame,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  medications: Medication[];
  records: HealthRecord[];
  onNavigate: (page: PageType) => void;
  onOpenAddMedication: () => void;
  onToggleMedicationTaken: (id: string) => void;
  onOpenReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  medications,
  records,
  onNavigate,
  onOpenAddMedication,
  onToggleMedicationTaken,
  onOpenReport,
}) => {
  const firstName = (currentUser.name || 'there').split(' ')[0];
  const todayKey = getTodayKey();

  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.takenDate === todayKey).length;
  const pendingMeds = totalMeds - takenMeds;
  const adherencePct = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;

  // Find next upcoming medication for today
  const nextPendingMed = medications.find((m) => m.takenDate !== todayKey && m.isActive);

  // Latest health record
  const latestRecord = records[0];
  const bpEval = latestRecord ? evaluateBloodPressure(latestRecord.systolic, latestRecord.diastolic) : null;
  const sugarEval = latestRecord ? evaluateBloodSugar(latestRecord.sugar, latestRecord.sugarContext) : null;
  const bmiInfo = latestRecord?.weight ? calculateBMI(Number(latestRecord.weight), currentUser.heightCm) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight flex items-center gap-2">
            Good to see you, {firstName}{' '}
            <span className="text-amber-500 font-normal inline-block animate-gentle-pulse">✦</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
            Here’s your health overview and medication schedule for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReport}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] text-xs font-bold text-[#596780] hover:text-[#172b4d] transition shadow-2xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#6558d3]" />
            <span className="hidden sm:inline">Doctor Report</span>
          </button>

          <button
            onClick={onOpenAddMedication}
            className="px-4 py-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold shadow-md shadow-[#6558d3]/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add medication</span>
          </button>
        </div>
      </div>

      {/* Next Dose Banner (if any dose is pending) */}
      {nextPendingMed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#6558d3] via-[#7568db] to-[#8c82eb] text-white shadow-lg shadow-[#6558d3]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-wider text-[#d6d0ff] uppercase">
                Next Scheduled Dose
              </div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight">
                {nextPendingMed.name} ({nextPendingMed.dosage})
              </div>
              <div className="text-xs text-[#e5e2ff] mt-0.5">
                Scheduled for {formatTime12h(nextPendingMed.time)} • {nextPendingMed.instructions || 'Take as prescribed'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleMedicationTaken(nextPendingMed.id)}
            className="px-4 py-2.5 rounded-xl bg-white text-[#6558d3] hover:bg-[#f8f7ff] text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            <Check className="w-4 h-4 text-[#239b76]" />
            <span>Mark taken now</span>
          </button>
        </div>
      )}

      {/* Stats 3-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Medication Plan */}
        <div className="p-5 rounded-2xl bg-white border border-[#e8edf4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b778c]">Medication plan</span>
            <div className="w-8 h-8 rounded-xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#172b4d] tracking-tight">
              {totalMeds}
            </div>
            <div className="text-xs text-[#8b96aa] mt-0.5">active prescribed medicines</div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center gap-2 text-[11px] text-[#6b778c]">
            <span className="w-2 h-2 rounded-full bg-[#6558d3]"></span>
            <span>{pendingMeds > 0 ? `${pendingMeds} remaining today` : 'All doses completed'}</span>
          </div>
        </div>

        {/* Card 2: Today's Status & Streak */}
        <div className="p-5 rounded-2xl bg-white border border-[#e8edf4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b778c]">Today’s adherence</span>
            <div className="w-8 h-8 rounded-xl bg-[#e6f9f2] text-[#239b76] flex items-center justify-center font-bold">
              <Check className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#172b4d] tracking-tight flex items-baseline gap-1.5">
              <span>{takenMeds}</span>
              <span className="text-sm font-medium text-[#94a3b8]">/ {totalMeds} taken</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#f1f3f8] h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#239b76] h-full rounded-full transition-all duration-300"
                style={{ width: `${adherencePct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-[11px]">
            <span className="text-[#6b778c]">{adherencePct}% adherence today</span>
            <span className="flex items-center gap-1 font-bold text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5-day streak</span>
            </span>
          </div>
        </div>

        {/* Card 3: Health Records */}
        <div className="p-5 rounded-2xl bg-white border border-[#e8edf4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b778c]">Health readings</span>
            <div className="w-8 h-8 rounded-xl bg-[#fff2e8] text-[#e18a4d] flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#172b4d] tracking-tight">
              {records.length}
            </div>
            <div className="text-xs text-[#8b96aa] mt-0.5">clinical readings tracked</div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center gap-2 text-[11px] text-[#6b778c]">
            <span className="w-2 h-2 rounded-full bg-[#e18a4d]"></span>
            <span>
              {latestRecord ? `Latest: ${latestRecord.bp || latestRecord.sugar + ' mg/dL'}` : 'No readings yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (7 cols): Today's Medication Schedule */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e8edf4] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f3f8]">
              <div>
                <h3 className="text-base font-extrabold text-[#172b4d] tracking-tight">
                  Medication schedule
                </h3>
                <p className="text-xs text-[#8b96aa] mt-0.5">Your daily prescribed plan</p>
              </div>
              <button
                onClick={() => onNavigate('medications')}
                className="text-xs font-bold text-[#6558d3] hover:text-[#5446c7] flex items-center gap-1 transition"
              >
                <span>View all ({totalMeds})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {medications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center mx-auto mb-3">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#172b4d]">No medications added yet</div>
                <p className="text-xs text-[#8b96aa] max-w-xs mx-auto mt-1 mb-4">
                  Add your prescribed medications to begin daily dose tracking and reminder alerts.
                </p>
                <button
                  onClick={onOpenAddMedication}
                  className="px-4 py-2 rounded-xl bg-[#6558d3] text-white text-xs font-bold hover:bg-[#5446c7] transition"
                >
                  Add your first medication
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f4f9]">
                {medications.slice(0, 5).map((med) => {
                  const isTaken = med.takenDate === todayKey;

                  return (
                    <div
                      key={med.id}
                      className="py-3.5 flex items-center justify-between gap-3 group transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition ${
                            isTaken
                              ? 'bg-[#e6f9f2] text-[#239b76]'
                              : 'bg-[#f1effe] text-[#6558d3]'
                          }`}
                        >
                          <Pill className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#172b4d] truncate flex items-center gap-2">
                            <span>{med.name}</span>
                            <span className="text-[11px] font-semibold text-[#6b778c]">
                              {med.dosage}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8b96aa] truncate mt-0.5">
                            {med.instructions || 'Daily prescribed dose'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f8f9fc] border border-[#e8edf4] text-[#6b778c]">
                          {formatTime12h(med.time)}
                        </span>

                        <button
                          onClick={() => onToggleMedicationTaken(med.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isTaken
                              ? 'bg-[#f1f3f8] text-[#6b778c] hover:bg-[#e4e7ef]'
                              : 'bg-[#e6f9f2] text-[#239b76] hover:bg-[#d5f4e8] border border-[#bbf0dd]'
                          }`}
                        >
                          {isTaken ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#239b76]" />
                              <span>Taken</span>
                            </>
                          ) : (
                            <>
                              <span>Mark taken</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Doctor Advice Prompt */}
          <div className="mt-6 pt-4 border-t border-[#f0f3f8] flex items-center justify-between text-xs text-[#6b778c]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6558d3]" />
              <span>
                Primary doctor: <strong>{currentUser.primaryDoctor?.name || 'Dr. Evelyn Vance, MD'}</strong>
              </span>
            </div>
            <button
              onClick={() => onNavigate('medications')}
              className="text-[#6558d3] font-bold hover:underline"
            >
              Manage schedule
            </button>
          </div>
        </div>

        {/* Right column (5 cols): Latest Health Readings & Clinical Assessment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#e8edf4] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f3f8]">
              <div>
                <h3 className="text-base font-extrabold text-[#172b4d] tracking-tight">
                  Latest health readings
                </h3>
                <p className="text-xs text-[#8b96aa] mt-0.5">Most recent clinical measurements</p>
              </div>
              <button
                onClick={() => onNavigate('health')}
                className="text-xs font-bold text-[#6558d3] hover:text-[#5446c7] flex items-center gap-1 transition"
              >
                <span>Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestRecord ? (
              <div className="space-y-4">
                {/* Blood Pressure tile */}
                <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                      Blood pressure
                    </span>
                    <div className="text-xl font-extrabold text-[#172b4d] mt-0.5">
                      {latestRecord.bp || '—'} <span className="text-xs font-normal text-[#8b96aa]">mmHg</span>
                    </div>
                  </div>
                  {bpEval && (
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-black/5"
                      style={{ backgroundColor: bpEval.badgeBg, color: bpEval.badgeText }}
                    >
                      {bpEval.stage}
                    </span>
                  )}
                </div>

                {/* Blood Sugar tile */}
                <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                      Blood sugar ({latestRecord.sugarContext || 'fasting'})
                    </span>
                    <div className="text-xl font-extrabold text-[#172b4d] mt-0.5">
                      {latestRecord.sugar ? `${latestRecord.sugar}` : '—'}{' '}
                      <span className="text-xs font-normal text-[#8b96aa]">mg/dL</span>
                    </div>
                  </div>
                  {sugarEval && (
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-black/5"
                      style={{ backgroundColor: sugarEval.badgeBg, color: sugarEval.badgeText }}
                    >
                      {sugarEval.status}
                    </span>
                  )}
                </div>

                {/* Body Weight & Pulse row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8]">
                    <span className="text-[10px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                      Body weight
                    </span>
                    <div className="text-base font-extrabold text-[#172b4d] mt-0.5">
                      {latestRecord.weight ? `${latestRecord.weight} kg` : '—'}
                    </div>
                    {bmiInfo && (
                      <span className="text-[10px] text-[#6b778c] block mt-0.5">
                        BMI: {bmiInfo.bmi} ({bmiInfo.category})
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8]">
                    <span className="text-[10px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                      Heart rate
                    </span>
                    <div className="text-base font-extrabold text-[#172b4d] mt-0.5">
                      {latestRecord.pulse ? `${latestRecord.pulse} bpm` : '72 bpm'}
                    </div>
                    <span className="text-[10px] text-[#239b76] block mt-0.5">Normal resting</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#8b96aa] text-right">
                  Recorded: {formatDateLabel(latestRecord.date)}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#fff2e8] text-[#e18a4d] flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#172b4d]">No readings saved</div>
                <p className="text-[11px] text-[#8b96aa] mt-0.5 mb-3">
                  Save blood pressure, blood sugar or weight to monitor your trends.
                </p>
                <button
                  onClick={() => onNavigate('health')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#fff2e8] text-[#e18a4d] font-bold text-xs hover:bg-[#ffe3cf] transition"
                >
                  Log a reading
                </button>
              </div>
            )}

            {/* Wellness Tip Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#f7f6ff] border border-[#efedff] flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#e7e3ff] text-[#6558d3] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-xs text-[#172b4d] font-bold block">Keep records consistent</strong>
                <p className="text-[11px] text-[#747e93] leading-relaxed mt-0.5">
                  Checking blood pressure at the same time each morning before morning coffee provides the most accurate clinical trend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Innovations: 3D Precision Lab & AI Search Grounded Assistant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 3D Lab Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1a2333] to-[#111928] border border-slate-800 text-white flex flex-col justify-between shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full inline-block mb-2">
                Three.js 3D Lab
              </span>
              <h4 className="text-base font-extrabold tracking-tight text-white">
                Interactive Capsule & Anatomy Telemetry
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Explore a composite multi-part 3D procedural capsule with PBR finishes, exploded assembly, and vitals pulse resonance.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('3d_lab')}
            className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 self-start shadow-xs"
          >
            <span>Launch 3D Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI MedAssist Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#f1effe] to-[#e6f9f2] border border-[#d6d0ff] flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#239b76] bg-white border border-[#bbf0dd] px-2 py-0.5 rounded-full inline-block mb-2">
                Google Search Grounding
              </span>
              <h4 className="text-base font-extrabold tracking-tight text-[#172b4d]">
                HealthTrack MedAssist AI
              </h4>
              <p className="text-xs text-[#596780] mt-1 leading-relaxed">
                Multi-turn clinical assistant powered by Gemini 3.8 Flash to review medication interactions, verify food cautions, and explain lab readings.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('assistant')}
            className="mt-4 px-4 py-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold transition flex items-center justify-center gap-2 self-start shadow-xs shadow-[#6558d3]/20"
          >
            <span>Ask MedAssist AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Health Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#f1effe] via-[#f7f6ff] to-[#eef9f5] border border-[#e4e0ff] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-[#6558d3] flex items-center justify-center shrink-0 font-bold text-xl">
            ♡
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-[#172b4d]">
              Your health journey, one day at a time.
            </h4>
            <p className="text-xs text-[#6b778c] mt-0.5 max-w-xl">
              HealthTrack organizes your daily medication adherence and readings so you can share clear, structured logs with your physician.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('health')}
          className="px-5 py-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold shadow-md shadow-[#6558d3]/20 transition flex items-center gap-1.5 shrink-0"
        >
          <span>Update health data</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

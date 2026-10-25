import React, { useState } from 'react';
import { HealthRecord, UserProfile } from '../types/healthtrack';
import {
  parseBloodPressure,
  evaluateBloodPressure,
  evaluateBloodSugar,
  calculateBMI,
  formatDateLabel,
  exportHealthRecordsCSV,
} from '../utils/healthCalculations';
import {
  Heart,
  Activity,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface HealthRecordsViewProps {
  currentUser: UserProfile;
  records: HealthRecord[];
  onSaveRecord: (record: Omit<HealthRecord, 'id' | 'patientUid' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  currentUser,
  records,
  onSaveRecord,
  onDeleteRecord,
}) => {
  const [bpInput, setBpInput] = useState('');
  const [sugarInput, setSugarInput] = useState('');
  const [sugarContext, setSugarContext] = useState<'fasting' | 'post_meal' | 'random'>('fasting');
  const [weightInput, setWeightInput] = useState('');
  const [pulseInput, setPulseInput] = useState('72');
  const [notesInput, setNotesInput] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Live validation & evaluation as user types
  const parsedBp = parseBloodPressure(bpInput);
  const liveBpEval = parsedBp ? evaluateBloodPressure(parsedBp.systolic, parsedBp.diastolic) : null;
  const liveSugarEval = sugarInput ? evaluateBloodSugar(sugarInput, sugarContext) : null;

  const numericWeight = weightInput ? parseFloat(weightInput) : undefined;
  const weightInKg = numericWeight
    ? weightUnit === 'lbs'
      ? numericWeight * 0.453592
      : numericWeight
    : undefined;
  const liveBmi = calculateBMI(weightInKg, currentUser.heightCm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpInput.trim() && !sugarInput.trim() && !weightInput.trim() && !notesInput.trim()) {
      return;
    }

    onSaveRecord({
      date: new Date().toISOString(),
      bp: bpInput.trim() || undefined,
      systolic: parsedBp?.systolic,
      diastolic: parsedBp?.diastolic,
      sugar: sugarInput ? parseFloat(sugarInput) : undefined,
      sugarContext,
      weight: weightInKg ? Number(weightInKg.toFixed(1)) : undefined,
      pulse: pulseInput ? parseInt(pulseInput, 10) : undefined,
      notes: notesInput.trim() || undefined,
    });

    // Reset form
    setBpInput('');
    setSugarInput('');
    setWeightInput('');
    setNotesInput('');
  };

  const handleDownloadCSV = () => {
    if (records.length === 0) return;
    const csvContent = exportHealthRecordsCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HealthTrack_Vitals_${currentUser.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latest = records[0];
  const latestBpEval = latest ? evaluateBloodPressure(latest.systolic, latest.diastolic) : null;
  const latestSugarEval = latest ? evaluateBloodSugar(latest.sugar, latest.sugarContext) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight">
            Health records & vitals
          </h2>
          <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
            Log your blood pressure, glucose, body weight, and track clinical trends.
          </p>
        </div>

        {records.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] text-xs font-bold text-[#596780] hover:text-[#172b4d] transition flex items-center gap-2 self-start sm:self-auto shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#6558d3]" />
            <span>Export CSV Log</span>
          </button>
        )}
      </div>

      {/* Main Grid: Form (left) + Latest Summary & Trend (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record a Reading Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e8edf4] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f3f8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#fff2e8] text-[#e18a4d] flex items-center justify-center font-bold">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#172b4d]">Record a reading</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#8b96aa]">New entry</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Blood Pressure Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#596780]">
                  Blood pressure <span className="text-[#9ca3af] font-normal">(mmHg)</span>
                </label>
                {liveBpEval && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: liveBpEval.badgeBg, color: liveBpEval.badgeText }}
                  >
                    {liveBpEval.stage}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={bpInput}
                onChange={(e) => setBpInput(e.target.value)}
                placeholder="e.g. 120/80"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
              />
              <span className="text-[10px] text-[#9ca3af] mt-1 block">
                Standard format: Systolic / Diastolic (e.g. 120/80)
              </span>
            </div>

            {/* Blood Sugar Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#596780]">
                  Blood glucose <span className="text-[#9ca3af] font-normal">(mg/dL)</span>
                </label>
                {liveSugarEval && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: liveSugarEval.badgeBg, color: liveSugarEval.badgeText }}
                  >
                    {liveSugarEval.status}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="1"
                  min="30"
                  max="600"
                  value={sugarInput}
                  onChange={(e) => setSugarInput(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                />
                <select
                  value={sugarContext}
                  onChange={(e) => setSugarContext(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none bg-white"
                >
                  <option value="fasting">Fasting</option>
                  <option value="post_meal">Post-meal (2h)</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>

            {/* Weight and Heart Rate row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#596780]">Weight</label>
                  <button
                    type="button"
                    onClick={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
                    className="text-[10px] text-[#6558d3] font-bold uppercase underline"
                  >
                    {weightUnit}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={weightUnit === 'kg' ? '65.5' : '144.4'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                />
                {liveBmi && (
                  <span className="text-[10px] text-[#6b778c] mt-1 block">
                    BMI: {liveBmi.bmi} ({liveBmi.category})
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">
                  Pulse / HR <span className="text-[#9ca3af] font-normal">(bpm)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="40"
                  max="220"
                  value={pulseInput}
                  onChange={(e) => setPulseInput(e.target.value)}
                  placeholder="72"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Notes & symptoms <span className="text-[#9ca3af] font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Any symptoms, post-exercise feeling, or notes for your doctor..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white font-bold text-xs shadow-md shadow-[#6558d3]/20 transition flex items-center justify-center gap-2"
            >
              <span>Save health record</span>
              <span>→</span>
            </button>
          </form>
        </div>

        {/* Latest Readings Summary & Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-[#e8edf4] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f3f8]">
              <div>
                <h3 className="text-base font-extrabold text-[#172b4d]">Latest reading snapshot</h3>
                <p className="text-xs text-[#8b96aa] mt-0.5">Most recently logged measurement</p>
              </div>
              {latest && (
                <span className="text-xs text-[#8b96aa] font-medium">
                  {formatDateLabel(latest.date)}
                </span>
              )}
            </div>

            {latest ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8]">
                  <span className="text-[10px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                    Blood pressure
                  </span>
                  <div className="text-xl font-extrabold text-[#172b4d] mt-1">
                    {latest.bp || '—'}
                  </div>
                  {latestBpEval && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{ backgroundColor: latestBpEval.badgeBg, color: latestBpEval.badgeText }}
                    >
                      {latestBpEval.stage}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8]">
                  <span className="text-[10px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                    Blood glucose
                  </span>
                  <div className="text-xl font-extrabold text-[#172b4d] mt-1">
                    {latest.sugar ? `${latest.sugar} mg/dL` : '—'}
                  </div>
                  {latestSugarEval && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{ backgroundColor: latestSugarEval.badgeBg, color: latestSugarEval.badgeText }}
                    >
                      {latestSugarEval.status}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-[#8b96aa] uppercase tracking-wider block">
                    Weight & Pulse
                  </span>
                  <div className="text-base font-extrabold text-[#172b4d] mt-1">
                    {latest.weight ? `${latest.weight} kg` : '—'}{' '}
                    <span className="text-xs font-normal text-[#8b96aa]">
                      / {latest.pulse ? `${latest.pulse} bpm` : '72 bpm'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#239b76] block mt-1">Baseline recorded</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#8b96aa]">
                No readings saved yet. Use the form to record your first vital reading.
              </div>
            )}

            {/* Visual SVG Trend graph */}
            {records.length > 1 && (
              <div className="mt-6 pt-5 border-t border-[#f0f3f8]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-[#172b4d] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#6558d3]" />
                    <span>Systolic Blood Pressure Trend (Last readings)</span>
                  </div>
                  <span className="text-[10px] text-[#239b76] font-bold bg-[#e6f9f2] px-2 py-0.5 rounded-md">
                    Target: &lt;120 mmHg
                  </span>
                </div>

                {/* SVG Line visualization */}
                <div className="h-28 w-full bg-[#fcfdff] rounded-2xl border border-[#f0f3f8] p-3 flex flex-col justify-end">
                  <div className="flex items-end justify-between h-20 gap-3 px-2">
                    {records
                      .slice(0, 6)
                      .reverse()
                      .map((r, i) => {
                        const systolic = r.systolic || (r.bp ? parseInt(r.bp.split('/')[0], 10) : 120);
                        // Scale 100-160 mmHg to height percentage (10% to 90%)
                        const min = 100;
                        const max = 150;
                        const pct = Math.max(15, Math.min(95, ((systolic - min) / (max - min)) * 100));
                        const isNormal = systolic < 120;

                        return (
                          <div key={r.id || i} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[10px] font-bold text-[#172b4d] opacity-0 group-hover:opacity-100 transition">
                              {systolic}
                            </span>
                            <div
                              className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                                isNormal ? 'bg-[#35b98d]' : 'bg-[#e18a4d]'
                              }`}
                              style={{ height: `${pct}%` }}
                            />
                            <span className="text-[9px] text-[#8b96aa] truncate max-w-[40px]">
                              {new Date(r.date).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Disclaimer Note */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#fff8ef] border border-[#ffecd9] text-[11px] text-[#8d6a3d] leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#e18a4d] shrink-0 mt-0.5" />
              <span>
                These personal records do not constitute clinical diagnosis. Always discuss blood pressure or glucose variations directly with your prescribing physician.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record History Table */}
      <div className="bg-white rounded-3xl border border-[#e8edf4] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f3f8] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#172b4d]">Record history</h3>
            <p className="text-xs text-[#8b96aa] mt-0.5">Chronological record of saved readings</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f1effe] text-[#6558d3]">
            {records.length} entries
          </span>
        </div>

        {records.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8b96aa]">
            No health records logged yet. Use the form above to record measurements.
          </div>
        ) : (
          <div className="divide-y divide-[#f1f4f9]">
            {records.map((r) => {
              const bpEval = evaluateBloodPressure(r.systolic, r.diastolic);
              const sugarEval = evaluateBloodSugar(r.sugar, r.sugarContext);

              return (
                <div
                  key={r.id}
                  className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fafbff] transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-extrabold text-[#172b4d]">
                        Health reading
                      </strong>
                      <span className="text-[11px] text-[#8b96aa]">
                        • {formatDateLabel(r.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {r.bp && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] border border-[#e8edf4] text-xs font-semibold text-[#172b4d]">
                          BP: <strong>{r.bp}</strong> mmHg{' '}
                          {bpEval && (
                            <span
                              className="text-[10px] font-bold ml-1 px-1.5 py-0.2 rounded"
                              style={{ backgroundColor: bpEval.badgeBg, color: bpEval.badgeText }}
                            >
                              {bpEval.stage}
                            </span>
                          )}
                        </span>
                      )}

                      {r.sugar && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] border border-[#e8edf4] text-xs font-semibold text-[#172b4d]">
                          Glucose: <strong>{r.sugar}</strong> mg/dL ({r.sugarContext || 'fasting'})
                          {sugarEval && (
                            <span
                              className="text-[10px] font-bold ml-1 px-1.5 py-0.2 rounded"
                              style={{ backgroundColor: sugarEval.badgeBg, color: sugarEval.badgeText }}
                            >
                              {sugarEval.status}
                            </span>
                          )}
                        </span>
                      )}

                      {r.weight && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] border border-[#e8edf4] text-xs font-semibold text-[#172b4d]">
                          Weight: <strong>{r.weight}</strong> kg
                        </span>
                      )}

                      {r.pulse && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] border border-[#e8edf4] text-xs font-semibold text-[#172b4d]">
                          Pulse: <strong>{r.pulse}</strong> bpm
                        </span>
                      )}
                    </div>

                    {r.notes && (
                      <p className="text-xs text-[#6b778c] italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteRecord(r.id)}
                    title="Delete record"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Medication, TimeSlot } from '../types/healthtrack';
import { getTimeSlot } from '../utils/healthCalculations';
import { X, Pill, Clock, Sparkles } from 'lucide-react';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medData: Omit<Medication, 'id' | 'patientUid' | 'takenDate' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  medicationToEdit?: Medication | null;
}

const COMMON_MEDS = [
  { name: 'Lisinopril', defaultDosage: '10 mg', instructions: 'Take in morning for blood pressure' },
  { name: 'Metformin', defaultDosage: '500 mg', instructions: 'Take with meal to avoid stomach upset' },
  { name: 'Atorvastatin', defaultDosage: '20 mg', instructions: 'Take at bedtime for cholesterol' },
  { name: 'Levothyroxine', defaultDosage: '50 mcg', instructions: 'Take on empty stomach with water 30m before breakfast' },
  { name: 'Amlodipine', defaultDosage: '5 mg', instructions: 'Take daily at the same time' },
  { name: 'Omeprazole', defaultDosage: '20 mg', instructions: 'Take 30 mins before breakfast' },
  { name: 'Vitamin D3', defaultDosage: '2000 IU', instructions: 'Take with breakfast containing fat' },
];

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicationToEdit,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('morning');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'twice_daily' | 'as_needed' | 'weekly'>('daily');
  const [pillsRemaining, setPillsRemaining] = useState<number>(30);
  const [refillReminder, setRefillReminder] = useState<boolean>(true);

  useEffect(() => {
    if (medicationToEdit) {
      setName(medicationToEdit.name);
      setDosage(medicationToEdit.dosage);
      setTime(medicationToEdit.time || '08:00');
      setTimeSlot(medicationToEdit.timeSlot || getTimeSlot(medicationToEdit.time || '08:00'));
      setInstructions(medicationToEdit.instructions || '');
      setFrequency(medicationToEdit.frequency || 'daily');
      setPillsRemaining(medicationToEdit.pillsRemaining ?? 30);
      setRefillReminder(medicationToEdit.refillReminder ?? true);
    } else {
      setName('');
      setDosage('');
      setTime('08:00');
      setTimeSlot('morning');
      setInstructions('');
      setFrequency('daily');
      setPillsRemaining(30);
      setRefillReminder(true);
    }
  }, [medicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !time) return;

    onSave(
      {
        name: name.trim(),
        dosage: dosage.trim(),
        time,
        timeSlot: timeSlot || getTimeSlot(time),
        instructions: instructions.trim(),
        frequency,
        pillsRemaining: Number(pillsRemaining),
        refillReminder,
        isActive: true,
      },
      medicationToEdit?.id
    );
  };

  const handleSelectQuickMed = (med: typeof COMMON_MEDS[0]) => {
    setName(med.name);
    setDosage(med.defaultDosage);
    if (!instructions) {
      setInstructions(med.instructions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-[#f0f3f8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#172b4d]">
                {medicationToEdit ? 'Edit medication' : 'Add medication'}
              </h2>
              <p className="text-xs text-[#8b96aa] mt-0.5">
                Enter details from your prescribed medication regimen.
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

        {/* Quick Medication Suggestions */}
        {!medicationToEdit && (
          <div className="px-6 pt-4 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#6558d3]" />
              <span>Common Prescriptions (Quick fill)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleSelectQuickMed(m)}
                  className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] hover:bg-[#f1effe] text-[11px] font-semibold text-[#596780] hover:text-[#6558d3] border border-[#e8edf4] hover:border-[#c9c3ff] transition"
                >
                  {m.name} {m.defaultDosage}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Medicine name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lisinopril"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Dosage / Strength *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 10 mg or 1 tablet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Scheduled time *
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setTimeSlot(getTimeSlot(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Timing period
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none bg-white"
              >
                <option value="morning">Morning (Breakfast)</option>
                <option value="afternoon">Afternoon (Lunch)</option>
                <option value="evening">Evening (Dinner)</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none bg-white"
              >
                <option value="daily">Once Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As Needed (PRN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Pills remaining / Inventory
              </label>
              <input
                type="number"
                min={0}
                max={999}
                value={pillsRemaining}
                onChange={(e) => setPillsRemaining(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#596780] mb-1.5">
              Doctor Instructions / Patient Notes
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with a glass of water after food"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="refillReminder"
              checked={refillReminder}
              onChange={(e) => setRefillReminder(e.target.checked)}
              className="rounded text-[#6558d3] focus:ring-[#6558d3]"
            />
            <label htmlFor="refillReminder" className="text-xs text-[#596780] cursor-pointer">
              Alert me when pills remaining drop below 10
            </label>
          </div>

          <div className="pt-3 border-t border-[#f0f3f8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#596780] hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold shadow-md shadow-[#6558d3]/20 transition"
            >
              {medicationToEdit ? 'Save Changes' : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

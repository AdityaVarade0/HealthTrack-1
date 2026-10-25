import React, { useState } from 'react';
import { Medication, TimeSlot } from '../types/healthtrack';
import { formatTime12h, getTodayKey, getTimeSlot } from '../utils/healthCalculations';
import {
  Pill,
  Plus,
  Check,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  AlertTriangle,
  BellRing,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface MedicationsViewProps {
  medications: Medication[];
  onOpenAddModal: () => void;
  onOpenEditModal: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onToggleTaken: (id: string) => void;
  onSimulateMissedDose: (med: Medication) => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMedication,
  onToggleTaken,
  onSimulateMissedDose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSlot, setFilterSlot] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'taken'>('all');

  const todayKey = getTodayKey();

  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.instructions || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase());

    const slot = m.timeSlot || getTimeSlot(m.time);
    const matchesSlot = filterSlot === 'all' || slot === filterSlot;

    const isTaken = m.takenDate === todayKey;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'taken' && isTaken) ||
      (statusFilter === 'pending' && !isTaken);

    return matchesSearch && matchesSlot && matchesStatus;
  });

  const takenCount = medications.filter((m) => m.takenDate === todayKey).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight">
            Medication plan
          </h2>
          <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
            Add medication details, set schedule times, and mark daily doses as taken.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold shadow-md shadow-[#6558d3]/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add medication</span>
        </button>
      </div>

      {/* Missed-Dose Demo Sandbox Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fef3c7] via-[#fffbeb] to-[#fff] border border-[#fde68a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#92400e] flex items-center gap-1.5">
              <span>Interactive Missed-Dose Alert Simulator</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                Demo Feature
              </span>
            </div>
            <p className="text-[11px] text-[#78350f] mt-0.5 max-w-xl">
              Experience HealthTrack’s safety reminders: test what an alert looks and sounds like when a patient misses a scheduled medication dose.
            </p>
          </div>
        </div>

        {medications.length > 0 && (
          <button
            onClick={() => onSimulateMissedDose(medications[0])}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Simulate missed dose alert</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e8edf4] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b96aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, dosage, or instructions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
            />
          </div>

          {/* Timing Slot Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['all', 'morning', 'afternoon', 'evening', 'bedtime'].map((slot) => {
              const active = filterSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setFilterSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition shrink-0 ${
                    active
                      ? 'bg-[#6558d3] text-white shadow-xs'
                      : 'bg-[#f8f9fc] text-[#6b778c] hover:bg-[#eef1f6]'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status subfilters */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f1f4f9]">
          <div className="flex items-center gap-2">
            <span className="text-[#8b96aa] font-semibold">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                statusFilter === 'all'
                  ? 'bg-[#f1effe] text-[#6558d3]'
                  : 'text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              All ({medications.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              Pending today ({medications.length - takenCount})
            </button>
            <button
              onClick={() => setStatusFilter('taken')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                statusFilter === 'taken'
                  ? 'bg-[#e6f9f2] text-[#239b76]'
                  : 'text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              Taken today ({takenCount})
            </button>
          </div>

          <span className="text-[11px] text-[#8b96aa] font-medium hidden sm:inline">
            Showing {filteredMeds.length} of {medications.length} items
          </span>
        </div>
      </div>

      {/* Medication List */}
      <div className="bg-white rounded-3xl border border-[#e8edf4] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f3f8] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#172b4d]">Your medications</h3>
            <p className="text-xs text-[#8b96aa] mt-0.5">
              Prescription schedule and daily dose tracking
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f1effe] text-[#6558d3]">
            {filteredMeds.length} items
          </span>
        </div>

        {filteredMeds.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center mx-auto mb-3">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#172b4d]">No medications found</h4>
            <p className="text-xs text-[#8b96aa] max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || filterSlot !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to see your medications.'
                : 'Your medication list is currently empty. Add your prescribed medicine to get started.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#6558d3] text-white text-xs font-bold hover:bg-[#5446c7] transition"
            >
              Add medication
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f4f9]">
            {filteredMeds.map((med) => {
              const isTaken = med.takenDate === todayKey;
              const isLowRefill = med.pillsRemaining !== undefined && med.pillsRemaining <= 10;

              return (
                <div
                  key={med.id}
                  className="p-5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fafbff] transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold transition ${
                        isTaken
                          ? 'bg-[#e6f9f2] text-[#239b76]'
                          : 'bg-[#f1effe] text-[#6558d3]'
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-extrabold text-[#172b4d]">
                          {med.name}
                        </strong>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f1f3f8] text-[#596780]">
                          {med.dosage}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f8f9fc] text-[#6b778c] border border-[#e8edf4]">
                          {formatTime12h(med.time)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {med.frequency.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-[#6b778c] leading-relaxed">
                        {med.instructions || 'Take as directed by doctor.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#8b96aa] pt-1">
                        {med.pillsRemaining !== undefined && (
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isLowRefill ? 'text-amber-600' : 'text-[#6b778c]'
                            }`}
                          >
                            {isLowRefill && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            <span>{med.pillsRemaining} pills remaining</span>
                            {isLowRefill && <span className="underline">(Refill soon)</span>}
                          </span>
                        )}
                        {med.lastTakenTime && (
                          <span>Last taken: {new Date(med.lastTakenTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f0f3f8]">
                    <button
                      onClick={() => onToggleTaken(med.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                        isTaken
                          ? 'bg-[#f1f3f8] text-[#6b778c] hover:bg-[#e2e6f0]'
                          : 'bg-[#239b76] text-white hover:bg-[#1e8666] shadow-[#239b76]/20'
                      }`}
                    >
                      {isTaken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#239b76]" />
                          <span>Dose taken</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark as taken</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditModal(med)}
                        title="Edit medication"
                        className="p-2 rounded-xl border border-[#e2e8f0] text-[#6b778c] hover:text-[#6558d3] hover:border-[#6558d3] hover:bg-[#f1effe] transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        title="Delete medication"
                        className="p-2 rounded-xl border border-[#e2e8f0] text-[#6b778c] hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ActivityItem, UserProfile } from '../types/healthtrack';
import { formatDateLabel, formatRelativeTime } from '../utils/healthCalculations';
import {
  History,
  Bell,
  Trash2,
  Volume2,
  Sparkles,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle,
} from 'lucide-react';

interface HistoryRemindersViewProps {
  activity: ActivityItem[];
  currentUser: UserProfile;
  onClearHistory: () => void;
  onTriggerTestChime: () => void;
  onToggleReminderSound: () => void;
}

export const HistoryRemindersView: React.FC<HistoryRemindersViewProps> = ({
  activity,
  currentUser,
  onClearHistory,
  onTriggerTestChime,
  onToggleReminderSound,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredActivity = activity.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight">
            History & reminders
          </h2>
          <p className="text-xs sm:text-sm text-[#6b778c] mt-0.5">
            Audit medication events, recorded health vitals, and reminder alerts.
          </p>
        </div>

        {activity.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear activity log</span>
          </button>
        )}
      </div>

      {/* Reminder Chime & Notification Controls */}
      <div className="bg-white rounded-3xl border border-[#e8edf4] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#f0f3f8]">
          <div className="w-10 h-10 rounded-xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#172b4d]">Reminder preferences & alerts</h3>
            <p className="text-xs text-[#8b96aa] mt-0.5">
              Customize medication alert chimes and test audio cues
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e6f9f2] text-[#239b76] flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-extrabold text-[#172b4d] block">
                  Audio Chime Synthesizer
                </strong>
                <span className="text-[11px] text-[#8b96aa]">
                  Gentle Web Audio chime when dose is due or logged
                </span>
              </div>
            </div>

            <button
              onClick={onTriggerTestChime}
              className="px-3 py-1.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white text-xs font-bold transition shadow-2xs"
            >
              Test chime
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#f0f3f8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs font-extrabold text-[#172b4d] block">
                  Sound Feedback
                </strong>
                <span className="text-[11px] text-[#8b96aa]">
                  {currentUser.reminderSound ? 'Enabled for doses & reminders' : 'Muted'}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleReminderSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                currentUser.reminderSound
                  ? 'bg-[#e6f9f2] text-[#239b76] border border-[#bbf0dd]'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {currentUser.reminderSound ? 'Active' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-3xl border border-[#e8edf4] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f3f8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#172b4d]">Reminder & adherence activity</h3>
            <p className="text-xs text-[#8b96aa] mt-0.5">Audit log of actions recorded in this session</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'medication', label: 'Medications' },
              { id: 'health_record', label: 'Vitals' },
              { id: 'reminder', label: 'Reminders' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                  filterType === f.id
                    ? 'bg-[#6558d3] text-white shadow-xs'
                    : 'bg-[#f8f9fc] text-[#6b778c] hover:bg-[#eef1f6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8b96aa] px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f8f9fc] text-[#6558d3] flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <strong className="text-sm font-bold text-[#172b4d] block">No activity yet</strong>
            <p className="text-xs text-[#8b96aa] max-w-xs mx-auto mt-1">
              Medication actions, saved health records, and reminder alerts will appear in this timeline.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f4f9]">
            {filteredActivity.map((a) => (
              <div
                key={a.id}
                className="p-5 sm:px-6 flex items-start gap-4 hover:bg-[#fafbff] transition"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center shrink-0 font-bold text-base">
                  {a.icon || '◷'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs font-extrabold text-[#172b4d]">{a.title}</strong>
                    <span className="text-[10px] text-[#8b96aa] shrink-0">
                      {formatRelativeTime(a.date)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b778c] mt-0.5 leading-relaxed">{a.description}</p>
                  <div className="text-[10px] text-[#9ca3af] mt-1">{formatDateLabel(a.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice Box from original project */}
      <div className="p-4 rounded-2xl bg-[#fff8ee] border border-[#ffe7c9] text-xs text-[#8d6a3d] leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-[#714f24]">Important clinical disclaimer:</strong>
          <span>
            This application is an educational prototype and personal tracking tool. It demonstrates scheduled alerts on-screen and with local audio chimes. It does not send automated SMS or emails to hospital systems or emergency services. For urgent medical symptoms, call emergency services immediately.
          </span>
        </div>
      </div>
    </div>
  );
};

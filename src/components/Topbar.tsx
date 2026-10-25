import React, { useState, useRef, useEffect } from 'react';
import { PageType, UserProfile } from '../types/healthtrack';
import { Menu, Bell, Shield, Users, Check, ChevronDown, Sparkles } from 'lucide-react';
import { DEMO_USERS } from '../services/storage';

interface TopbarProps {
  currentPage: PageType;
  currentUser: UserProfile;
  onOpenMobileSidebar: () => void;
  onOpenProfile: () => void;
  onSwitchUser: (user: UserProfile) => void;
  onOpenNewUserAuth: () => void;
  onTriggerTestReminder: () => void;
  pendingCount: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  currentUser,
  onOpenMobileSidebar,
  onOpenProfile,
  onSwitchUser,
  onOpenNewUserAuth,
  onTriggerTestReminder,
  pendingCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titles: Record<PageType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'TODAY’S HEALTH OVERVIEW',
    },
    medications: {
      title: 'Medication Schedule',
      subtitle: 'DAILY DOSAGE & ADHERENCE',
    },
    health: {
      title: 'Health Records & Vitals',
      subtitle: 'CLINICAL READINGS & TRENDS',
    },
    history: {
      title: 'History & Reminders',
      subtitle: 'ADHERENCE LOG & ALERTS',
    },
    '3d_lab': {
      title: '3D Precision Capsule Lab',
      subtitle: 'THREE.JS ANATOMY & DOSAGE MODEL',
    },
    assistant: {
      title: 'AI MedAssist Companion',
      subtitle: 'GOOGLE SEARCH GROUNDED PHARMACOTHERAPY',
    },
  };

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const initials = (currentUser.name || 'P')
    .trim()
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-[#f8fafc]/90 backdrop-blur-md border-b border-[#e8edf4] px-4 sm:px-8 py-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-1 text-[#6b778c] hover:text-[#172b4d] rounded-lg hover:bg-white border border-transparent hover:border-[#e2e8f0] lg:hidden transition"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[10px] tracking-[1.5px] font-bold text-[#8b96aa] uppercase flex items-center gap-2">
              <span>{titles[currentPage].subtitle}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline font-medium text-slate-500 normal-case">
                {currentDateStr}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172b4d] tracking-tight mt-0.5">
              {titles[currentPage].title}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Personal workspace pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-semibold text-[#596780] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#239b76] animate-pulse"></span>
            <span>Personal workspace</span>
            <Shield className="w-3.5 h-3.5 text-[#239b76] ml-0.5" />
          </div>

          {/* Test reminder chime button */}
          <button
            onClick={onTriggerTestReminder}
            title="Simulate / Test Medication Chime"
            className="relative p-2 rounded-xl bg-white border border-[#e2e8f0] text-[#596780] hover:text-[#6558d3] hover:border-[#c9c3ff] transition shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6558d3] text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Patient Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] text-xs font-semibold text-[#172b4d] transition shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#e8e4ff] text-[#6558d3] font-bold text-[11px] flex items-center justify-center">
                {initials}
              </div>
              <span className="max-w-[110px] sm:max-w-[140px] truncate text-left hidden sm:inline">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8b96aa]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e4e9f2] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#f0f3f8]">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#9ca3af]">
                    Switch Patient Profile
                  </div>
                  <div className="text-xs font-bold text-[#172b4d] mt-0.5">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#6b778c]">ID: {currentUser.patientId}</div>
                </div>

                <div className="py-1">
                  {DEMO_USERS.map((demo) => {
                    const isSelected = demo.uid === currentUser.uid;
                    return (
                      <button
                        key={demo.uid}
                        onClick={() => {
                          onSwitchUser(demo);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                          isSelected
                            ? 'bg-[#f1effe] text-[#6558d3]'
                            : 'text-[#475569] hover:bg-[#f8f9fc]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold flex items-center justify-center">
                            {demo.name[0]}
                          </div>
                          <div>
                            <div className="font-bold">{demo.name}</div>
                            <div className="text-[10px] text-[#94a3b8]">{demo.patientId}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#6558d3]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-[#f0f3f8] space-y-1">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#f8f9fc] text-left transition"
                  >
                    <Users className="w-3.5 h-3.5 text-[#6558d3]" />
                    <span>Edit Profile & Contacts</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenNewUserAuth();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#6558d3] hover:bg-[#f1effe] text-left transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create / Register New Patient</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { PageType, UserProfile } from '../types/healthtrack';
import {
  LayoutDashboard,
  Pill,
  Heart,
  History,
  Sparkles,
  LogOut,
  User,
  Database,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenReport: () => void;
  onOpenFirebaseModal: () => void;
  takenCount: number;
  totalMeds: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  onOpenProfile,
  onOpenReport,
  onOpenFirebaseModal,
  takenCount,
  totalMeds,
  isOpenMobile,
  onCloseMobile,
}) => {
  const initials = (currentUser.name || 'P')
    .trim()
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navItems: { id: PageType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: <Pill className="w-4 h-4" />,
      badge: totalMeds > 0 ? `${takenCount}/${totalMeds}` : undefined,
    },
    {
      id: 'health',
      label: 'Health records',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'History & reminders',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: '3d_lab',
      label: '3D Precision Lab',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      badge: '3D',
    },
    {
      id: 'assistant',
      label: 'AI MedAssist',
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      badge: 'Grounding',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#e8edf4] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#f0f3f8]">
          <div className="w-10 h-10 rounded-xl bg-[#6558d3] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#6558d3]/20">
            +
          </div>
          <div>
            <div className="font-extrabold text-[17px] text-[#172b4d] tracking-tight leading-tight flex items-center gap-1.5">
              HealthTrack
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f1effe] text-[#6558d3]">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-[#8b96a9] font-medium">Patient wellness suite</div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-[1.4px] text-[#9ca3af] uppercase">
            Workspace
          </div>

          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left ${
                  isActive
                    ? 'bg-[#f1effe] text-[#6558d3] font-bold shadow-xs'
                    : 'text-[#596780] hover:bg-[#f8f9fc] hover:text-[#172b4d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-[#6558d3]' : 'text-[#8b96a9]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#6558d3] text-white' : 'bg-[#eef1f6] text-[#6b778c]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-[1.4px] text-[#9ca3af] uppercase">
            Tools & Clinical
          </div>

          <button
            onClick={() => {
              onOpenReport();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-[#596780] hover:bg-[#f8f9fc] hover:text-[#172b4d] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Printer className="w-4 h-4 text-[#8b96a9]" />
              <span>Doctor Visit Summary</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
          </button>

          <button
            onClick={() => {
              onOpenFirebaseModal();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-[#596780] hover:bg-[#f8f9fc] hover:text-[#172b4d] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-[#8b96a9]" />
              <span>Cloud & Firestore</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#eef8f5] text-[#239b76]">
              Ready
            </span>
          </button>

          {/* Motivational Tip Box */}
          <div className="mt-6 p-3.5 rounded-2xl bg-linear-to-br from-[#f8f7ff] to-[#f2efff] border border-[#ece8ff]">
            <div className="flex items-center gap-2 mb-1.5 text-[#6558d3]">
              <div className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#172b4d]">Stay on track</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#747e93]">
              Taking medications consistently within ±30 minutes creates reliable health stability.
            </p>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#f0f3f8] bg-[#fcfdff]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f3f5fa] transition-colors">
            <button
              onClick={onOpenProfile}
              title="View & Edit Patient Profile"
              className="w-9 h-9 rounded-full bg-[#e8e4ff] text-[#5e53c5] font-bold text-xs flex items-center justify-center shrink-0 border border-[#d6d0ff] hover:ring-2 hover:ring-[#6558d3]/30 transition"
            >
              {initials}
            </button>
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenProfile}>
              <div className="text-xs font-bold text-[#172b4d] truncate flex items-center gap-1">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#8b96a9] truncate">
                ID: {currentUser.patientId || 'Pending'}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Log out or switch patient"
              className="p-1.5 text-[#8b96a9] hover:text-[#d32f2f] hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

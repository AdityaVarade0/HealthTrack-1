import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/healthtrack';
import { X, User, Phone, Shield, Stethoscope, AlertCircle, RotateCcw, Download } from 'lucide-react';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onResetDemoData: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onResetDemoData,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [patientId, setPatientId] = useState(currentUser.patientId);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '');
  const [bloodType, setBloodType] = useState(currentUser.bloodType || 'A+');
  const [heightCm, setHeightCm] = useState(currentUser.heightCm || 168);
  const [allergies, setAllergies] = useState((currentUser.allergies || []).join(', '));

  // Emergency contact
  const [emergName, setEmergName] = useState(currentUser.emergencyContact?.name || '');
  const [emergRel, setEmergRel] = useState(currentUser.emergencyContact?.relationship || '');
  const [emergPhone, setEmergPhone] = useState(currentUser.emergencyContact?.phone || '');

  // Doctor
  const [docName, setDocName] = useState(currentUser.primaryDoctor?.name || '');
  const [docClinic, setDocClinic] = useState(currentUser.primaryDoctor?.clinic || '');
  const [docPhone, setDocPhone] = useState(currentUser.primaryDoctor?.phone || '');

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone);
    setPatientId(currentUser.patientId);
    setBirthDate(currentUser.birthDate || '');
    setBloodType(currentUser.bloodType || 'A+');
    setHeightCm(currentUser.heightCm || 168);
    setAllergies((currentUser.allergies || []).join(', '));
    setEmergName(currentUser.emergencyContact?.name || '');
    setEmergRel(currentUser.emergencyContact?.relationship || '');
    setEmergPhone(currentUser.emergencyContact?.phone || '');
    setDocName(currentUser.primaryDoctor?.name || '');
    setDocClinic(currentUser.primaryDoctor?.clinic || '');
    setDocPhone(currentUser.primaryDoctor?.phone || '');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      patientId: patientId.trim(),
      birthDate: birthDate.trim() || undefined,
      bloodType,
      heightCm: Number(heightCm),
      allergies: allergies
        ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
      emergencyContact: emergName
        ? {
            name: emergName.trim(),
            relationship: emergRel.trim() || 'Emergency Contact',
            phone: emergPhone.trim(),
          }
        : undefined,
      primaryDoctor: docName
        ? {
            name: docName.trim(),
            clinic: docClinic.trim() || 'Health Center',
            phone: docPhone.trim() || undefined,
          }
        : undefined,
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#f0f3f8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f1effe] text-[#6558d3] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#172b4d]">Patient Profile & Contacts</h2>
              <p className="text-xs text-[#8b96aa] mt-0.5">
                Manage personal information, emergency contacts, and primary physician.
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <div className="text-xs font-bold text-[#172b4d] uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#6558d3]" />
              <span>Patient Demographics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Full name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Blood type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3] bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 168)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-[#596780] mb-1.5">
                Known Drug Allergies & Sensitivities
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Latex (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="pt-4 border-t border-[#f0f3f8]">
            <div className="text-xs font-bold text-[#172b4d] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Contact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergName}
                  onChange={(e) => setEmergName(e.target.value)}
                  placeholder="e.g. Mark Jenkins"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergRel}
                  onChange={(e) => setEmergRel(e.target.value)}
                  placeholder="e.g. Spouse"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Phone</label>
                <input
                  type="tel"
                  value={emergPhone}
                  onChange={(e) => setEmergPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Primary Doctor */}
          <div className="pt-4 border-t border-[#f0f3f8]">
            <div className="text-xs font-bold text-[#172b4d] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-[#239b76]" />
              <span>Primary Care Physician</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Dr. Evelyn Vance, MD"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Clinic / Facility</label>
                <input
                  type="text"
                  value={docClinic}
                  onChange={(e) => setDocClinic(e.target.value)}
                  placeholder="e.g. Pinecrest Clinic"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">Clinic Phone</label>
                <input
                  type="tel"
                  value={docPhone}
                  onChange={(e) => setDocPhone(e.target.value)}
                  placeholder="(555) 345-6789"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] text-xs text-[#172b4d] outline-none focus:border-[#6558d3]"
                />
              </div>
            </div>
          </div>

          {/* Maintenance / Demo Reset */}
          <div className="pt-4 border-t border-[#f0f3f8] flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">Reset Demo Data</div>
              <div className="text-[11px] text-slate-500">
                Restore Sarah & Alex demo accounts to pristine initial state
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Restore all demo records and sample data?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

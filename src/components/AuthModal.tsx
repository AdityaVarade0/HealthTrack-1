import React, { useState } from 'react';
import { UserProfile } from '../types/healthtrack';
import { Check, ShieldCheck, Sparkles, X, UserCheck, ArrowRight } from 'lucide-react';
import { signInWithGoogle, syncUserProfileToFirestore } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserProfile) => void;
  isDismissable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDismissable = true,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form fields
  const [regPatientId, setRegPatientId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const fbUser = await signInWithGoogle();
      const userProfile: UserProfile = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Patient',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        patientId: `HT-${fbUser.uid.slice(0, 6).toUpperCase()}`,
        role: 'patient',
        reminderEnabled: true,
        reminderSound: true,
        createdAt: new Date().toISOString(),
      };
      await syncUserProfileToFirestore(userProfile);
      onSuccess(userProfile);
    } catch (e: any) {
      console.warn('Google sign-in error:', e);
      setErrorMsg(e?.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (type: 'sarah' | 'alex') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (type === 'sarah') {
        onSuccess({
          id: 'demo_sarah',
          uid: 'demo_sarah',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@example.com',
          phone: '(555) 234-5678',
          patientId: 'HT-1088',
          role: 'patient',
          birthDate: '1984-05-14',
          bloodType: 'A+',
          heightCm: 168,
          weightKg: 64.5,
          allergies: ['Penicillin', 'Sulfa drugs'],
          emergencyContact: {
            name: 'Mark Jenkins',
            relationship: 'Spouse',
            phone: '(555) 876-5432',
          },
          primaryDoctor: {
            name: 'Dr. Evelyn Vance, MD',
            clinic: 'Pinecrest Family Health Center',
            phone: '(555) 345-6789',
          },
          reminderEnabled: true,
          reminderSound: true,
          createdAt: new Date().toISOString(),
        });
      } else {
        onSuccess({
          id: 'demo_alex',
          uid: 'demo_alex',
          name: 'Alex Rivera',
          email: 'alex.rivera@example.com',
          phone: '(555) 987-6543',
          patientId: 'HT-2041',
          role: 'patient',
          birthDate: '1979-11-28',
          bloodType: 'O+',
          heightCm: 175,
          weightKg: 78.2,
          allergies: ['Latex'],
          emergencyContact: {
            name: 'Sofia Rivera',
            relationship: 'Sister',
            phone: '(555) 654-3210',
          },
          primaryDoctor: {
            name: 'Dr. Marcus Chen, MD',
            clinic: 'Metropolitan Endocrinology & Vitals',
            phone: '(555) 432-1098',
          },
          reminderEnabled: true,
          reminderSound: true,
          createdAt: new Date().toISOString(),
        });
      }
    }, 250);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Create or log in user
      const nameGuess = loginEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1);
      const user: UserProfile = {
        id: `user_${Date.now()}`,
        uid: `user_${Date.now()}`,
        name: formattedName || 'Patient',
        email: loginEmail,
        phone: '(555) 012-3456',
        patientId: `HT-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'patient',
        reminderEnabled: true,
        reminderSound: true,
        createdAt: new Date().toISOString(),
      };
      onSuccess(user);
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: `user_${Date.now()}`,
        uid: `user_${Date.now()}`,
        name: regName,
        email: regEmail,
        phone: regPhone || '(555) 000-0000',
        patientId: regPatientId || `HT-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'patient',
        reminderEnabled: true,
        reminderSound: true,
        createdAt: new Date().toISOString(),
      };
      onSuccess(user);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e8f0] grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Close button if dismissable */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Left Side: Art illustration & benefits */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#6558d3] via-[#7568db] to-[#8d82eb] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative orbits */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border border-white/15 pointer-events-none" />
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/20 pointer-events-none" />
          <div className="absolute top-8 right-8 text-white/10 font-black text-8xl select-none leading-none">
            +
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold tracking-[1.5px] uppercase text-[#e0ddff] mb-6">
              <Sparkles className="w-3 h-3 text-[#fde047]" />
              Your Daily Health Companion
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Make your health <br />a daily priority.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-[#e0ddff] leading-relaxed">
              Keep medication plans and vital health readings together in one intuitive personal
              workspace.
            </p>
          </div>

          <div className="space-y-2.5 my-8">
            <div className="flex items-center gap-2.5 text-xs text-[#f1efff]">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 font-bold">
                ✓
              </div>
              <span>Medication tracking with scheduled doses</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#f1efff]">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 font-bold">
                ✓
              </div>
              <span>Blood pressure & glucose clinical metrics</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#f1efff]">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 font-bold">
                ✓
              </div>
              <span>Reminder alerts & Doctor visit summary report</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-[#d6d2ff]">
            <span>Privacy-minded patient portal</span>
            <span>Local & Cloud Ready</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          {/* Google Sign-In Button (Firebase Auth) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-4 py-3 px-4 rounded-2xl bg-white border border-[#d2d9e5] hover:bg-[#f8fafc] text-xs font-extrabold text-[#172b4d] transition shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 group hover:border-[#6558d3]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Firebase Auth)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Live Cloud Sync
            </span>
          </button>

          <div className="flex items-center gap-3 my-2 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or Try Demo Profile
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quick Demo Login Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#f8f7ff] border border-[#e8e4ff]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#172b4d] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#6558d3]" />
                Instant Demo Access (Recommended)
              </span>
              <span className="text-[10px] font-semibold text-[#6558d3] bg-white px-2 py-0.5 rounded-full border border-[#dcd6fc]">
                Pre-populated
              </span>
            </div>
            <p className="text-[11px] text-[#6b778c] mb-2.5 leading-relaxed">
              Explore the full features immediately with pre-configured patient profiles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('sarah')}
                className="px-3 py-2 rounded-xl bg-white border border-[#dcd6fc] hover:border-[#6558d3] hover:bg-[#6558d3] hover:text-white text-xs font-bold text-[#6558d3] transition flex items-center justify-center gap-1.5 shadow-2xs group"
              >
                <span>Sarah (Hypertension)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('alex')}
                className="px-3 py-2 rounded-xl bg-white border border-[#dcd6fc] hover:border-[#6558d3] hover:bg-[#6558d3] hover:text-white text-xs font-bold text-[#6558d3] transition flex items-center justify-center gap-1.5 shadow-2xs group"
              >
                <span>Alex (Diabetes)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-[#f3f5fa] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'login'
                  ? 'bg-white text-[#6558d3] shadow-xs'
                  : 'text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'register'
                  ? 'bg-white text-[#6558d3] shadow-xs'
                  : 'text-[#6b778c] hover:text-[#172b4d]'
              }`}
            >
              Create account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] focus:ring-2 focus:ring-[#6558d3]/20 text-xs text-[#172b4d] outline-none transition bg-[#fcfdff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] focus:ring-2 focus:ring-[#6558d3]/20 text-xs text-[#172b4d] outline-none transition bg-[#fcfdff]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white font-bold text-xs shadow-md shadow-[#6558d3]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in to HealthTrack'}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              <p className="text-[11px] text-[#8b96aa] text-center pt-2">
                Your data is securely isolated in your browser with Firestore ready.
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#596780] mb-1">
                    Patient ID <span className="text-[#9ca3af] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={regPatientId}
                    onChange={(e) => setRegPatientId(e.target.value)}
                    placeholder="e.g. HT-101"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#596780] mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#596780] mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#596780] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#596780] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white font-bold text-xs shadow-md shadow-[#6558d3]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Patient Account'}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

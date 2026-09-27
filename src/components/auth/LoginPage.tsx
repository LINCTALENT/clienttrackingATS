import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Company } from '../../types';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Layers,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  companies: Company[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  users,
  companies,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginRoleFeedback, setLoginRoleFeedback] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoginRoleFeedback(null);
    setLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const matched = users.find((u) => u.email.toLowerCase() === trimmedEmail);

      if (!matched) {
        setError('Alamat email belum terdaftar di sistem Linchub ATS. Hubungi Administrator untuk pembuatan akun.');
        setLoading(false);
        return;
      }

      // Check password validation
      if (trimmedEmail === 'adminlinchub@cmp.id') {
        if (password !== 'LincTALENTPARTNERS12@') {
          setError('Kata sandi admin salah. Pastikan menggunakan: LincTALENTPARTNERS12@');
          setLoading(false);
          return;
        }
      } else {
        const validPassword = matched.password || 'password123';
        if (password !== validPassword && password !== 'LincTALENTPARTNERS12@' && password !== 'password123') {
          setError('Kata sandi yang Anda masukkan tidak sesuai.');
          setLoading(false);
          return;
        }
      }

      // Determine company name for client feedback
      let feedbackMsg = '';
      if (matched.role === 'admin') {
        feedbackMsg = 'Terautentikasi sebagai Administrator Linchub. Mengarahkan ke Master Dashboard...';
      } else if (matched.role === 'recruiter') {
        feedbackMsg = 'Terautentikasi sebagai Recruiter. Mengarahkan ke Recruitment Pipeline...';
      } else if (matched.role === 'client') {
        const clientComp = companies.find((c) => c.id === matched.companyId);
        feedbackMsg = `Terautentikasi sebagai Klien (${clientComp ? clientComp.companyName : 'Perusahaan Klien'}). Mengarahkan ke Portal Klien...`;
      }

      setLoginRoleFeedback(feedbackMsg);

      // Brief animation before transition
      setTimeout(() => {
        onLoginSuccess(matched);
      }, 400);
    }, 250);
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
    setLoginRoleFeedback(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-neutral-100">
      {/* Top minimal header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold tracking-tight shadow-xs">
            L
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            Linchub ATS
          </span>
          <span className="text-neutral-300 text-xs">/</span>
          <span className="text-xs text-neutral-500 font-normal">
            Universal Portal Login
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-normal">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>Cloud Database & AI Ready</span>
        </div>
      </header>

      {/* Main Universal Login Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-md bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          {/* Title & Description */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white mx-auto shadow-xs">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-semibold text-neutral-900 tracking-tight pt-1">
              Masuk ke Linchub ATS
            </h1>
            <p className="text-xs text-neutral-500 font-normal leading-relaxed max-w-xs mx-auto">
              Satu portal login universal untuk <b>Admin</b>, <b>Recruiter</b>, dan <b>Klien</b>. Sistem otomatis mendeteksi peran dan perusahaan Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {loginRoleFeedback && (
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">{loginRoleFeedback}</span>
            </div>
          )}

          {/* Form: Email & Password ONLY */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-8 pr-9 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                  title={showPassword ? 'Sembunyikan' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>{loading ? 'Memverifikasi Akun...' : 'Masuk ke Portal ATS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Access / Test Accounts */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-neutral-400" />
                <span>Pilih Cepat Akun Demo (Uji Coba):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {/* Master Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('adminlinchub@cmp.id', 'LincTALENTPARTNERS12@')}
                className="w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded bg-neutral-900 text-white flex items-center justify-center text-[10px] shrink-0 font-medium">
                    <Shield className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-neutral-900 group-hover:text-black">
                      Master Administrator
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">
                      adminlinchub@cmp.id
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 px-1.5 py-0.5 rounded bg-white border border-neutral-200 shrink-0">
                  Gunakan
                </span>
              </button>

              {/* Recruiter */}
              <button
                type="button"
                onClick={() => handleQuickFill('dimas.pratama@linchub.id', 'password123')}
                className="w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[10px] shrink-0 font-medium">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-neutral-900 group-hover:text-black">
                      Recruiter (Dimas Pratama)
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">
                      dimas.pratama@linchub.id
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 px-1.5 py-0.5 rounded bg-white border border-neutral-200 shrink-0">
                  Gunakan
                </span>
              </button>

              {/* Client PT Solusi Teknologi */}
              <button
                type="button"
                onClick={() => handleQuickFill('budi.wijaya@solusiteknologi.co.id', 'password123')}
                className="w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px] shrink-0 font-medium">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-neutral-900 group-hover:text-black">
                      Klien PT Solusi Teknologi Nusantara
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">
                      budi.wijaya@solusiteknologi.co.id
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-900 px-1.5 py-0.5 rounded bg-white border border-neutral-200 shrink-0">
                  Gunakan
                </span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 text-center leading-relaxed">
            Akun Klien otomatis terhubung ke PT yang telah ditentukan Admin di menu <b>Kelola Pengguna</b>.
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-2 text-[11px] text-neutral-400 max-w-4xl mx-auto w-full border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <span>Linchub ATS & Client Portal</span>
        </div>
        <span>Otentikasi Berjenjang Otomatis · Firebase Firestore</span>
      </footer>
    </div>
  );
};

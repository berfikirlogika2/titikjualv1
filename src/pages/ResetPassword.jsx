import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-md bg-[#F1F2F6] min-h-[750px] flex flex-col justify-between relative overflow-hidden rounded-3xl border border-[#E9EBED] shadow-sm p-6">
        <div>
          <header className="flex items-center mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#01A684]" />
            </button>
          </header>

          <div className="bg-white rounded-2xl p-6 border border-[#E9EBED] space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-[#181b2b] mb-1">Buat Kata Sandi Baru</h2>
              <p className="text-xs text-[#86899B]">Buat kata sandi baru yang aman dan simpan dengan baik.</p>
            </div>

            <div className="space-y-4">
              {/* Input Password Baru */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-[#86899B] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kata sandi baru"
                  className="w-full pl-10 pr-10 py-3 border border-[#E9EBED] rounded-xl bg-gray-50 text-xs outline-none focus:border-[#01A684]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#86899B] hover:text-[#181b2b]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Input Konfirmasi Password */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-[#86899B] pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Konfirmasi kata sandi baru"
                  className="w-full pl-10 pr-10 py-3 border border-[#E9EBED] rounded-xl bg-gray-50 text-xs outline-none focus:border-[#01A684]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 text-[#86899B] hover:text-[#181b2b]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-xl border border-[#E9EBED]">
              <p className="text-xs font-semibold text-[#181b2b] mb-2">Harus berisi setidaknya:</p>
              <ul className="space-y-2 text-xs text-[#86899B]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#01A684]" />
                  <span>Minimal 8 karakter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#01A684]" />
                  <span>1 huruf kecil</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#01A684]" />
                  <span>1 karakter spesial</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/reset-password-success')}
          className="w-full bg-[#01A684] hover:opacity-90 text-white font-semibold py-4 rounded-full transition-all cursor-pointer shadow-md active:scale-[0.98] mt-6"
        >
          Reset Kata Sandi
        </button>
      </main>
    </div>
  );
}

export default ResetPassword;
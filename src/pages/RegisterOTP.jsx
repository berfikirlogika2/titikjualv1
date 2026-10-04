import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function RegisterOTP() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  // Diubah menjadi 6 elemen array untuk 6 digit OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);

  // Countdown timer state
  const [remaining, setRemaining] = useState(48);
  const [isResendActive, setIsResendActive] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('regEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    // Timer logic
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Pindah ke kotak berikutnya (maksimal indeks ke-5 karena total 6 kotak)
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    if (finalOtp.length < 6) {
      alert('Silakan masukkan 6 digit kode verifikasi dengan lengkap.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: finalOtp,
        type: 'signup'
      });

      if (error) throw error;

      alert('Email berhasil diverifikasi!');
      navigate('/owner-dashboard');

    } catch (error) {
      alert('Kode OTP salah atau sudah kedaluwarsa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isResendActive) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;

      alert('Kode OTP baru telah dikirim ulang ke Gmail Anda.');
      setRemaining(48);
      setIsResendActive(false);

      const timer = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      alert('Gagal mengirim ulang OTP: ' + error.message);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased" style={{ background: 'linear-gradient(180deg, #00A482 0%, #018c6f 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-center pt-12 pb-8 z-10 px-6 shrink-0">
        <div className="w-full max-w-screen-md mx-auto flex items-center justify-between relative">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/25 hover:bg-white/35 text-white transition-colors cursor-pointer border-0" 
            title="Kembali"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-black tracking-tight text-white flex items-center gap-0.5">
              <span className="text-gray-900">titik</span>
              <span className="text-white">jual.</span>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full bg-white flex-1 rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col px-6 pt-10 pb-8 z-20 relative max-w-screen-md mx-auto">
        <div className="flex flex-col w-full">
          
          {/* Main Interactive Bento Box */}
          <div className="bg-[#fbf8ff] rounded-2xl p-6 shadow-sm flex flex-col items-center w-full">
            
            {/* Delight Visual Badge */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#88f3d1]/40 flex items-center justify-center text-[#01A684] shadow-sm ring-4 ring-[#88f3d1]/20">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Verifikasi Email</h2>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Kode verifikasi telah dikirimkan ke Gmail terdaftar Anda:
              </p>
            </div>

            {/* Highlighted Target Email Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ececff] text-slate-900 text-sm font-medium mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[#01A684] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <span className="truncate max-w-[200px]">{userEmail || 'email@domain.com'}</span>
              <button 
                onClick={() => navigate('/register')}
                className="text-slate-400 hover:text-[#01A684] transition-colors ml-1 flex items-center bg-transparent border-0 cursor-pointer" 
                title="Ubah Email" 
                type="button"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
              </button>
            </div>

            {/* Input Section Form */}
            <form className="w-full max-w-md flex flex-col items-center gap-4" onSubmit={handleSubmit}>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Masukkan 6 Digit Kode Verifikasi
              </label>

              {/* 6-Digit Inputs */}
              <div className="flex items-center justify-center gap-2 w-full" id="otp-container">
                {otp.map((data, index) => {
                  return (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      pattern="[0-9]*"
                      value={data}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      autoFocus={index === 0}
                      // Ukuran lebar input sedikit disesuaikan agar 6 kotak pas di layar
                      className="w-11 h-12 text-center text-lg text-[#01A684] font-bold rounded-xl bg-white shadow-sm border border-slate-200 focus:outline-none focus:bg-[#f3f2ff] focus:border-[#01A684] transition-all"
                    />
                  );
                })}
              </div>

              {/* Action Button */}
              <button 
                className="w-full mt-2 py-3.5 px-6 bg-[#01A684] hover:bg-[#018f71] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer border-0 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Resend Countdown Component */}
            <div className="flex flex-col items-center justify-center gap-1 mt-6 text-center">
              <p className="text-sm text-slate-600">
                Belum menerima kode OTP?
              </p>
              <div className="inline-flex items-center gap-1">
                <button 
                  type="button" 
                  id="resend-btn"
                  onClick={handleResend}
                  disabled={!isResendActive}
                  className={`text-sm font-bold transition-colors ${
                    isResendActive 
                      ? 'text-[#01A684] hover:underline cursor-pointer opacity-100' 
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  Kirim Ulang
                </button>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-[#01A684]" id="countdown-timer">
                  {isResendActive ? 'Siap dikirim ulang' : `Tersedia dalam 00:${remaining < 10 ? '0' + remaining : remaining}`}
                </span>
              </div>
            </div>

            {/* Trust & Verification Bento Note */}
            <div className="mt-8 w-full bg-[#f3f2ff] rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-1 rounded-full bg-[#88f3d1] text-[#01A684] shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">Proteksi Keamanan Titik Jual</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verifikasi OTP via Gmail memastikan akun admin Anda terproteksi aman dan terverifikasi sah.
                </p>
              </div>
            </div>

          </div>

          {/* Subtle Footer Signature */}
          <footer className="w-full text-center py-6">
            <p className="text-xs text-slate-400">
              © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default RegisterOTP;
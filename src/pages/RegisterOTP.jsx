import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function RegisterOTP() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('regEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  // Fungsi untuk memverifikasi token OTP yang masuk ke Gmail
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      alert('Masukkan 6 digit kode OTP yang dikirim ke email Anda.');
      return;
    }

    setLoading(true);

    try {
      // Memverifikasi OTP menggunakan Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otpCode,
        type: 'signup' // Tipe verifikasi untuk pendaftaran baru
      });

      if (error) throw error;

      setLoading(false);
      alert('Verifikasi OTP Berhasil! Silakan pilih paket langganan Anda.');
      navigate('/register-plan');

    } catch (error) {
      alert('Gagal Verifikasi OTP: ' + error.message);
      setLoading(false);
    }
  };

  // Fungsi untuk mengirim ulang OTP jika tidak masuk
  const handleResendOtp = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;
      alert('Kode OTP baru telah dikirim ulang ke email Anda.');
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
        <div className="flex flex-col w-full items-center">
          
          {/* Main Interactive Bento Box */}
          <div className="bg-[#fbf8ff] rounded-2xl p-6 shadow-sm flex flex-col items-center w-full max-w-md">
            
            {/* Delight Visual Badge */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#88f3d1]/40 flex items-center justify-center text-[#01A684] shadow-sm ring-4 ring-[#88f3d1]/20">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Cek Email Anda</h2>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Kami telah mengirimkan 6 digit kode verifikasi ke email:
              </p>
            </div>

            {/* Highlighted Target Email Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ececff] text-slate-900 text-sm font-medium mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[#01A684] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <span className="truncate max-w-[200px]">{userEmail || 'email@domain.com'}</span>
            </div>

            {/* Action Form */}
            <form className="w-full flex flex-col items-center gap-4" onSubmit={handleVerify}>
              
              {/* Input OTP 6 Digit */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center" htmlFor="otpCode">
                  MASUKKAN 6 DIGIT KODE OTP
                </label>
                <input 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-center text-xl font-bold tracking-widest text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all" 
                  id="otpCode" 
                  name="otpCode" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="------" 
                  maxLength={6}
                  required 
                  type="text" 
                />
              </div>

              <button 
                className="w-full mt-2 py-3.5 px-6 bg-[#01A684] hover:bg-[#018f71] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer border-0 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Resend OTP Option */}
            <div className="text-center mt-4">
              <p className="text-xs text-slate-500">
                Tidak menerima kode?{' '}
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-[#01A684] hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Kirim Ulang
                </button>
              </p>
            </div>

            {/* Trust Note */}
            <div className="mt-6 w-full bg-[#f3f2ff] rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-1 rounded-full bg-[#88f3d1] text-[#01A684] shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">Gratis & Aman via Supabase SMTP</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pastikan mengecek folder Spam atau Promosi jika email verifikasi tidak muncul di Kotak Masuk Utama Anda.
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
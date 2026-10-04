import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterOTP() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('regEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi sukses instan, arahkan ke halaman pilih paket (register-plan)
    setTimeout(() => {
      setLoading(false);
      alert('Pendaftaran Berhasil! Silakan pilih paket langganan Anda.');
      navigate('/register-plan');
    }, 800);
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
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Konfirmasi Pendaftaran</h2>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Akun Anda siap diaktifkan untuk email berikut:
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

            {/* Action Form */}
            <form className="w-full flex flex-col items-center gap-4" onSubmit={handleVerify}>
              <p className="text-xs text-slate-500 text-center px-4">
                Klik tombol di bawah untuk menyelesaikan proses pendaftaran dan masuk ke dasbor Anda.
              </p>

              <button 
                className="w-full mt-2 py-3.5 px-6 bg-[#01A684] hover:bg-[#018f71] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer border-0 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            {/* Trust Note */}
            <div className="mt-8 w-full bg-[#f3f2ff] rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="p-1 rounded-full bg-[#88f3d1] text-[#01A684] shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">Sistem Otomatis Titik Jual</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pendaftaran manual tanpa kendala verifikasi email eksternal.
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
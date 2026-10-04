import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#01a684] h-screen w-full flex flex-col justify-between relative overflow-hidden antialiased">
      
      {/* Top Section: Branding & Logo */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 select-none">
        {/* Version & Category Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider mb-5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
          POS & Manajemen Bisnis • v2.4
        </div>

        {/* Main Logo Wordmark */}
        <div className="flex items-baseline justify-center text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm" style={{ letterSpacing: '-0.04em' }}>
          <span className="text-[#1A1F24] font-black">titik</span>
          <span className="text-white font-extrabold flex items-baseline">
            jual
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-white ml-0.5 mb-1"></span>
          </span>
        </div>

        {/* Brand Subtitle / Slogan */}
        <p className="text-white/95 text-[10.5px] font-bold tracking-[0.22em] uppercase max-w-[280px] leading-relaxed">
          Solusi Pintar Manajemen Transaksi
        </p>

        {/* Decorative Subtle Ambient Glow Behind Logo */}
        <div className="absolute w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      </main>

      {/* Bottom Section: Action Card */}
      <div 
        className="relative w-full bg-white rounded-t-[34px] px-6 pt-7 pb-6 flex flex-col justify-between z-10 text-slate-800"
        style={{ boxShadow: '0 -8px 24px -4px rgba(0, 0, 0, 0.08), 0 -4px 10px -2px rgba(0, 0, 0, 0.03)' }}
      >
        {/* Optional drag indicator bar */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-4"></div>

        {/* Welcome Text */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
            Selamat Datang
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed font-normal">
            Kelola transaksi kasir, inventori stok, dan laporan performa outlet Anda dalam satu aplikasi terpadu.
          </p>
        </div>

        {/* Action Buttons Area */}
        <div className="w-full space-y-3 mb-5">
          {/* Primary Action: Masuk Akun */}
          <button
            onClick={() => navigate('/login-form')}
            className="w-full flex items-center justify-center gap-2 bg-[#01A684] hover:bg-[#008f70] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-150 text-base cursor-pointer"
            style={{ boxShadow: '0 6px 16px -2px rgba(1, 166, 132, 0.35)' }}
            type="button"
          >
            <span>Masuk Akun</span>
            <svg className="w-4 h-4 stroke-[2.2] stroke-current" fill="none" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>

          {/* Secondary Action: Daftar Akun Baru */}
          <button
            onClick={() => {
              navigate('/register');
            }}
            className="w-full flex items-center justify-center bg-white hover:bg-[#F4FBF9] active:bg-slate-50 border-2 border-[#01A684] text-[#01A684] font-semibold py-3 px-6 rounded-xl transition-all duration-150 text-base cursor-pointer"
            type="button"
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Support & Trouble Access Link */}
        <div className="text-center mb-4">
          <a
            className="inline-block text-xs font-medium text-slate-500 hover:text-[#01A684] transition-colors duration-150 py-1"
            href="#bantuan"
            onClick={(e) => {
              e.preventDefault();
              alert('Silakan hubungi administrator untuk bantuan pemulihan.');
            }}
          >
            Butuh bantuan atau lupa kata sandi?
          </a>
        </div>

        {/* Footer Copyright */}
        <footer className="border-t border-slate-100 pt-3 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
          </p>
        </footer>
      </div>

    </div>
  );
}

export default Login;
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#01a684] min-h-screen w-full flex flex-col lg:flex-row items-center justify-center relative overflow-x-hidden antialiased">
      
      {/* Container Utama untuk Tablet & Desktop agar terpusat rapi */}
      <div className="w-full max-w-5xl min-h-screen lg:min-h-[auto] flex flex-col lg:flex-row items-center justify-between lg:bg-white/10 lg:backdrop-blur-xl lg:rounded-[36px] lg:border lg:border-white/20 lg:shadow-2xl lg:overflow-hidden my-auto">
        
        {/* Top / Left Section: Branding & Logo */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 lg:py-20 z-10 select-none w-full">
          {/* Version & Category Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            POS & Manajemen Bisnis • v2.4
          </div>

          {/* Main Logo Wordmark */}
          <div className="flex items-baseline justify-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 text-white drop-shadow-sm" style={{ letterSpacing: '-0.04em' }}>
            <span className="text-[#1A1F24] font-black">titik</span>
            <span className="text-white font-extrabold flex items-baseline">
              jual
              <span className="inline-block w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-white ml-0.5 mb-1 lg:mb-1.5"></span>
            </span>
          </div>

          {/* Brand Subtitle / Slogan */}
          <p className="text-white/95 text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase max-w-[280px] sm:max-w-sm leading-relaxed">
            Solusi Pintar Manajemen Transaksi
          </p>

          {/* Decorative Subtle Ambient Glow Behind Logo */}
          <div className="absolute w-44 h-44 lg:w-72 lg:h-72 bg-white/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        </main>

        {/* Bottom / Right Section: Action Card */}
        <div 
          className="relative w-full lg:max-w-md bg-white rounded-t-[34px] lg:rounded-t-none lg:rounded-r-[36px] px-6 sm:px-10 pt-8 pb-8 flex flex-col justify-between z-10 text-slate-800 shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)] lg:shadow-none min-h-[420px] lg:h-full"
        >
          {/* Optional drag indicator bar (Hanya muncul di mobile) */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-4 lg:hidden"></div>

          {/* Welcome Text */}
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
              Selamat Datang
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-normal">
              Kelola transaksi kasir, inventori stok, dan laporan performa outlet Anda dalam satu aplikasi terpadu.
            </p>
          </div>

          {/* Action Buttons Area */}
          <div className="w-full space-y-3.5 mb-6">
            {/* Primary Action: Masuk Akun */}
            <button
              onClick={() => navigate('/login-form')}
              className="w-full flex items-center justify-center gap-2 bg-[#01A684] hover:bg-[#008f70] active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-150 text-base cursor-pointer shadow-md hover:shadow-lg border-0"
              type="button"
            >
              <span>Masuk Akun</span>
              <svg className="w-4 h-4 stroke-[2.2] stroke-current" fill="none" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>

            {/* Secondary Action: Daftar Akun Baru */}
            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center justify-center bg-white hover:bg-[#F4FBF9] active:bg-slate-50 border-2 border-[#01A684] text-[#01A684] font-semibold py-3.5 px-6 rounded-2xl transition-all duration-150 text-base cursor-pointer"
              type="button"
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Support & Trouble Access Link */}
          <div className="text-center mb-5">
            <a
              className="inline-block text-xs sm:text-sm font-medium text-slate-500 hover:text-[#01A684] transition-colors duration-150 py-1"
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
          <footer className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
            </p>
          </footer>
        </div>

      </div>
    </div>
  );
}

export default Login;
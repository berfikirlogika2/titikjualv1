import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/owner-dashboard');
  };

  return (
    <div className="bg-[#01A684] text-slate-800 min-h-screen flex flex-col font-['Inter'] antialiased selection:bg-[#01A684] selection:text-white overflow-x-hidden">
      
      {/* Top Section: Branding */}
      <header className="pt-8 pb-10 px-6 flex flex-col items-center text-center relative bg-[#01A684] text-white w-full">
        <div className="w-full flex items-center justify-between mb-4 max-w-md">
          <button 
            aria-label="Kembali" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-white backdrop-blur-sm cursor-pointer border-0" 
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/20 text-emerald-100 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5bdcb7] animate-pulse"></span>
            POS &amp; MANAJEMEN BISNIS • V2.4
          </span>
          
          <div className="w-10"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center tracking-tight text-white font-extrabold text-3xl sm:text-4xl">
            <span>titik</span>
            <span className="text-[#7af9d2]">jual</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7af9d2] ml-0.5 self-end mb-1.5"></span>
          </div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-emerald-100/90 text-center">
            SOLUSI PINTAR MANAJEMEN TRANSAKSI
          </p>
        </div>
      </header>

      {/* Bottom Section: Login Actions Card */}
      <div className="bg-white text-slate-900 w-full rounded-t-[32px] px-6 py-8 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] flex flex-col flex-1 max-w-md mx-auto overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun</h1>
          <p className="text-[#86899B] text-sm mt-1">Akses cepat terminal kasir dan laporan bisnis Anda</p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          
          {/* Input Email / Username (Tanpa placeholder contoh) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="username">
              Email / Nama Pengguna
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">
                alternate_email
              </span>
              <input 
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all" 
                required
              />
            </div>
          </div>

          {/* Input Password (Tanpa placeholder contoh) */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="password">
                Kata Sandi
              </label>
              <a 
                className="text-xs font-semibold text-[#01A684] hover:text-[#006b54] hover:underline transition-colors" 
                href="#lupa-sandi"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Silakan hubungi administrator untuk pemulihan kata sandi.');
                }}
              >
                Lupa Kata Sandi?
              </a>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px] pointer-events-none">
                lock
              </span>
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all" 
                required
              />
              <button 
                aria-label="Tampilkan kata sandi" 
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors bg-transparent border-0" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Checkbox Remember Me */}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#01A684] focus:ring-[#01A684] border-slate-300 accent-[#01A684] cursor-pointer" 
              />
              <span className="text-xs text-slate-600 font-medium">Ingat saya di perangkat ini</span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            className="w-full bg-[#01A684] hover:bg-[#008769] text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer border-0" 
            type="submit"
          >
            <span>Masuk Sekarang</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center my-2">
          <div className="flex-grow border-t border-[#E9EBED]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white px-2">
            ATAU MASUK DENGAN
          </span>
          <div className="flex-grow border-t border-[#E9EBED]"></div>
        </div>

        {/* Social SSO Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all active:scale-[0.98] cursor-pointer" 
            type="button"
            onClick={() => navigate('/owner-dashboard')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" fill="#EA4335"></path>
              <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" fill="#4285F4"></path>
              <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05"></path>
              <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" fill="#34A853"></path>
            </svg>
            <span>Google</span>
          </button>

          <button 
            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all active:scale-[0.98] cursor-pointer" 
            type="button"
            onClick={() => navigate('/owner-dashboard')}
          >
            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.02-.49 2.64-1.24z"></path>
            </svg>
            <span>Apple ID</span>
          </button>
        </div>

        {/* Register Prompt */}
        <div className="text-center mt-6 mb-3">
          <p className="text-xs text-slate-600">
            Belum memiliki akun outlet?
            <a 
              className="text-[#01A684] font-semibold hover:underline ml-1 cursor-pointer" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              Daftar Sekarang
            </a>
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center mt-auto pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
          </p>
        </footer>
      </div>

    </div>
  );
}

export default LoginForm;
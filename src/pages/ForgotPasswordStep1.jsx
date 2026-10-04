import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

function ForgotPasswordStep1() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('email');

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex items-center justify-center p-4 font-sans">
      {/* Outer Mobile Container Wrapper */}
      <main className="w-full max-w-sm bg-[#F8F9FA] min-h-[720px] rounded-[28px] p-6 shadow-sm border border-gray-200/60 flex flex-col gap-5 relative">
        {/* Back Button Header */}
        <header className="flex items-center">
          <button 
            onClick={() => navigate('/login-form')} 
            className="p-1.5 -ml-1 text-[#01A684] hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </header>

        {/* Bento Box 1: Title & Method Selector */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#181b2b] mb-1">Lupa Kata Sandi?</h2>
            <p className="text-xs text-[#86899B] leading-relaxed">
              Masukkan email atau nomor HP Anda untuk menerima kode verifikasi reset kata sandi.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex bg-[#F1F2F6] p-1 rounded-xl border border-gray-200/60">
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                method === 'phone'
                  ? 'bg-[#01A684] text-white shadow-sm'
                  : 'text-[#86899B] hover:text-[#181b2b]'
              }`}
            >
              No. Handphone
            </button>
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                method === 'email'
                  ? 'bg-[#01A684] text-white shadow-sm'
                  : 'text-[#86899B] hover:text-[#181b2b]'
              }`}
            >
              Email
            </button>
          </div>
        </section>

        {/* Bento Box 2: Dynamic Input Form */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 shadow-sm">
          {method === 'email' ? (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-[#181b2b]">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#86899B] pointer-events-none" />
                <input
                  type="email"
                  placeholder="contoh@gmail.com"
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-[#181b2b] outline-none focus:border-[#01A684] focus:bg-white focus:ring-1 focus:ring-[#01A684] transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-[#181b2b]">Nomor Handphone</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-[#86899B] pointer-events-none" />
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs text-[#181b2b] outline-none focus:border-[#01A684] focus:bg-white focus:ring-1 focus:ring-[#01A684] transition-all"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={() => navigate('/forgot-password-otp')}
            className="w-full bg-[#01A684] hover:opacity-90 active:scale-[0.98] text-white font-semibold py-3.5 rounded-full text-xs transition-all shadow-sm cursor-pointer mt-1"
          >
            Kirim Kode
          </button>
        </section>
      </main>
    </div>
  );
}

export default ForgotPasswordStep1;
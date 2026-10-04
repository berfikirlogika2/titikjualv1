import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function ForgotPasswordOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['5', '1', '1', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Otomatis pindah fokus ke input berikutnya
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Pindah ke input sebelumnya jika menekan Backspace saat kosong
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex items-center justify-center p-4 font-sans">
      {/* Outer Card Container */}
      <main className="w-full max-w-sm bg-[#F8F9FA] rounded-[28px] p-6 shadow-sm border border-gray-200/60 flex flex-col gap-5 relative">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 -ml-1 text-[#01A684] hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Top Bento Card: Illustration & Info */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-sm border border-gray-100">
          <div className="w-36 h-36 mb-2 flex items-center justify-center">
            <img 
              alt="OTP Security" 
              className="w-full h-full object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDedsAdm7IDbxIuhezykinF7AaD6rFdL2_15-L8gEE1knJJpXcvoP7TwkGmP7M3OlJ7gIxF9QTaJWFGDuI8YDBp9Cy1uIez8inX6JbuLGhpwQ_QobmkwxTKUKMzK6taWL5vUVVXnVTNUEyMuYG7gaQxDe_FXfVZlDvHOvIbbmDK8LIQEC-2OPJ533l_nV0fvO7ys-5LxVZ1_XBgbOCSQTx_uHL084z4I9hCGR30q-HKpkZzZYfc-wX_gn6MzY0iwnVFYkU" 
            />
          </div>
          <h2 className="text-base font-bold text-[#181b2b] mb-1">Masukkan Kode OTP</h2>
          <p className="text-[11px] text-[#86899B] leading-relaxed">
            Kami telah mengirimkan 4 digit kode OTP ke email<br />
            <span className="font-semibold text-[#181b2b]">ha*******@gmail.com</span>
          </p>
        </div>

        {/* Bottom Bento Card: Input & Action */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-5 shadow-sm">
          {/* OTP Box Inputs */}
          <div className="flex justify-center gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl bg-[#F8F9FA] text-[#181b2b] focus:border-[#01A684] focus:bg-white focus:ring-1 focus:ring-[#01A684] outline-none transition-all"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={() => navigate('/reset-password')}
            className="w-full bg-[#01A684] hover:opacity-90 active:scale-[0.98] text-white font-semibold py-3.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
          >
            Verifikasi
          </button>

          {/* Resend Link */}
          <div className="text-center">
            <p className="text-[11px] text-[#86899B]">
              Belum menerima kode?{' '}
              <button 
                type="button" 
                className="text-[#01A684] font-semibold hover:underline cursor-pointer bg-transparent border-none"
              >
                Kirim Ulang
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPasswordOTP;
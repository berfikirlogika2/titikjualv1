import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';

function ResetPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex items-center justify-center p-4 font-sans relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-10" />

      {/* Modal Dialog */}
      <main className="w-full max-w-sm bg-white rounded-3xl border border-[#E9EBED] p-6 flex flex-col items-center text-center shadow-2xl z-20 relative animate-fadeIn">
        <button
          onClick={() => navigate('/login-form')}
          className="absolute top-4 left-4 p-2 text-[#86899B] hover:text-[#181b2b] rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-[#01A684]/10 text-[#01A684] flex items-center justify-center mt-4 mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-lg font-bold text-[#181b2b] mb-2">Kata Sandi Berhasil Diubah</h2>
        <p className="text-xs text-[#86899B] mb-6 max-w-[240px]">
          Akun Anda sekarang telah aman. Silakan masuk menggunakan kata sandi baru Anda.
        </p>

        <button
          onClick={() => navigate('/login-form')}
          className="w-full bg-[#01A684] hover:opacity-90 text-white py-3.5 rounded-full text-xs font-semibold shadow-md cursor-pointer transition-all active:scale-[0.98]"
        >
          Masuk Sekarang
        </button>
      </main>
    </div>
  );
}

export default ResetPasswordSuccess;
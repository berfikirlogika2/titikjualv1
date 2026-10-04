import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Store } from 'lucide-react';

function RegisterSuccess() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    // Bersihkan data sementara pendaftaran di localStorage jika diperlukan
    localStorage.removeItem('regEmail');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('paymentMethod');

    // Masuk ke dashboard owner
    navigate('/owner-dashboard');
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-[#E9EBED] flex flex-col items-center">
        
        {/* Ikon Sukses Beranimasi / Menonjol */}
        <div className="w-20 h-20 bg-[#00A482]/10 text-[#00A482] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Judul & Deskripsi */}
        <h1 className="text-2xl font-bold text-[#181b2b] mb-2">Pembayaran Berhasil!</h1>
        <p className="text-sm text-[#86899B] mb-6">
          Selamat! Langganan paket dan akun <span className="font-semibold text-[#181b2b]">Titik Jual</span> Anda telah aktif. Outlet Anda siap digunakan untuk mengelola transaksi.
        </p>

        {/* Informasi Ringkas */}
        <div className="w-full bg-[#f3f9f7] rounded-2xl p-4 mb-6 flex items-center gap-3 text-left border border-[#00A482]/20">
          <div className="w-10 h-10 rounded-xl bg-[#00A482] text-white flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#86899B] uppercase tracking-wider">Status Akun</h4>
            <p className="text-sm font-bold text-[#00A482]">Aktif &amp; Terverifikasi</p>
          </div>
        </div>

        {/* Tombol Menuju Dashboard */}
        <button 
          onClick={handleGoToDashboard}
          className="w-full bg-[#00A482] hover:opacity-90 active:scale-[0.98] transition-all text-white py-4 font-bold rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md border-0"
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>

      {/* Footer Signature */}
      <footer className="text-center mt-8">
        <p className="text-xs text-gray-400 font-medium">
          © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
        </p>
      </footer>
    </div>
  );
}

export default RegisterSuccess;
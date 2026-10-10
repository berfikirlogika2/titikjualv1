import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
  const navigate = useNavigate();

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

      {/* Main Content Card */}
      <main className="w-full bg-white flex-1 rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col px-6 pt-10 pb-12 z-20 relative max-w-screen-md mx-auto">
        
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#88f3d1]/40 text-[#01A684] mb-3 shadow-sm">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Syarat & Ketentuan Penggunaan</h2>
          <p className="text-sm text-gray-500 mt-1">Kebijakan dan ketentuan layanan resmi aplikasi POS UMKM Titik Jual</p>
        </div>

        {/* Content Box */}
        <div className="bg-[#fbf8ff] rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed max-w-2xl mx-auto w-full">
          
          <section className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#01A684] text-lg">info</span>
              1. Ketentuan Umum & Ruang Lingkup
            </h3>
            <p>
              Selamat datang di aplikasi <strong>Titik Jual</strong>. Dengan mendaftarkan diri dan membuat akun sebagai Pemilik Usaha (Owner), Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi Syarat & Ketentuan ini. Aplikasi ini dirancang khusus sebagai solusi Point of Sales (POS) manajemen transaksi untuk mendukung perkembangan UMKM di Indonesia.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#01A684] text-lg">admin_panel_settings</span>
              2. Peran Pengguna & Arsitektur Keamanan Data (`owner_id`)
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Hak Akses Owner:</strong> Pemilik Usaha memiliki kontrol penuh atas manajemen outlet, produk, laporan keuangan, serta penambahan staf operasional.</li>
              <li><strong>Isolasi Data:</strong> Seluruh data operasional, inventaris, dan transaksi staf (Admin/Kasir) di dalam sistem terikat secara aman menggunakan identifikasi unik <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-[#01A684]">owner_id</code> untuk menjamin privasi dan pemisahan data antar usaha secara ketat.</li>
              <li>Owner bertanggung jawab penuh atas kerahasiaan akun dan seluruh aktivitas yang dilakukan oleh staf di bawah kendali outletnya.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#01A684] text-lg">payments</span>
              3. Langganan dan Sistem Pembayaran (Midtrans)
            </h3>
            <p>
              Layanan operasional aplikasi menggunakan sistem berlangganan yang transparan. Proses transaksi pembayaran paket langganan dikelola secara aman melalui partner <em>payment gateway</em> resmi <strong>Midtrans</strong>. Fitur aplikasi akan diaktifkan secara otomatis setelah konfirmasi pembayaran berhasil divalidasi oleh sistem.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#01A684] text-lg">security</span>
              4. Keamanan Data & Privasi (Supabase & SMTP)
            </h3>
            <p>
              Kami menggunakan infrastruktur basis data modern dan aman (Supabase) dengan enkripsi tingkat tinggi serta proteksi kebijakan baris data (RLS). Pengiriman verifikasi akun (OTP) dan notifikasi penting dikelola melalui layanan pengiriman email profesional untuk menjamin kenyamanan pengguna.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#01A684] text-lg">warning</span>
              5. Batasan Tanggung Jawab
            </h3>
            <p>
              Pengembang Titik Jual berkomitmen memberikan performa sistem yang optimal dan stabil. Namun, kami tidak bertanggung jawab atas kerugian akibat kelalaian pengguna dalam menjaga kerahasiaan sandi akun, gangguan perangkat keras milik pengguna, atau kendala jaringan internet di lokasi operasional usaha.
            </p>
          </section>

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-200/60 flex justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="w-full max-w-xs py-3.5 bg-[#01A684] hover:bg-[#018f71] text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer border-0 flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Saya Mengerti & Kembali</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <footer className="w-full text-center pt-10 pb-4">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
          </p>
        </footer>

      </main>
    </div>
  );
}

export default TermsAndConditions;
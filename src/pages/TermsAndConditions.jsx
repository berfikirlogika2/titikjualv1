import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-gray-50">
      
      {/* Header */}
      <header className="w-full bg-[#00A482] text-white py-6 px-6 sticky top-0 z-30 shadow-sm">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/25 hover:bg-white/35 text-white transition-colors cursor-pointer border-0" 
            title="Kembali"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">Syarat & Ketentuan Titik Jual</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-3xl mx-auto flex-1 bg-white p-6 md:p-10 my-6 rounded-2xl shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">1. Ketentuan Umum</h2>
          <p>
            Selamat datang di aplikasi <strong>Titik Jual</strong>. Dengan mendaftarkan akun sebagai Pemilik Usaha (Owner), Anda menyetujui untuk terikat dengan Syarat dan Ketentuan Penggunaan ini. Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan layanan kami.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. Akun dan Keamanan</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Owner bertanggung jawab penuh atas kerahasiaan akun, kata sandi (password), serta seluruh aktivitas yang terjadi di dalam akun Anda dan staf yang Anda daftarkan.</li>
            <li>Setiap akun kasir dan admin yang dibuat oleh Owner memiliki sinkronisasi data yang terikat dengan ID Owner yang bersangkutan untuk menjaga kerahasiaan dan pemisahan data antar usaha.</li>
            <li>Titik Jual tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian Owner dalam menjaga keamanan kredensial akun.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. Langganan dan Pembayaran</h2>
          <p>
            Layanan aplikasi menggunakan sistem berlangganan yang dikelola melalui gateway pembayaran resmi (Midtrans). Fitur dan akses aplikasi akan aktif sesuai dengan paket langganan yang dipilih dan dibayarkan oleh pengguna.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">4. Privasi dan Kerahasiaan Data Bisnis</h2>
          <p>
            Kami berkomitmen menjaga keamanan data transaksi, produk, dan laporan keuangan UMKM Anda menggunakan enkripsi server Supabase. Data bisnis Anda bersifat privat dan tidak akan dibagikan kepada pihak yang tidak berwenang.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">5. Batasan Tanggung Jawab</h2>
          <p>
            Pengembang Titik Jual terus berupaya memberikan layanan terbaik dan stabil. Namun, kami tidak bertanggung jawab atas gangguan teknis murni di luar kendali sistem (seperti gangguan jaringan internet pengguna atau kendala pada server pihak ketiga).
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#00A482] text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer border-0 shadow-sm"
          >
            Saya Mengerti & Kembali
          </button>
        </div>

      </main>

      <footer className="w-full text-center py-6 text-xs text-gray-400">
        © 2026 Titik Jual • Solusi Pintar Manajemen Transaksi
      </footer>
    </div>
  );
}

export default TermsAndConditions;
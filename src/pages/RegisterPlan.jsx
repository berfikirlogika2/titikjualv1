import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Pastikan path import supabase sudah benar sesuai struktur folder Anda

function RegisterPlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('free_trial'); // Default ke free trial 2 minggu
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' atau 'yearly'
  const [loading, setLoading] = useState(false);

  // Harga dasar per bulan untuk paket berbayar
  const prices = {
    starter: 150000,
    growth: 250000,
    enterprise: 450000
  };

  // Kalkulasi harga & diskon
  const getCalculatedPrice = (planKey) => {
    if (planKey === 'free_trial') return 0;
    const baseMonthly = prices[planKey];
    if (billingCycle === 'yearly') {
      // Diskon 10% untuk Growth dan Enterprise
      const discount = (planKey === 'growth' || planKey === 'enterprise') ? 0.10 : 0;
      const yearlyTotal = baseMonthly * 12 * (1 - discount);
      return Math.round(yearlyTotal);
    }
    return baseMonthly;
  };

  const handleNext = async () => {
    const calculatedPrice = getCalculatedPrice(selectedPlan);
    setLoading(true);

    // 1. Simpan sementara ke localStorage untuk cadangan sesi / halaman pembayaran
    localStorage.setItem('selectedPlan', selectedPlan);
    localStorage.setItem('billingCycle', billingCycle);
    localStorage.setItem('totalPrice', calculatedPrice);

    try {
      // 2. Ambil user yang sedang aktif saat ini dari Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Hitung masa aktif (free_trial 14 hari, bulanan 30 hari, tahunan 365 hari)
        const daysToAdd = selectedPlan === 'free_trial' ? 14 : (billingCycle === 'yearly' ? 365 : 30);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);

        // 3. Update data paket langsung ke tabel profiles di Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: selectedPlan,
            billing_cycle: billingCycle,
            subscription_status: selectedPlan === 'free_trial' ? 'active' : 'pending_payment',
            subscription_expires_at: expiryDate.toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Gagal memperbarui paket di database:', updateError.message);
        }
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat menyimpan paket:', err);
    } finally {
      setLoading(false);
    }

    // 4. Navigasi sesuai pilihan paket
    if (selectedPlan === 'free_trial') {
      navigate('/register-success');
    } else {
      navigate('/register-payment');
    }
  };

  return (
    <div className="bg-[#01A684] font-sans antialiased text-[#181b2b] min-h-screen flex flex-col items-center justify-between">
      {/* Container Form Mobile Responsif */}
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between">
        
        {/* Header Hijau Solid Titik Jual */}
        <header className="pt-8 pb-7 px-6 flex items-center justify-between relative text-white">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali" 
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center text-white tracking-tight">
              <span className="text-2xl font-bold tracking-tight">titik</span>
              <span className="text-2xl font-bold tracking-tight text-white/95">jual</span>
              <span className="w-2 h-2 rounded-full bg-white ml-0.5 inline-block"></span>
            </div>
          </div>

          <div className="w-10 h-10"></div>
        </header>

        {/* Main Card Body Putih Melengkung */}
        <main className="w-full bg-white rounded-t-[36px] shadow-2xl px-6 pt-7 pb-10 flex-1 flex flex-col justify-between">
          <div>
            {/* Heading */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-[#181b2b] tracking-tight">Pilih Paket Bisnis</h1>
              <p className="text-xs text-[#86899B] mt-1.5 leading-relaxed">
                Nikmati uji coba gratis 2 minggu atau pilih paket sistem kasir yang sesuai dengan kebutuhan usaha Anda.
              </p>
            </div>

            {/* Toggle Bulanan / Tahunan */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#F1F2F6] p-1 rounded-2xl flex items-center w-full max-w-[260px] border border-[#E9EBED]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer border-0 ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#181b2b] shadow-sm'
                      : 'text-[#86899B] bg-transparent hover:text-[#181b2b]'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer border-0 flex items-center justify-center gap-1 ${
                    billingCycle === 'yearly'
                      ? 'bg-[#01A684] text-white shadow-sm'
                      : 'text-[#86899B] bg-transparent hover:text-[#181b2b]'
                  }`}
                >
                  <span>Tahunan</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-[#01A684]/15 text-[#01A684]'}`}>
                    Hemat 10%
                  </span>
                </button>
              </div>
            </div>

            {/* Stepper Indicator (Step 2 Aktif) */}
            <div className="flex items-center justify-center mb-6 px-4">
              <div className="flex items-center w-full max-w-xs relative">
                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#01A684] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#01A684] mt-1">Isi Data</span>
                </div>
                
                <div className="flex-1 h-0.5 bg-[#01A684] -mt-3.5 mx-1"></div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#01A684] text-white ring-4 ring-[#01A684]/20 flex items-center justify-center text-xs font-bold shadow-sm">
                    2
                  </div>
                  <span className="text-[10px] font-semibold text-[#01A684] mt-1">Paket</span>
                </div>

                <div className="flex-1 h-0.5 bg-[#E9EBED] -mt-3.5 mx-1"></div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#F1F2F6] text-[#86899B] border border-[#E9EBED] flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <span className="text-[10px] text-[#86899B] mt-1">Detail</span>
                </div>

                <div className="flex-1 h-0.5 bg-[#E9EBED] -mt-3.5 mx-1"></div>

                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#F1F2F6] text-[#86899B] border border-[#E9EBED] flex items-center justify-center text-xs font-semibold">
                    4
                  </div>
                  <span className="text-[10px] text-[#86899B] mt-1">Selesai</span>
                </div>
              </div>
            </div>

            {/* Pilihan Paket Bento Cards */}
            <div className="space-y-3">
              
              {/* Paket 0: Free Trial 2 Minggu */}
              <div 
                onClick={() => setSelectedPlan('free_trial')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === 'free_trial' 
                    ? 'border-[#01A684] bg-[#01A684]/5 shadow-sm' 
                    : 'border-[#E9EBED] bg-[#F1F2F6]/40 hover:border-[#01A684]/40'
                }`}
              >
                {selectedPlan === 'free_trial' && (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#01A684] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Tanpa Kartu Kredit
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#181b2b]">Uji Coba Free 2 Minggu</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#01A684]/20 text-[#01A684] rounded-full">Akses Penuh</span>
                    </div>
                    <p className="text-xs text-[#86899B] mt-1">Coba seluruh fitur premium tanpa batasan selama 14 hari</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#01A684]">Rp 0</span>
                    <span className="text-[10px] text-[#86899B] block">Gratis 14 Hari</span>
                  </div>
                </div>
                <ul className="mt-2.5 pt-2 border-t border-[#01A684]/20 space-y-1 text-xs text-[#181b2b]">
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Akses Semua Fitur Tanpa Batasan</li>
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Tanpa Biaya Tersembunyi</li>
                </ul>
              </div>

              {/* Paket 1: Starter */}
              <div 
                onClick={() => setSelectedPlan('starter')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === 'starter' 
                    ? 'border-[#01A684] bg-[#01A684]/5 shadow-sm' 
                    : 'border-[#E9EBED] bg-[#F1F2F6]/40 hover:border-[#01A684]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#181b2b]">Paket Starter</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded-full">UMKM Rintisan</span>
                    </div>
                    <p className="text-xs text-[#86899B] mt-1">Ideal untuk 1 cabang outlet & gerai tunggal</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#181b2b]">
                      Rp {getCalculatedPrice('starter').toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-[#86899B] block">
                      {billingCycle === 'yearly' ? '/tahun' : '/bulan'}
                    </span>
                  </div>
                </div>
                <ul className="mt-2.5 pt-2 border-t border-[#E9EBED]/80 space-y-1 text-xs text-[#86899B]">
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> 1 Kuota Outlet Cabang</li>
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Hingga 3 Akun Staf Kasir</li>
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> POS Kasir & Struk Digital/Thermal</li>
                </ul>
              </div>

              {/* Paket 2: Growth (Paling Populer) */}
              <div 
                onClick={() => setSelectedPlan('growth')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === 'growth' 
                    ? 'border-[#01A684] bg-[#01A684]/5 shadow-sm' 
                    : 'border-[#E9EBED] bg-[#F1F2F6]/40 hover:border-[#01A684]/40'
                }`}
              >
                {selectedPlan === 'growth' && (
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#01A684] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    Paling Populer
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#181b2b]">Paket Growth</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#01A684]/20 text-[#01A684] rounded-full">Rekomendasi</span>
                    </div>
                    <p className="text-xs text-[#86899B] mt-1">Untuk kafe, resto, & ritel berkembang</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#01A684]">
                      Rp {getCalculatedPrice('growth').toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-[#86899B] block">
                      {billingCycle === 'yearly' ? '/tahun (Diskon 10%)' : '/bulan'}
                    </span>
                  </div>
                </div>
                <ul className="mt-2.5 pt-2 border-t border-[#01A684]/20 space-y-1 text-xs text-[#181b2b]">
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Maksimal 3 Cabang Outlet</li>
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Hingga 10 Akun Staf & Shift</li>
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Bahan Baku & HPP Resep Terintegrasi</li>
                  <li className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Laporan Finansial & Pajak PBJT</li>
                </ul>
              </div>

              {/* Paket 3: Pro Enterprise */}
              <div 
                onClick={() => setSelectedPlan('enterprise')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === 'enterprise' 
                    ? 'border-[#01A684] bg-[#01A684]/5 shadow-sm' 
                    : 'border-[#E9EBED] bg-[#F1F2F6]/40 hover:border-[#01A684]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#181b2b]">Pro Enterprise</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded-full">Franchise / Multi</span>
                    </div>
                    <p className="text-xs text-[#86899B] mt-1">Solusi jaringan waralaba & cabang tanpa batas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#181b2b]">
                      Rp {getCalculatedPrice('enterprise').toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-[#86899B] block">
                      {billingCycle === 'yearly' ? '/tahun (Diskon 10%)' : '/bulan'}
                    </span>
                  </div>
                </div>
                <ul className="mt-2.5 pt-2 border-t border-[#E9EBED]/80 space-y-1 text-xs text-[#86899B]">
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Unlimited Cabang & Akun Staf</li>
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Sinkronisasi Real-time Multi-Gudang</li>
                  <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[#01A684] text-[15px]">check_circle</span> Dukungan Dedicated CS Prioritas 24/7</li>
                </ul>
              </div>
            </div>

            {/* Tombol Aksi Lanjut */}
            <div className="mt-6 flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="w-1/3 py-3 px-3 rounded-xl bg-[#F1F2F6] hover:bg-gray-200 text-[#181b2b] font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer border-0"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Kembali</span>
              </button>
              <button 
                type="button" 
                onClick={handleNext}
                disabled={loading}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#01A684] hover:bg-[#008769] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer border-0 disabled:opacity-50"
              >
                <span>{loading ? 'Menyimpan...' : (selectedPlan === 'free_trial' ? 'Mulai Uji Coba Gratis' : 'Lanjutkan ke Pembayaran')}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="text-center pt-5 mt-3 border-t border-[#E9EBED]/60">
            <p className="text-[10px] text-[#86899B]">© 2026 Titik Jual • Solusi Pintar Manajemen Transaksi</p>
          </div>
        </main>

      </div>
    </div>
  );
}

export default RegisterPlan;
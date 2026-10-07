import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { createMidtransTransaction } from '../midtransService';

function RegisterPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState({
    name: 'Paket Growth',
    key: 'growth',
    cycle: 'monthly',
    price: 250000
  });

  useEffect(() => {
    // Ambil data pilihan dari localStorage yang disimpan di halaman Plan
    const savedPlan = localStorage.getItem('selectedPlan') || 'growth';
    const savedCycle = localStorage.getItem('billingCycle') || 'monthly';
    const savedPrice = localStorage.getItem('totalPrice');

    let planName = 'Paket Growth';
    let defaultPrice = 250000;

    if (savedPlan === 'starter') {
      planName = 'Paket Starter';
      defaultPrice = savedCycle === 'yearly' ? 1000000 : 100000; 
    } else if (savedPlan === 'growth') {
      planName = 'Paket Growth';
      defaultPrice = savedCycle === 'yearly' ? 2500000 : 250000;
    } else if (savedPlan === 'enterprise' || savedPlan === 'pro') {
      planName = 'Pro Enterprise';
      defaultPrice = savedCycle === 'yearly' ? 5000000 : 500000;
    }

    setPlanDetails({
      name: planName,
      key: savedPlan,
      cycle: savedCycle,
      price: savedPrice ? Number(savedPrice) : defaultPrice
    });

    // Load Midtrans Snap Script secara dinamis standar
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'; 
    const myClientKey = 'Mid-client-QYOPB6cvl1hbPgMW';

    if (!document.getElementById('midtrans-script')) {
      const script = document.createElement('script');
      script.id = 'midtrans-script';
      script.src = midtransScriptUrl;
      script.setAttribute('data-client-key', myClientKey);
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Ambil user aktif dari sesi Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const registeredEmail = localStorage.getItem('regEmail');

      const currentUser = user || {
        id: 'user-' + Date.now(),
        email: registeredEmail || 'owner@titikjual.com',
        user_metadata: {
          full_name: 'Owner Titik Jual',
          phone: '081234567890'
        }
      };

      // 2. Buat order_id yang unik standar
      const uniqueOrderId = `TITIKJUAL-${currentUser.id}-${Date.now()}`;

      // 3. Panggil helper transaksi Midtrans standar (tanpa filter khusus parameter pembayaran)
      const data = await createMidtransTransaction({
        order_id: uniqueOrderId,
        gross_amount: planDetails.price,
        item_details: {
          id: planDetails.key,
          name: `${planDetails.name} (${planDetails.cycle === 'yearly' ? 'Tahunan' : 'Bulanan'})`,
          price: planDetails.price,
          quantity: 1
        },
        customer: {
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
          phone: currentUser.user_metadata?.phone || '08123456789'
        }
      });

      const snapToken = data.token;

      // 4. Buka Midtrans Snap Pop-up standar
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          localStorage.setItem('paymentResult', JSON.stringify(result));
          navigate('/register-success');
        },
        onPending: function (result) {
          alert("Pembayaran tertunda. Selesaikan pembayaran Anda.");
          console.log(result);
        },
        onError: function (result) {
          alert("Pembayaran gagal! Silakan coba lagi.");
          console.log(result);
        },
        onClose: function () {
          alert('Anda menutup jendela pembayaran sebelum selesai.');
        }
      });

    } catch (err) {
      console.error('Payment Error:', err);
      alert('Gagal memproses pembayaran: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#01A684] font-sans antialiased text-[#181b2b] min-h-screen flex flex-col items-center justify-between">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between">
        
        {/* Header */}
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

        {/* Main Card */}
        <main className="w-full bg-white rounded-t-[36px] shadow-2xl px-6 pt-7 pb-10 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#181b2b] tracking-tight">Konfirmasi & Pembayaran</h1>
              <p className="text-xs text-[#86899B] mt-1.5 leading-relaxed">
                Selesaikan pembayaran langganan Anda untuk mengaktifkan sistem kasir Titik Jual.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-center mb-7 px-4">
              <div className="flex items-center w-full max-w-xs relative">
                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#01A684] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#01A684] mt-1">Isi Data</span>
                </div>
                <div className="flex-1 h-0.5 bg-[#01A684] -mt-3.5 mx-1"></div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#01A684] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#01A684] mt-1">Paket</span>
                </div>
                <div className="flex-1 h-0.5 bg-[#01A684] -mt-3.5 mx-1"></div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-7 h-7 rounded-full bg-[#01A684] text-white ring-4 ring-[#01A684]/20 flex items-center justify-center text-xs font-bold shadow-sm">
                    3
                  </div>
                  <span className="text-[10px] font-semibold text-[#01A684] mt-1">Detail</span>
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

            {/* Ringkasan Pesanan Card */}
            <div className="bg-[#F1F2F6]/60 border border-[#E9EBED] rounded-2xl p-5 mb-6 space-y-3">
              <h3 className="text-sm font-bold text-[#181b2b] border-b border-[#E9EBED] pb-2">Ringkasan Langganan</h3>
              
              <div className="flex justify-between text-xs">
                <span className="text-[#86899B]">Paket Dipilih</span>
                <span className="font-semibold text-[#181b2b]">{planDetails.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#86899B]">Periode Tagihan</span>
                <span className="font-semibold text-[#181b2b]">
                  {planDetails.cycle === 'yearly' ? 'Tahunan (Hemat 10%)' : 'Bulanan'}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-[#E9EBED]">
                <span className="font-bold text-[#181b2b]">Total Pembayaran</span>
                <span className="font-bold text-base text-[#01A684]">
                  Rp {planDetails.price.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Info Pembayaran */}
            <div className="bg-[#01A684]/10 border border-[#01A684]/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#01A684] text-xl mt-0.5">info</span>
                <p className="text-xs text-[#181b2b] leading-relaxed">
                  Pembayaran diproses secara aman menggunakan <strong>Midtrans Snap</strong>. Selesaikan transaksi untuk langsung mengaktifkan akun Anda.
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3">
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
                onClick={handlePay}
                disabled={loading}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#01A684] hover:bg-[#008769] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer border-0 disabled:opacity-50"
              >
                <span>{loading ? 'Memproses...' : 'Bayar Sekarang'}</span>
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-5 mt-3 border-t border-[#E9EBED]/60">
            <p className="text-[10px] text-[#86899B]">© 2026 Titik Jual • Solusi Pintar Manajemen Transaksi</p>
          </div>
        </main>

      </div>
    </div>
  );
}

export default RegisterPayment;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronUp, ChevronDown, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierTransaksi() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Bulan Ini');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ masuk: 0, keluar: 0, countMasuk: 0, countKeluar: 0 });

  // State Profil Kasir yang sinkron
  const [profile, setProfile] = useState({
    name: 'Fadhil Kasir',
    role: 'Kasir'
  });

  // State Manajemen Shift (Open / Close Shift)
  const [currentShift, setCurrentShift] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [closingInput, setClosingInput] = useState('');

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Ambil profil kasir dan cek status shift aktif saat komponen dimuat
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData) {
            setProfile({
              name: profileData.full_name || 'Fadhil Kasir',
              role: profileData.role || 'Kasir'
            });
          }
        }

        // Cek apakah ada shift yang sedang OPEN untuk owner ini
        const currentOwnerId = getOwnerId();
        const { data: shiftData } = await supabase
          .from('cashier_shifts')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .eq('status', 'OPEN')
          .maybeSingle();

        if (shiftData) {
          setCurrentShift(shiftData);
        }
      } catch (err) {
        console.error('Gagal memuat data awal:', err.message);
      }
    };

    fetchInitialData();
  }, []);

  // Ambil data transaksi berdasarkan filter waktu
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .order('created_at', { ascending: false });

        const now = new Date();
        if (activeFilter === 'Hari Ini') {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          query = query.gte('created_at', startOfDay);
        } else if (activeFilter === 'Bulan Ini') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          query = query.gte('created_at', startOfMonth);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          let totalMasuk = 0;
          let totalKeluar = 0;
          let countM = 0;
          let countK = 0;

          const formatted = data.map((tx, idx) => {
            const amount = Number(tx.total_pay || tx.total_amount) || 0;
            const isMasuk = (tx.type || 'Masuk') === 'Masuk';
            
            if (isMasuk) {
              totalMasuk += amount;
              countM++;
            } else {
              totalKeluar += amount;
              countK++;
            }

            return {
              id: tx.id || `TRX-${idx + 1}`,
              code: tx.invoice_no || tx.transaction_code || `CS-TRX-${String(idx + 1).padStart(4, '0')}`,
              date: tx.created_at ? tx.created_at.replace('T', ' ').substring(0, 16) : '2026-07-01 10:00',
              staff: `${tx.cashier_name || profile.name} / Staff`,
              amount: amount,
              isMasuk: isMasuk
            };
          });

          setTransactions(formatted);
          setSummary({ masuk: totalMasuk, keluar: totalKeluar, countMasuk: countM, countKeluar: countK });
        }
      } catch (err) {
        console.error('Gagal memuat transaksi kasir:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeFilter, profile.name]);

  // Fungsi Buka Shift (Open Shift)
  const handleOpenShift = async (e) => {
    e.preventDefault();
    const openingBal = Number(modalInput);
    if (isNaN(openingBal) || openingBal < 0) {
      alert('Masukkan nominal modal awal yang valid!');
      return;
    }

    try {
      const currentOwnerId = getOwnerId();
      const newShift = {
        owner_id: currentOwnerId,
        cashier_name: profile.name,
        opening_balance: openingBal,
        status: 'OPEN',
        opened_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cashier_shifts')
        .insert([newShift])
        .select()
        .single();

      if (error) throw error;

      setCurrentShift(data);
      setShowShiftModal(false);
      setModalInput('');
      alert('Shift berhasil dibuka! Laci kasir siap digunakan.');
    } catch (err) {
      alert('Gagal membuka shift: ' + err.message);
    }
  };

  // Fungsi Tutup Shift (Close Shift) dengan Rekonsiliasi Pintar
  const handleCloseShift = async (e) => {
    e.preventDefault();
    const physicalCash = Number(closingInput);
    if (isNaN(physicalCash) || physicalCash < 0) {
      alert('Masukkan jumlah uang fisik di laci dengan benar!');
      return;
    }

    // Rumus: Uang Seharusnya = Modal Awal + Total Penjualan Tunai Masuk - Pengeluaran
    const expected = Number(currentShift.opening_balance) + summary.masuk - summary.keluar;
    const difference = physicalCash - expected; // Positif = Lebih, Negatif = Kurang

    try {
      const { error } = await supabase
        .from('cashier_shifts')
        .update({
          closing_balance: physicalCash,
          expected_balance: expected,
          difference: difference,
          status: 'CLOSED',
          closed_at: new Date().toISOString(),
          notes: difference === 0 ? 'Valid (Nol Selisih)' : difference > 0 ? `Lebih Rp ${difference}` : `Kurang Rp ${Math.abs(difference)}`
        })
        .eq('id', currentShift.id);

      if (error) throw error;

      alert(`Shift ditutup!\nUang Seharusnya: Rp ${expected.toLocaleString('id-ID')}\nUang Fisik: Rp ${physicalCash.toLocaleString('id-ID')}\nSelisih: Rp ${difference.toLocaleString('id-ID')}`);
      
      setCurrentShift(null);
      setShowShiftModal(false);
      setClosingInput('');
    } catch (err) {
      alert('Gagal menutup shift: ' + err.message);
    }
  };

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');
  
  // Inisial nama untuk avatar header (Fadhil Kasir -> FK)
  const getInitials = (name) => {
    if (!name) return 'FK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[160px] lg:pb-12 lg:pl-24 lg:pr-8">
      
      {/* MainHeader (Sinkron dengan Fadhil Kasir & Inisial FK) */}
      <header className="pt-8 pb-4 px-6 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold flex-1 px-4 truncate text-center">Kasir Pro - Transaksi & Shift</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          {getInitials(profile.name)}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8 flex flex-col gap-4">
        
        {/* Shift Control Banner */}
        <div className="px-6 pt-2">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentShift ? 'bg-emerald-100 text-[#01A684]' : 'bg-amber-100 text-amber-600'}`}>
                {currentShift ? <Unlock size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-800">
                  {currentShift ? `Shift Aktif (${currentShift.cashier_name})` : 'Belum Ada Shift Aktif'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {currentShift ? `Modal Awal: Rp ${formatRp(currentShift.opening_balance)}` : 'Buka shift untuk mulai kontrol laci uang'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowShiftModal(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer shadow-xs transition-colors ${currentShift ? 'bg-red-500 hover:bg-red-600' : 'bg-[#01A684] hover:opacity-90'}`}
            >
              {currentShift ? 'Tutup Shift' : 'Buka Shift'}
            </button>
          </div>
        </div>

        {/* Modal Open/Close Shift */}
        {showShiftModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {currentShift ? 'Tutup Shift (Close Shift)' : 'Buka Shift (Open Shift)'}
              </h3>
              
              {currentShift ? (
                <form onSubmit={handleCloseShift} className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Hitung total uang tunai fisik yang ada di laci saat ini untuk menghindari selisih keuangan.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between"><span>Modal Awal:</span> <span className="font-semibold">Rp {formatRp(currentShift.opening_balance)}</span></div>
                    <div className="flex justify-between"><span>Total Masuk (Tunai):</span> <span className="font-semibold text-[#01A684]">+ Rp {formatRp(summary.masuk)}</span></div>
                    <div className="flex justify-between"><span>Total Keluar:</span> <span className="font-semibold text-red-500">- Rp {formatRp(summary.keluar)}</span></div>
                    <div className="border-t border-gray-200 pt-1 flex justify-between font-bold">
                      <span>Uang Seharusnya:</span> 
                      <span>Rp {formatRp(Number(currentShift.opening_balance) + summary.masuk - summary.keluar)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Total Uang Fisik di Laci Sekarang (Rp)</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                      placeholder="Contoh: 2500000"
                      value={closingInput}
                      onChange={(e) => setClosingInput(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowShiftModal(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0 shadow-xs"
                    >
                      Konfirmasi Tutup Shift
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOpenShift} className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Masukkan jumlah uang tunai modal awal yang tersedia di laci kasir saat ini.
                  </p>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Modal Awal Laci (Rp)</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                      placeholder="Contoh: 500000"
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowShiftModal(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0 shadow-xs"
                    >
                      Mulai Shift
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="px-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col pr-3 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Masuk</span>
                <h2 className="font-bold text-base lg:text-lg text-[#01A684] truncate">+ Rp {formatRp(summary.masuk)}</h2>
                <div className="flex items-center gap-1 mt-2 text-gray-500">
                  <ChevronUp size={12} className="text-[#01A684]" />
                  <span className="text-xs">{summary.countMasuk} Transaksi</span>
                </div>
              </div>

              <div className="flex flex-col pl-3">
                <span className="text-xs text-gray-500 block mb-1">Keluar</span>
                <h2 className="font-bold text-base lg:text-lg text-red-500 truncate">- Rp {formatRp(summary.keluar)}</h2>
                <div className="flex items-center gap-1 mt-2 text-gray-500">
                  <ChevronDown size={12} className="text-red-500" />
                  <span className="text-xs">{summary.countKeluar} Transaksi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mt-3">
            {['Bulan Ini', 'Hari Ini', 'Custom'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer border-0 transition-all ${
                  activeFilter === filter ? 'bg-[#01A684] text-white shadow-sm' : 'bg-white border border-gray-100 text-gray-500'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500">
                    <th className="p-4 font-medium">ID Transaksi</th>
                    <th className="p-4 font-medium">Tanggal &amp; Waktu</th>
                    <th className="p-4 font-medium">Kasir / Staff</th>
                    <th className="p-4 font-medium text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-xs text-gray-500">Memuat data transaksi kasir...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-xs text-gray-500">Belum ada riwayat transaksi tercatat.</td>
                    </tr>
                  ) : (
                    transactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-[#1A1A1A] font-mono text-xs font-semibold">{trx.code}</td>
                        <td className="p-4 text-gray-500 text-xs">{trx.date}</td>
                        <td className="p-4 text-[#1A1A1A] text-xs font-medium">{trx.staff}</td>
                        <td className={`p-4 text-right font-bold text-xs ${trx.isMasuk ? 'text-[#01A684]' : 'text-red-500'}`}>
                          {trx.isMasuk ? '+ ' : '- '}Rp {formatRp(trx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
              <span className="text-xs text-gray-500">Menampilkan {transactions.length} data transaksi</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#01A684] text-white text-xs font-bold border-0">1</button>
              </div>
            </div>

          </div>
        </div>

      </main>

      <CashierBottomNav />

    </div>
  );
}
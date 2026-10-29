import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronUp, ChevronDown, Lock, Unlock, ArrowDownRight, FileText } from 'lucide-react';
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

  // State Modal Pengeluaran Dadakan & Struk
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseFile, setExpenseFile] = useState(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Fungsi Format Titik Ribuan untuk Input Angka
  const formatRupiahInput = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const parseRupiahNumber = (formattedStr) => {
    if (!formattedStr) return 0;
    return Number(formattedStr.replace(/\./g, ''));
  };

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
              isMasuk: isMasuk,
              notes: tx.notes || '',
              receipt_url: tx.receipt_url || null
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
    const openingBal = parseRupiahNumber(modalInput);
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
    const physicalCash = parseRupiahNumber(closingInput);
    if (isNaN(physicalCash) || physicalCash < 0) {
      alert('Masukkan jumlah uang fisik di laci dengan benar!');
      return;
    }

    const expected = Number(currentShift.opening_balance) + summary.masuk - summary.keluar;
    const difference = physicalCash - expected;

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

  // Fungsi Kompresi Gambar Client-Side (Agar Server Ramah & Murah)
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  // Fungsi Simpan Pengeluaran Dadakan & Upload Struk
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const amountVal = parseRupiahNumber(expenseAmount);
    if (amountVal <= 0 || !expenseDesc) {
      alert('Mohon isi nominal dan keterangan pengeluaran dengan benar.');
      return;
    }

    setSubmittingExpense(true);
    try {
      const currentOwnerId = getOwnerId();
      let receiptUrl = null;

      if (expenseFile) {
        const optimizedFile = await compressImage(expenseFile);
        const fileExt = 'jpg';
        const fileName = `expense_${Date.now()}.${fileExt}`;
        const filePath = `${currentOwnerId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, optimizedFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
          receiptUrl = urlData?.publicUrl;
        }
      }

      const newExpense = {
        owner_id: currentOwnerId,
        cashier_name: profile.name,
        type: 'Keluar',
        total_amount: amountVal,
        total_pay: amountVal,
        notes: expenseDesc,
        receipt_url: receiptUrl,
        transaction_code: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('transactions')
        .insert([newExpense]);

      if (insertError) throw insertError;

      alert('Pengeluaran dadakan berhasil dicatat!');
      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseDesc('');
      setExpenseFile(null);

      window.location.reload();
    } catch (err) {
      alert('Gagal mencatat pengeluaran: ' + err.message);
    } finally {
      setSubmittingExpense(false);
    }
  };

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');
  
  const getInitials = (name) => {
    if (!name) return 'FK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[160px] lg:pb-12 lg:pl-24 lg:pr-8">
      
      {/* MainHeader */}
      <header className="pt-8 pb-4 px-6 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold flex-1 px-4 truncate text-center">Kasir Pro - Transaksi &amp; Shift</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          {getInitials(profile.name)}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8 flex flex-col gap-4">
        
        {/* Shift Control & Expense Action Banner */}
        <div className="px-6 pt-2 flex flex-col sm:flex-row gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentShift ? 'bg-emerald-100 text-[#01A684]' : 'bg-amber-100 text-amber-600'}`}>
                {currentShift ? <Unlock size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-800">
                  {currentShift ? `Shift Aktif (${currentShift.cashier_name})` : 'Belum Ada Shift Aktif'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {currentShift ? `Modal Awal: Rp ${formatRp(currentShift.opening_balance)}` : 'Buka shift untuk kontrol laci'}
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

          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <ArrowDownRight size={16} />
            Catat Beli Bahan / Pengeluaran
          </button>
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
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
                      <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                        placeholder="Contoh: 2.500.000"
                        value={closingInput}
                        onChange={(e) => setClosingInput(formatRupiahInput(e.target.value))}
                        required
                      />
                    </div>
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
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
                      <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                        placeholder="Contoh: 500.000"
                        value={modalInput}
                        onChange={(e) => setModalInput(formatRupiahInput(e.target.value))}
                        required
                      />
                    </div>
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

        {/* Modal Catat Pengeluaran Dadakan & Upload Struk */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <h3 className="text-base font-bold text-[#1A1A1A]">Catat Pengeluaran Dadakan</h3>
              <p className="text-xs text-gray-500">
                Gunakan ini jika kasir mendadak beli bahan baku atau keperluan operasional dari laci.
              </p>
              
              <form onSubmit={handleSaveExpense} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nominal Biaya (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-gray-400">Rp</span>
                    <input 
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                      placeholder="Contoh: 75.000"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(formatRupiahInput(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Keterangan (Catatan)</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-[#01A684] focus:border-[#01A684] outline-none"
                    placeholder="Contoh: Beli es batu & cabai di pasar"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Upload Bukti Struk / Nota (Opsional)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setExpenseFile(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#01A684] hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowExpenseModal(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingExpense}
                    className="flex-1 bg-[#01A684] text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-0 shadow-xs"
                  >
                    {submittingExpense ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                  </button>
                </div>
              </form>
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
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500">
                    <th className="p-4 font-medium">ID Transaksi</th>
                    <th className="p-4 font-medium">Tanggal &amp; Waktu</th>
                    <th className="p-4 font-medium">Kasir / Keterangan</th>
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
                        <td className="p-4 text-[#1A1A1A] font-mono text-xs font-semibold">
                          {trx.code}
                          {trx.receipt_url && (
                            <a href={trx.receipt_url} target="_blank" rel="noreferrer" className="block text-[10px] text-[#01A684] hover:underline flex items-center gap-0.5 mt-0.5">
                              <FileText size={10} /> Lihat Struk
                            </a>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{trx.date}</td>
                        <td className="p-4 text-[#1A1A1A] text-xs font-medium">
                          {trx.staff}
                          {trx.notes && <span className="block text-[11px] text-gray-400 mt-0.5">{trx.notes}</span>}
                        </td>
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
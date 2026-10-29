import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CashierPesanan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Menerima data keranjang & subtotal dari halaman dashboard kasir
  const { cart = [], subtotal = 0 } = location.state || {};

  const [ownerId, setOwnerId] = useState('toko_123');
  const [cashierName, setCashierName] = useState('Fadhil Kasir');

  // State Detail Transaksi
  const [invoiceNo] = useState(`#ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
  const [currentDate] = useState(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [orderType, setOrderType] = useState('Makan di Tempat');
  const [tableNo, setTableNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [staffHelper, setStaffHelper] = useState('');

  // State Member & Pendaftaran Member Baru
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [savingMember, setSavingMember] = useState(false);

  // State Diskon dari Database
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null); // Menyimpan objek diskon yang dipilih

  // State Modal Struk
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Ambil data sesi, member, dan diskon aktif dari Supabase
  useEffect(() => {
    const fetchSessionDataAndConfig = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerId = 'toko_123';
        let currentCashier = 'Fadhil Kasir';

        if (session && session.user) {
          currentOwnerId = session.user.user_metadata?.owner_id || localStorage.getItem('owner_id') || session.user.id;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData && profileData.full_name) {
            currentCashier = profileData.full_name;
          } else {
            currentCashier = session.user.user_metadata?.full_name || 'Fadhil Kasir';
          }
        } else {
          currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
        }
        setOwnerId(currentOwnerId);
        setCashierName(currentCashier);

        // Ambil data member
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('owner_id', currentOwnerId);

        if (!memberError && memberData) {
          setMembers(memberData);
        }

        // Ambil data diskon aktif
        const { data: discountData, error: discountError } = await supabase
          .from('discounts')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .eq('status', 'aktif');

        if (!discountError && discountData) {
          setAvailableDiscounts(discountData);
        }
      } catch (err) {
        console.error('Gagal memuat data konfigurasi pesanan:', err);
      }
    };

    fetchSessionDataAndConfig();
  }, []);

  // Fungsi Pendaftaran Member Baru
  const handleRegisterMember = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) {
      alert('Nama dan No. Telepon wajib diisi!');
      return;
    }

    setSavingMember(true);
    try {
      const newMemberPayload = {
        owner_id: ownerId,
        nama: newMemberName,
        phone: newMemberPhone,
        poin: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('members')
        .insert([newMemberPayload])
        .select()
        .single();

      if (error) throw error;

      alert('Member baru berhasil didaftarkan!');
      setMembers((prev) => [...prev, data]);
      setSelectedMember(data);
      setSearchMember(data.nama);
      setIsAddMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberPhone('');
    } catch (err) {
      console.error('Gagal mendaftarkan member:', err);
      alert('Gagal mendaftarkan member: ' + err.message);
    } finally {
      setSavingMember(false);
    }
  };

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

  // Kalkulasi Finansial & Diskon Dinamis
  const tax = subtotal * 0.11; // Pajak 11%

  // Hitung besaran diskon berdasarkan pilihan kasir
  let calculatedDiscount = 0;
  if (selectedDiscount) {
    if (selectedDiscount.tipe === 'persen') {
      calculatedDiscount = (subtotal * Number(selectedDiscount.nilai)) / 100;
    } else {
      calculatedDiscount = Number(selectedDiscount.nilai) || 0;
    }
  }

  const totalPay = Math.max(0, subtotal + tax - calculatedDiscount);
  const amountPaid = parseRupiahNumber(amountPaidInput);
  const changeAmount = amountPaid >= totalPay ? amountPaid - totalPay : 0;

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  // Simpan Transaksi ke Supabase saat tombol proses ditekan
  const handleProcessPayment = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }
    if (paymentMethod === 'Cash' && amountPaid < totalPay) {
      alert('Uang yang dibayarkan kurang dari total pembayaran!');
      return;
    }

    setLoadingCheckout(true);
    try {
      const { error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            owner_id: ownerId,
            invoice_no: invoiceNo,
            cashier_name: cashierName,
            member_name: selectedMember ? selectedMember.nama : 'Umum',
            order_type: orderType,
            table_no: tableNo || '-',
            payment_method: paymentMethod,
            subtotal: subtotal,
            tax: tax,
            discount: calculatedDiscount,
            total_pay: totalPay,
            amount_paid: amountPaid,
            change_amount: changeAmount,
            staff_helper: staffHelper || '-',
            type: 'Masuk',
            created_at: new Date().toISOString()
          }
        ]);

      if (txError) throw txError;

      setIsProcessModalOpen(true);
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      setIsProcessModalOpen(true);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handlePrintProcess = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsProcessModalOpen(false);
      setIsReceiptModalOpen(true);
    }, 1500);
  };

  const handleFinishAll = () => {
    localStorage.removeItem('cashier_cart');
    navigate('/kasir');
  };

  // Filter member berdasarkan pencarian
  const filteredMembers = members.filter(m => 
    m.nama?.toLowerCase().includes(searchMember.toLowerCase()) || 
    m.phone?.includes(searchMember)
  );

  return (
    <div className="bg-[#F1F2F6] text-[#181b2b] font-sans antialiased min-h-screen relative pb-32">
      
      {/* TopAppBar */}
      <header className="flex items-center px-4 h-16 w-full fixed top-0 z-50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95 duration-150 group cursor-pointer border-0 bg-transparent"
        >
          <span className="material-symbols-outlined text-[#006b54] group-hover:text-[#01a684]">arrow_back</span>
        </button>
        <h1 className="ml-2 font-semibold text-lg text-[#006b54]">
          Konfirmasi Pesanan
        </h1>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 px-4 md:px-6 max-w-3xl mx-auto flex flex-col gap-4">
        
        {/* Order Info Card */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex justify-between items-center gap-2 flex-col">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-xs text-[#86899B] uppercase tracking-wider font-medium">No. Invoice</span>
              <span className="text-sm font-bold text-[#181b2b] mt-1 tabular-nums">{invoiceNo}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Tanggal</span>
              <span className="text-sm text-[#181b2b] mt-1">{currentDate}</span>
            </div>
          </div>
          
          <div className="w-full border-t border-[#E9EBED] my-4"></div>
          
          <div className="flex flex-col gap-2 w-full">
            <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Tipe Pesanan</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Makan di Tempat', 'Take Away', 'Kirim'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer border ${
                    orderType === type 
                      ? 'bg-[#01a684] text-white shadow-sm border-transparent' 
                      : 'bg-transparent border-[#E9EBED] text-[#3d4a44] hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Member Card dengan Tombol Tambah (+) */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Pesanan Atas Nama</h2>
            
            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-[#F1F2F6] rounded-lg px-3 py-1.5 border border-[#E9EBED]">
                <span className="material-symbols-outlined text-[18px] text-[#006b54] mr-2">person_search</span>
                <input 
                  className="bg-transparent border-none p-0 text-xs focus:ring-0 w-32 md:w-40 text-[#181b2b] placeholder:text-[#86899B] outline-none" 
                  placeholder="Cari member..." 
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  type="text" 
                />
              </div>

              {/* Tombol Plus (+) untuk Pendaftaran Member Baru */}
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="w-9 h-9 bg-[#01a684] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0 shadow-sm"
                title="Daftar Member Baru"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <input 
              className="w-full bg-[#F1F2F6] border-none rounded-xl h-14 px-4 text-base font-semibold text-[#181b2b] outline-none" 
              placeholder="Pelanggan Umum / Pilih member di atas..." 
              type="text" 
              value={selectedMember ? selectedMember.nama : (searchMember || 'Pelanggan Umum')}
              readOnly
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#86899B] text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#df7362]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                {selectedMember ? (selectedMember.poin || 0) : 0} Poin
              </div>
              <div className="bg-[#01a684]/10 text-[#01a684] px-2 py-1 rounded text-xs font-medium border border-[#01a684]/20">
                {selectedMember ? 'Member' : 'Umum'}
              </div>
            </div>
          </div>

          {/* Dropdown hasil pencarian member jika mengetik di searchMember */}
          {searchMember && !selectedMember && (
            <div className="bg-white border border-[#E9EBED] rounded-xl shadow-md max-h-40 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 text-center">Member tidak ditemukan. Klik tombol (+) untuk mendaftar.</div>
              ) : (
                filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setSearchMember('');
                    }}
                    className="p-3 hover:bg-emerald-50 cursor-pointer text-xs flex justify-between items-center border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-semibold">{m.nama}</span>
                    <span className="text-gray-400">{m.phone || '-'}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Modal Pendaftaran Member Baru */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[#181b2b]">Daftar Member Baru</h3>
                <button onClick={() => setIsAddMemberModalOpen(false)} className="text-gray-400 hover:text-gray-600 border-0 bg-transparent cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleRegisterMember} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1 font-medium">Nama Lengkap</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#01a684]"
                    placeholder="Cth: Siti Aminah"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1 font-medium">No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#01a684]"
                    placeholder="Cth: 08123456789"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="flex-1 bg-[#01a684] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 shadow-sm"
                  >
                    {savingMember ? 'Menyimpan...' : 'Simpan Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex flex-col gap-4">
          <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium mb-2">Detail Pesanan</h2>
          <ul className="flex flex-col">
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center py-3 border-b border-[#E9EBED] last:border-b-0 last:pb-0 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#181b2b] bg-[#ececff] px-2 py-0.5 rounded tabular-nums">{item.qty}x</span>
                    <span className="text-sm text-[#181b2b]">{item.cartItemName || item.name}</span>
                  </div>
                  <span className="text-sm text-[#181b2b] tabular-nums">Rp {formatRp(item.price * item.qty)}</span>
                </li>
              ))
            ) : (
              <li className="text-center text-xs text-gray-400 py-4">Tidak ada item dalam keranjang.</li>
            )}
          </ul>
        </section>

        {/* Billing Summary Card & Pilihan Diskon */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex flex-col gap-4">
          
          {/* Bagian Pilihan Diskon */}
          <div className="flex flex-col gap-2 pb-3 border-b border-[#E9EBED]">
            <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Pilih Kupon / Diskon (Opsional)</h2>
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#181b2b] outline-none focus:border-[#01a684] cursor-pointer"
              value={selectedDiscount ? selectedDiscount.id : ''}
              onChange={(e) => {
                const found = availableDiscounts.find(d => d.id === e.target.value);
                setSelectedDiscount(found || null);
              }}
            >
              <option value="">-- Tanpa Diskon / Promo --</option>
              {availableDiscounts.map((disc) => (
                <option key={disc.id} value={disc.id}>
                  {disc.nama} ({disc.kode}) - {disc.tipe === 'persen' ? `${disc.nilai}%` : `Rp ${formatRp(disc.nilai)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#86899B]">Subtotal</span>
              <span className="text-sm text-[#181b2b] tabular-nums">Rp {formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#86899B]">Pajak (11%)</span>
              <span className="text-sm text-[#181b2b] tabular-nums">Rp {formatRp(tax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#df7362]">Diskon {selectedDiscount ? `(${selectedDiscount.kode})` : ''}</span>
              <span className="text-sm text-[#df7362] tabular-nums">- Rp {formatRp(calculatedDiscount)}</span>
            </div>
          </div>
          
          <div className="w-full border-t border-dashed border-[#bccac3] my-1"></div>
          
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-[#181b2b]">Total Bayar</span>
            <span className="text-2xl font-bold text-[#01a684] tabular-nums">Rp {formatRp(totalPay)}</span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Metode Pembayaran</h2>
            <div className="grid gap-2 grid-cols-2">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`flex flex-col items-center justify-center gap-1 p-4 border rounded-xl transition-colors active:scale-95 cursor-pointer ${
                  paymentMethod === 'Cash' ? 'bg-[#01a684]/10 border-[#01a684]/30' : 'bg-white border-[#E9EBED] hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-[#006b54]">payments</span>
                <span className="text-xs font-medium text-[#181b2b]">Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex flex-col items-center justify-center gap-1 p-4 border rounded-xl transition-colors active:scale-95 cursor-pointer ${
                  paymentMethod === 'QRIS' ? 'bg-[#01a684]/10 border-[#01a684]/30' : 'bg-white border-[#E9EBED] hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-[#006b54]">qr_code_2</span>
                <span className="text-xs font-medium text-[#181b2b]">QRIS</span>
              </button>
            </div>

            {/* Input Uang Dibayarkan khusus Cash */}
            {paymentMethod === 'Cash' && (
              <div className="mt-2 p-4 bg-[#f3f2ff] rounded-xl border border-[#01a684]/20 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Uang Dibayarkan</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 tabular-nums text-[#3d4a44]">Rp</span>
                    <input 
                      className="w-full bg-white border border-[#E9EBED] rounded-lg h-12 pl-12 pr-4 text-base font-semibold text-[#181b2b] outline-none" 
                      type="text" 
                      placeholder="Contoh: 100.000"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(formatRupiahInput(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#E9EBED]">
                  <span className="text-sm text-[#86899B]">Kembalian</span>
                  <span className="text-lg font-bold text-[#006b54] tabular-nums">Rp {formatRp(changeAmount)}</span>
                </div>
              </div>
            )}

            {/* Catatan Meja */}
            <div className="mt-2 p-4 bg-[#f3f2ff] rounded-xl border border-[#01a684]/20 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Catatan Meja</h2>
                  <div className="relative flex items-center bg-white rounded-lg px-3 py-1 border border-[#E9EBED]">
                    <span className="material-symbols-outlined text-[18px] text-[#006b54] mr-2">table_restaurant</span>
                    <span className="text-xs text-[#181b2b]">Nomor Meja</span>
                  </div>
                </div>
                <input 
                  className="w-full bg-white border border-[#E9EBED] rounded-lg h-12 px-4 text-sm text-[#181b2b] placeholder:text-[#86899B] outline-none" 
                  placeholder="Contoh: Meja 14 atau Area Jendela" 
                  type="text"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                />
              </div>
            </div>

            {/* Staf Pembantu (Helper) */}
            <div className="mt-2 p-4 bg-[#f3f2ff] rounded-xl border border-[#01a684]/20 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Staf Pembantu (Helper)</h2>
                  <div className="relative flex items-center bg-white rounded-lg px-3 py-1 border border-[#E9EBED]">
                    <span className="material-symbols-outlined text-[18px] text-[#006b54] mr-2">badge</span>
                    <span className="text-xs text-[#181b2b]">Pilih Staf</span>
                  </div>
                </div>
                <input 
                  className="w-full bg-white border border-[#E9EBED] rounded-lg h-12 px-4 text-sm text-[#181b2b] placeholder:text-[#86899B] outline-none" 
                  placeholder="Cari atau pilih nama staf..." 
                  type="text"
                  value={staffHelper}
                  onChange={(e) => setStaffHelper(e.target.value)}
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-[#E9EBED] z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto">
          <button 
            disabled={loadingCheckout}
            className="w-full bg-[#01a684] hover:bg-[#01a684]/90 text-white h-14 rounded-full text-lg font-semibold flex items-center justify-center transition-all active:scale-[0.98] shadow-md shadow-[#01a684]/20 cursor-pointer border-0" 
            onClick={handleProcessPayment}
          >
            {loadingCheckout ? 'Memproses...' : 'Proses Pembayaran'}
          </button>
        </div>
      </div>

      {/* Order Process Modal (Struk Dapur) */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#181b2b]">Struk Proses Pesanan</h3>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer border-0 bg-transparent" onClick={() => setIsProcessModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#f3f2ff]">
              <div className="bg-white p-6 shadow-sm border border-[#E9EBED] rounded-lg flex flex-col gap-4 text-center">
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-lg text-[#181b2b]">Struk Pesanan Dapur</h4>
                  <p className="text-xs text-[#86899B]">No. Invoice: {invoiceNo}</p>
                  <p className="text-xs text-[#86899B]">Waktu: {currentDate}</p>
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-2 text-left">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-bold">
                      <span>{item.qty}x {item.cartItemName || item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-1 text-left text-xs">
                  <div className="flex justify-between"><span className="text-[#86899B]">Tipe</span><span className="font-bold">{orderType}</span></div>
                  <div className="flex justify-between"><span className="text-[#86899B]">Member</span><span>{selectedMember ? selectedMember.nama : 'Umum'}</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E9EBED] flex flex-col gap-2">
              <button 
                id="btn-cetak-proses"
                disabled={isPrinting}
                className="w-full bg-[#01a684] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border-0" 
                onClick={handlePrintProcess}
              >
                <span className={`material-symbols-outlined ${isPrinting ? 'animate-spin' : ''}`}>
                  {isPrinting ? 'refresh' : 'print'}
                </span>
                {isPrinting ? 'Mencetak...' : 'Cetak'}
              </button>
              <button 
                className="w-full border border-[#01a684] text-[#01a684] h-12 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer bg-transparent" 
                onClick={() => { setIsProcessModalOpen(false); setIsReceiptModalOpen(true); }}
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal (Struk Pembelian Utama) */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#E9EBED] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#181b2b]">Struk Pembelian</h3>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer border-0 bg-transparent" onClick={() => setIsReceiptModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#f3f2ff]">
              <div className="bg-white p-6 shadow-sm border border-[#E9EBED] rounded-lg flex flex-col gap-4 text-center">
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-lg text-[#181b2b]">Fadhil Kasir Outlet</h4>
                  <p className="text-xs text-[#86899B]">Sistem Point of Sale Profesional</p>
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-2 text-left">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.qty}x {item.cartItemName || item.name}</span>
                      <span className="tabular-nums">Rp {formatRp(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex justify-between text-sm"><span className="text-[#86899B]">Subtotal</span><span className="tabular-nums">Rp {formatRp(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#86899B]">Pajak (11%)</span><span className="tabular-nums">Rp {formatRp(tax)}</span></div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-[#df7362]">
                      <span>Diskon ({selectedDiscount?.kode})</span>
                      <span className="tabular-nums">- Rp {formatRp(calculatedDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-1"><span>Total</span><span className="text-[#01a684] tabular-nums">Rp {formatRp(totalPay)}</span></div>
                </div>
                <div className="border-t border-[#E9EBED] my-2"></div>
                <div className="flex flex-col gap-1 text-left text-xs">
                  <div className="flex justify-between"><span className="text-[#86899B]">Metode</span><span>{paymentMethod}</span></div>
                  {paymentMethod === 'Cash' && (
                    <>
                      <div className="flex justify-between"><span className="text-[#86899B]">Bayar</span><span className="tabular-nums">Rp {amountPaidInput}</span></div>
                      <div className="flex justify-between font-bold"><span className="text-[#86899B]">Kembali</span><span className="text-[#006b54] tabular-nums">Rp {formatRp(changeAmount)}</span></div>
                    </>
                  )}
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs italic">Terima kasih atas kunjungan Anda!</p>
                  <p className="text-[10px] text-[#86899B] uppercase tracking-widest">Powered by Fadhil Kasir</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E9EBED] flex flex-col gap-2">
              <button 
                onClick={handleFinishAll}
                className="w-full bg-[#01a684] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer border-0"
              >
                <span className="material-symbols-outlined">print</span>
                Cetak Struk & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
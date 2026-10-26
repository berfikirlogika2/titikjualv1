import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CashierPesanan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Menerima data keranjang & subtotal dari halaman dashboard kasir
  const { cart = [], subtotal = 0 } = location.state || {};

  const [ownerId, setOwnerId] = useState('toko_123');
  const [cashierName, setCashierName] = useState('Dewi Lestari');

  // State Detail Transaksi
  const [invoiceNo] = useState(`#ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
  const [currentDate] = useState('31 Okt 2023'); // Bisa disesuaikan dengan new Date().toLocaleDateString()
  const [orderType, setOrderType] = useState('Makan di Tempat');
  const [tableNo, setTableNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaidInput, setAmountPaidInput] = useState('100.000');
  const [staffHelper, setStaffHelper] = useState('');

  // State Member
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState('Budi Santoso');
  const [selectedMember, setSelectedMember] = useState({ nama: 'Budi Santoso', poin: 1250 });

  // State Modal Struk
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Ambil data sesi & member dari Supabase
  useEffect(() => {
    const fetchSessionAndMembers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerId = 'toko_123';
        let currentCashier = 'Dewi Lestari';

        if (session && session.user) {
          currentCashier = session.user.user_metadata?.full_name || session.user.email || 'Kasir';
          currentOwnerId = session.user.user_metadata?.owner_id || localStorage.getItem('owner_id') || session.user.id;
        } else {
          currentOwnerId = localStorage.getItem('owner_id') || 'toko_123';
        }
        setOwnerId(currentOwnerId);
        setCashierName(currentCashier);

        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('owner_id', currentOwnerId);

        if (!error && data) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Gagal memuat data member:', err);
      }
    };

    fetchSessionAndMembers();
  }, []);

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

  // Kalkulasi Finansial
  const tax = subtotal * 0.11; // Pajak 11%
  const discount = 5000; // Contoh diskon statis/dinamis
  const totalPay = subtotal + tax - discount;
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
            discount: discount,
            total_pay: totalPay,
            amount_paid: amountPaid,
            change_amount: changeAmount,
            staff_helper: staffHelper || '-',
            created_at: new Date().toISOString()
          }
        ]);

      if (txError) throw txError;

      setIsProcessModalOpen(true);
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      // Tetap buka modal meskipun tabel belum siap secara lokal untuk keperluan preview UI
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

        {/* Member Card */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs text-[#86899B] uppercase tracking-wider font-medium">Pesanan Atas Nama</h2>
            <div className="relative flex items-center bg-[#F1F2F6] rounded-lg px-3 py-1.5 border border-[#E9EBED]">
              <span className="material-symbols-outlined text-[18px] text-[#006b54] mr-2">person_search</span>
              <input 
                className="bg-transparent border-none p-0 text-xs focus:ring-0 w-32 md:w-48 text-[#181b2b] placeholder:text-[#86899B] outline-none" 
                placeholder="Cari member..." 
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                type="text" 
              />
            </div>
          </div>
          <div className="relative">
            <input 
              className="w-full bg-[#F1F2F6] border-none rounded-xl h-14 px-4 text-base font-semibold text-[#181b2b] outline-none" 
              placeholder="Input manual atau cari member..." 
              type="text" 
              value={selectedMember ? selectedMember.nama : searchMember}
              onChange={(e) => setSelectedMember({ nama: e.target.value, poin: 0 })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#86899B] text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#df7362]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                {selectedMember ? selectedMember.poin : 0} Poin
              </div>
              <div className="bg-[#01a684]/10 text-[#01a684] px-2 py-1 rounded text-xs font-medium border border-[#01a684]/20">
                Member
              </div>
            </div>
          </div>
        </section>

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
              // Default fallback item jika diakses langsung tanpa lewat POS
              <>
                <li className="flex justify-between items-center py-3 border-b border-[#E9EBED]">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#181b2b] bg-[#ececff] px-2 py-0.5 rounded tabular-nums">2x</span>
                    <span className="text-sm text-[#181b2b]">Tasty Snacks</span>
                  </div>
                  <span className="text-sm text-[#181b2b] tabular-nums">Rp 15.000</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-[#E9EBED]">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#181b2b] bg-[#ececff] px-2 py-0.5 rounded tabular-nums">1x</span>
                    <span className="text-sm text-[#181b2b]">Fish and Chips</span>
                  </div>
                  <span className="text-sm text-[#181b2b] tabular-nums">Rp 12.500</span>
                </li>
                <li className="flex justify-between items-center py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-[#181b2b] bg-[#ececff] px-2 py-0.5 rounded tabular-nums">1x</span>
                    <span className="text-sm text-[#181b2b]">Iced Matcha Latte</span>
                  </div>
                  <span className="text-sm text-[#181b2b] tabular-nums">Rp 35.000</span>
                </li>
              </>
            )}
          </ul>
        </section>

        {/* Billing Summary Card */}
        <section className="bg-white rounded-xl border border-[#E9EBED] p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#86899B]">Subtotal</span>
              <span className="text-sm text-[#181b2b] tabular-nums">Rp {formatRp(subtotal || 62500)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#86899B]">Pajak (11%)</span>
              <span className="text-sm text-[#181b2b] tabular-nums">Rp {formatRp(tax || 6875)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#df7362]">Diskon</span>
              <span className="text-sm text-[#df7362] tabular-nums">- Rp {formatRp(discount)}</span>
            </div>
          </div>
          
          <div className="w-full border-t border-dashed border-[#bccac3] my-1"></div>
          
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-[#181b2b]">Total Bayar</span>
            <span className="text-2xl font-bold text-[#01a684] tabular-nums">Rp {formatRp(totalPay || 64375)}</span>
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
                  <div className="flex justify-between text-sm font-bold"><span>2x Tasty Snacks</span></div>
                  <div className="flex justify-between text-sm font-bold"><span>1x Fish and Chips</span></div>
                  <div className="flex justify-between text-sm font-bold"><span>1x Iced Matcha Latte</span></div>
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
                  <h4 className="font-bold text-lg text-[#181b2b]">Warung Kopi Sejahtera</h4>
                  <p className="text-xs text-[#86899B]">Jl. Melati No. 123, Jakarta Selatan</p>
                  <p className="text-xs text-[#86899B]">Telp: 0812-3456-7890</p>
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-2 text-left">
                  <div className="flex justify-between text-sm"><span>2x Tasty Snacks</span><span className="tabular-nums">Rp 15.000</span></div>
                  <div className="flex justify-between text-sm"><span>1x Fish and Chips</span><span className="tabular-nums">Rp 12.500</span></div>
                  <div className="flex justify-between text-sm"><span>1x Iced Matcha Latte</span><span className="tabular-nums">Rp 35.000</span></div>
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex justify-between text-sm"><span className="text-[#86899B]">Subtotal</span><span className="tabular-nums">Rp {formatRp(subtotal || 62500)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#86899B]">Pajak (11%)</span><span className="tabular-nums">Rp {formatRp(tax || 6875)}</span></div>
                  <div className="flex justify-between font-bold text-lg mt-1"><span>Total</span><span className="text-[#01a684] tabular-nums">Rp {formatRp(totalPay || 69375)}</span></div>
                </div>
                <div className="border-t border-[#E9EBED] my-2"></div>
                <div className="flex flex-col gap-1 text-left text-xs">
                  <div className="flex justify-between"><span className="text-[#86899B]">Metode</span><span>{paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-[#86899B]">Bayar</span><span className="tabular-nums">Rp {amountPaidInput}</span></div>
                  <div className="flex justify-between font-bold"><span className="text-[#86899B]">Kembali</span><span className="text-[#006b54] tabular-nums">Rp {formatRp(changeAmount)}</span></div>
                </div>
                <div className="border-t border-dashed border-[#bccac3] my-2"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs italic">Terima kasih atas kunjungan Anda!</p>
                  <p className="text-[10px] text-[#86899B] uppercase tracking-widest">Powered by Kasir Pro</p>
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
              <a 
                className="w-full border border-[#01a684] text-[#01a684] h-12 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-decoration-none" 
                href={`https://wa.me/6281234567890?text=Terima%20kasih%20telah%20berbelanja%20di%20Warung%20Kopi%20Sejahtera.%20Total%20belanja%20Anda%20adalah%20Rp%20${formatRp(totalPay)}.`} 
                target="_blank" 
                rel="noreferrer"
              >
                <span className="material-symbols-outlined">chat</span>
                Kirim via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
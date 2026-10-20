import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function CashierPesanan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [], subtotal = 0 } = location.state || {};

  const tax = subtotal * 0.11;
  const discount = 5000;
  const finalTotal = subtotal + tax - discount > 0 ? subtotal + tax - discount : 0;

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashPaid, setCashPaid] = useState('100.000');
  const [orderType, setOrderType] = useState('Makan di Tempat');
  const [customerName, setCustomerName] = useState('Budi Santoso');
  const [tableNote, setTableNote] = useState('');
  
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const numericCashPaid = Number(cashPaid.replace(/\./g, '')) || 0;
  const changeMoney = numericCashPaid - finalTotal > 0 ? numericCashPaid - finalTotal : 0;

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

  const handleProcessOrder = () => {
    setIsProcessModalOpen(true);
  };

  const handlePrintProcess = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsProcessModalOpen(false);
      setIsReceiptModalOpen(true);
    }, 1500);
  };

  const handleCompleteTransaction = async () => {
    try {
      await supabase.from('transactions').insert([
        {
          order_id: `#ORD-${Date.now()}`,
          total_amount: finalTotal,
          payment_method: paymentMethod,
          payment_status: 'success'
        }
      ]);
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
    navigate('/kasir');
  };

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen relative pb-32">
      {/* Top App Bar */}
      <header className="flex items-center px-4 h-16 w-full fixed top-0 z-50 bg-white shadow-xs">
        <button 
          onClick={() => navigate('/kasir')}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <span className="material-symbols-outlined text-[#01A684]">arrow_back</span>
        </button>
        <h1 className="ml-2 font-bold text-lg text-[#01A684]">Konfirmasi Pesanan</h1>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-3xl mx-auto flex flex-col gap-4">
        
        {/* Order Info Card */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">No. Invoice</span>
              <span className="text-sm font-bold text-gray-900 mt-1">#ORD-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tanggal</span>
              <span className="text-sm text-gray-900 mt-1">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="w-full border-t border-gray-100 my-2"></div>

          <div className="flex flex-col gap-2 w-full">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tipe Pesanan</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Makan di Tempat', 'Take Away', 'Kirim'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                    orderType === type 
                      ? 'bg-[#01A684] text-white border-transparent shadow-sm' 
                      : 'bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Member Card */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pesanan Atas Nama</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl h-12 px-4 text-sm font-bold text-gray-900 outline-none focus:border-[#01A684]"
              placeholder="Cari atau masukkan nama member..."
            />
          </div>
        </section>

        {/* Order Details Card */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Detail Pesanan</h2>
          <ul className="flex flex-col divide-y divide-gray-100">
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Tidak ada item di keranjang.</p>
            ) : (
              cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold bg-gray-100 px-2.5 py-1 rounded text-xs">{item.qty}x</span>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">Rp {formatRp(item.price * item.qty)}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Billing Summary Card */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">Rp {formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Pajak (11%)</span>
              <span className="font-semibold text-gray-900">Rp {formatRp(tax)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-red-500">
              <span>Diskon</span>
              <span className="font-semibold">- Rp {formatRp(discount)}</span>
            </div>
          </div>

          <div className="w-full border-t border-dashed border-gray-200 my-1"></div>

          <div className="flex justify-between items-end">
            <span className="text-base font-bold text-gray-900">Total Bayar</span>
            <span className="text-2xl font-extrabold text-[#01A684]">Rp {formatRp(finalTotal)}</span>
          </div>

          {/* Metode Pembayaran */}
          <div className="flex flex-col gap-2 mt-3">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Cash', 'QRIS'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center justify-center gap-1 p-3 border rounded-xl transition-colors cursor-pointer ${
                    paymentMethod === method ? 'bg-emerald-50 border-[#01A684] text-[#01A684]' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="font-bold text-xs">{method}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'Cash' && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Uang Dibayarkan</label>
                <input
                  type="text"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg h-12 px-4 text-sm font-bold text-gray-900 outline-none focus:border-[#01A684]"
                />
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                  <span className="text-gray-500">Kembalian</span>
                  <span className="font-bold text-[#01A684]">Rp {formatRp(changeMoney)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Catatan Meja */}
          <div className="mt-3 flex flex-col gap-2">
            <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Catatan Meja</h2>
            <input
              type="text"
              placeholder="Contoh: Meja 14 atau Area Jendela"
              value={tableNote}
              onChange={(e) => setTableNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg h-12 px-4 text-sm outline-none focus:border-[#01A684]"
            />
          </div>
        </section>

      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleProcessOrder}
            className="w-full bg-[#01A684] hover:bg-[#019273] text-white h-14 rounded-full font-bold text-base flex items-center justify-center transition-all cursor-pointer border-0 shadow-md"
          >
            Proses Pembayaran
          </button>
        </div>
      </div>

      {/* Order Process Modal */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-base">Struk Proses Pesanan</h3>
              <button onClick={() => setIsProcessModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer border-0 bg-transparent">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 text-center">
              <div className="bg-white p-6 shadow-xs border border-gray-200 rounded-lg flex flex-col gap-3 text-center">
                <h4 className="font-bold text-base">Struk Pesanan Dapur</h4>
                <p className="text-xs text-gray-400">No. Invoice: #ORD-{Date.now().toString().slice(-8)}</p>
                <div className="border-t border-dashed border-gray-200 my-2"></div>
                <div className="flex flex-col gap-2 text-left">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-semibold">
                      <span>{item.qty}x {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
              <button
                disabled={isPrinting}
                onClick={handlePrintProcess}
                className="w-full bg-[#01A684] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {isPrinting ? 'Mencetak...' : 'Cetak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-base">Struk Pembelian Selesai</h3>
              <button onClick={handleCompleteTransaction} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer border-0 bg-transparent">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 text-center">
              <div className="bg-white p-6 shadow-xs border border-gray-200 rounded-lg flex flex-col gap-3 text-center">
                <h4 className="font-bold text-base">Warung Kopi Sejahtera</h4>
                <p className="text-xs text-gray-400">Terima kasih atas kunjungan Anda!</p>
                <div className="border-t border-dashed border-gray-200 my-2"></div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Total Final</span>
                  <span className="text-[#01A684]">Rp {formatRp(finalTotal)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleCompleteTransaction}
                className="w-full bg-[#01A684] text-white h-12 rounded-xl font-bold cursor-pointer border-0"
              >
                Selesai & Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
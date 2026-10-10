import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function OwnerSemuaTransaksi() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Semua');
  
  // State Data dari Supabase / Simulasi
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Jika sesi belum ada, gunakan data dummy/simulasi agar tidak terlempar ke login
        if (!session) {
          console.warn('Sesi Supabase belum aktif. Menggunakan data simulasi transaksi.');
          setTransactions([
            { id: 'TRX-OWN-001', date: '2026-07-30 14:30', type: 'Keluar', description: 'Prive Owner', productDetails: '-', amount: 10000000, tax: 0, service: 0, method: 'TRANSFER', ownerId: 'owner-sample-id', accountName: 'Owner Utama', role: 'owner', helper: '-', receiptUrl: null },
            { id: 'TRX-KSR-002', date: '2026-07-30 11:29', type: 'Masuk', description: 'Penjualan POS', productDetails: '4x Iced Aren Latte', amount: 140000, tax: 14000, service: 7000, method: 'QRIS', ownerId: 'owner-sample-id', accountName: 'Nadia', role: 'kasir', helper: 'Siska', receiptUrl: null },
            { id: 'TRX-ADM-003', date: '2026-07-29 09:15', type: 'Keluar', description: 'Pembelian Stok Kopi', productDetails: 'Bahan Baku', amount: 2000000, tax: 0, service: 0, method: 'TUNAI', ownerId: 'owner-sample-id', accountName: 'Dimas', role: 'admin', helper: 'Tomi', receiptUrl: null },
          ]);
          setLoading(false);
          return;
        }

        const user = session.user;

        let query = supabase
          .from('transactions')
          .select('*, transaction_items(*)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        const formattedData = (data || []).map((tx) => {
          let prefix = 'TRX-OWN';
          const role = tx.role || 'owner';
          if (role === 'cashier' || role === 'kasir') prefix = 'TRX-KSR';
          else if (role === 'admin') prefix = 'TRX-ADM';

          const shortId = tx.order_id ? tx.order_id.slice(-6).toUpperCase() : Math.floor(1000 + Math.random() * 9000);

          return {
            id: `${prefix}-${shortId}`,
            date: tx.created_at ? tx.created_at.replace('T', ' ').substring(0, 16) : '-',
            type: tx.type || 'Masuk',
            description: tx.description || 'Transaksi POS / Operasional',
            productDetails: tx.transaction_items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ') || 'Penjualan Retail',
            amount: Number(tx.total_amount) || 0,
            tax: Number(tx.tax) || 0,
            service: Number(tx.service) || 0,
            method: tx.payment_method ? tx.payment_method.toUpperCase() : 'TUNAI',
            ownerId: tx.owner_id,
            accountName: tx.actor_name || 'Owner Utama',
            role: role,
            helper: tx.helper_name || '-',
            receiptUrl: tx.receipt_url || null,
          };
        });

        setTransactions(formattedData);
      } catch (err) {
        console.error('Gagal memuat semua transaksi:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [navigate]);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'Owner') return tx.role === 'owner';
    if (activeFilter === 'Kasir') return tx.role === 'cashier' || tx.role === 'kasir';
    if (activeFilter === 'Admin') return tx.role === 'admin';
    return true;
  });

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] font-sans antialiased pb-24 pt-16">
      
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-white border-b border-[#E9EBED]">
        <button 
          onClick={() => navigate(-1)}
          className="text-black hover:bg-slate-100 transition-colors p-2 rounded-full cursor-pointer border-0 bg-transparent flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-black absolute left-1/2 -translate-x-1/2">Semua Transaksi Terpusat</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9EBED] shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col pr-4 border-r border-[#E9EBED]">
              <span className="text-xs font-medium text-[#86899B] mb-1">Total Pemasukan</span>
              <h2 className="text-lg font-bold text-[#01A684] tabular-nums">
                + Rp {filteredTransactions.filter(t => t.type === 'Masuk').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}
              </h2>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-xs font-medium text-[#86899B] mb-1">Total Pengeluaran</span>
              <h2 className="text-lg font-bold text-red-600 tabular-nums">
                - Rp {filteredTransactions.filter(t => t.type === 'Keluar').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
        </div>

        {/* Filter Peran Pelaku */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#86899B] flex items-center gap-1 shrink-0"><Filter size={14} /> Filter Peran:</span>
            {['Semua', 'Owner', 'Kasir', 'Admin'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all border-0 ${
                  activeFilter === filter 
                    ? 'bg-[#01A684] text-white font-bold shadow-sm' 
                    : 'bg-white border border-[#E9EBED] text-[#86899B]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-[#E9EBED] p-5 w-full flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#181b2b]">Riwayat Lengkap ({filteredTransactions.length} Data)</h2>
            <button className="bg-[#01A684] hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border-0 shadow-sm">
              <Download size={16} />
              <span>Ekspor CSV</span>
            </button>
          </div>

          <div className="w-full overflow-x-auto border border-[#E9EBED] rounded-xl">
            <table className="w-full text-left min-w-[1500px]">
              <thead className="border-b border-[#E9EBED] bg-slate-50 text-xs font-bold text-[#86899B]">
                <tr>
                  <th className="p-4">ID Transaksi</th>
                  <th className="p-4">Tanggal & Waktu</th>
                  <th className="p-4">Tipe</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Detail Produk</th>
                  <th className="p-4 text-right">Jumlah (Rp)</th>
                  <th className="p-4 text-right">Pajak</th>
                  <th className="p-4 text-right">Service</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4">ID Owner (Pengunci)</th>
                  <th className="p-4">Nama Akun (Pelaku)</th>
                  <th className="p-4">Helper</th>
                  <th className="p-4 text-center">Bukti Struk</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E9EBED]">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="p-8 text-center text-[#86899B]">Memuat data transaksi...</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="p-8 text-center text-[#86899B]">Belum ada data transaksi untuk filter ini.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-[#181b2b]">{trx.id}</td>
                      <td className="p-4 text-[#86899B]">{trx.date}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${trx.type === 'Masuk' ? 'bg-emerald-50 text-[#01A684]' : 'bg-red-50 text-red-600'}`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#181b2b]">{trx.description}</td>
                      <td className="p-4 text-[#86899B]">{trx.productDetails}</td>
                      <td className={`p-4 text-right font-bold tabular-nums ${trx.type === 'Masuk' ? 'text-[#01A684]' : 'text-red-600'}`}>
                        {trx.type === 'Masuk' ? '+ ' : '- '} Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-right tabular-nums text-[#181b2b]">Rp {trx.tax.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right tabular-nums text-[#181b2b]">Rp {trx.service.toLocaleString('id-ID')}</td>
                      <td className="p-4 font-medium text-[#181b2b]">{trx.method}</td>
                      <td className="p-4 font-mono text-[10px] text-[#86899B]">{trx.ownerId.slice(0, 8)}...</td>
                      <td className="p-4 font-semibold text-[#181b2b]">{trx.accountName}</td>
                      <td className="p-4 text-[#86899B]">{trx.helper}</td>
                      <td className="p-4 text-center">
                        {trx.receiptUrl ? (
                          <button 
                            onClick={() => setSelectedReceipt(trx.receiptUrl)}
                            className="inline-flex items-center gap-1 bg-emerald-50 text-[#01A684] px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-100 cursor-pointer border-0"
                          >
                            <ImageIcon size={14} /> Lihat
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Tidak ada</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modal Lihat Bukti Foto Struk */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Bukti Transaksi / Struk</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-[#86899B] hover:text-[#181b2b] cursor-pointer border-0 bg-transparent">
                <X size={18} />
              </button>
            </div>
            <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-[#E9EBED]">
              <img src={selectedReceipt} alt="Bukti Struk" className="w-full h-full object-contain" />
            </div>
            <button 
              onClick={() => setSelectedReceipt(null)} 
              className="w-full py-2.5 bg-[#01A684] text-white text-xs font-bold rounded-xl cursor-pointer border-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
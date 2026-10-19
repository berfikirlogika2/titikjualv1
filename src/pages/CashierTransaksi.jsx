import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierTransaksi() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Bulan Ini');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ masuk: 0, keluar: 0, countMasuk: 0, countKeluar: 0 });

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

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
            const amount = Number(tx.total_amount) || 0;
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
              code: tx.transaction_code || `CS-TRX-${String(idx + 1).padStart(4, '0')}`,
              date: tx.created_at ? tx.created_at.replace('T', ' ').substring(0, 16) : '2026-07-01 10:00',
              staff: `${tx.cashier_name || 'Kasir'} / Staff`,
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
  }, [activeFilter]);

  const formatRp = (val) => Number(val || 0).toLocaleString('id-ID');

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
        <h1 className="text-lg font-semibold flex-1 px-4 truncate text-center">Kasir Pro - Transaksi</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-emerald-100 flex items-center justify-center font-bold text-[#01A684]">
          KP
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto lg:max-w-full lg:px-8 flex flex-col gap-4">
        
        {/* Summary Card */}
        <div className="px-6 pt-2">
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
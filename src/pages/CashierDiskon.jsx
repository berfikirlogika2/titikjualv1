import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Tag, Calendar, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import CashierBottomNav from './CashierBottomNav';

export default function CashierDiskon() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ aktif: 0, totalKuota: 0 });

  const getOwnerId = () => {
    return localStorage.getItem('owner_id') || 'toko_123';
  };

  // Ambil data diskon dari tabel 'discounts' Supabase milik owner
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const currentOwnerId = getOwnerId();
        const { data, error } = await supabase
          .from('discounts')
          .select('*')
          .eq('owner_id', currentOwnerId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          let activeCount = 0;
          let sumKuota = 0;

          const formatted = data.map((item, idx) => {
            const isActive = item.status === 'aktif';
            if (isActive) activeCount++;
            sumKuota += (item.kuota_maksimal || 100);

            // Format nilai diskon berdasarkan tipe (persen / nominal)
            const nilaiDisplay = item.tipe === 'persen' 
              ? `${item.nilai}%` 
              : `Rp ${Number(item.nilai || 0).toLocaleString('id-ID')}`;

            return {
              id: item.id || idx,
              nama: item.nama || 'Promo Toko',
              kode: item.kode || '-',
              tipe: item.tipe === 'persen' ? 'Persentase (%)' : 'Nominal (Rp)',
              nilai: nilaiDisplay,
              minMaks: item.min_maks || 'Tanpa Min. Belanja',
              masaBerlaku: item.periode || 'Berlaku Setiap Hari',
              status: isActive ? 'Aktif' : 'Berakhir'
            };
          });

          setDiscounts(formatted);
          setSummary({
            aktif: activeCount,
            totalKuota: sumKuota
          });
        }
      } catch (err) {
        console.error('Gagal memuat data diskon kasir:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return (
    <div className="bg-[#F1F2F6] text-[#1A1A1A] font-sans min-h-screen flex flex-col relative pb-[120px] lg:pb-12">
      
      {/* MainHeader */}
      <header className="sticky pt-6 pb-4 px-4 md:px-8 lg:px-12 top-0 backdrop-blur-md z-40 flex items-center justify-between bg-[#F1F2F6]/90 border-b border-gray-200/50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer border-0 shrink-0"
        >
          {/* Perubahan Disini: Icon Back / ArrowLeft */}
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-sm md:text-base font-semibold flex-1 px-4 truncate text-center">Daftar Diskon &amp; Promo</h1>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-medium">
            <Eye size={14} />
            <span>View Only</span>
          </div>

          {/* Inisial FK untuk Fadhil Kasir */}
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-emerald-100 bg-emerald-50 flex items-center justify-center font-bold text-[#01A684] shrink-0">
            FK
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-4 mt-4">
        
        {/* Summary Card */}
        <div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col pr-4 border-r border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">Voucher Status Aktif</span>
                <h2 className="font-bold text-base md:text-xl lg:text-2xl text-[#01A684]">{summary.aktif} <span className="text-xs font-medium text-gray-400">/ {discounts.length}</span></h2>
              </div>
              <div className="flex flex-col pl-2">
                <span className="text-xs text-gray-500 block mb-1">Total Kuota Promosi</span>
                <h2 className="font-bold text-base md:text-xl lg:text-2xl text-[#1A1A1A]">{summary.totalKuota} <span className="text-xs font-medium text-gray-400">X Pakai</span></h2>
              </div>
            </div>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="mt-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500">
                    <th className="p-4 font-medium">Nama Promo</th>
                    <th className="p-4 font-medium">Kode Voucher</th>
                    <th className="p-4 font-medium">Besar Potongan</th>
                    <th className="p-4 font-medium">Ketentuan Min. Belanja</th>
                    <th className="p-4 font-medium">Masa Berlaku</th>
                    <th className="p-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Memuat daftar diskon dari Supabase...</td>
                    </tr>
                  ) : discounts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-xs text-gray-500">Belum ada diskon atau promo yang dibuat oleh Owner.</td>
                    </tr>
                  ) : (
                    discounts.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.status !== 'Aktif' ? 'opacity-60' : ''}`}>
                        <td className="p-4 text-[#1A1A1A] font-semibold text-xs">{item.nama}</td>
                        <td className="p-4">
                          {item.kode !== '-' ? (
                            <span className="bg-[#E6F6F3] text-[#01A684] px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider border border-emerald-200 inline-block">{item.kode}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4 text-[#01A684] font-extrabold text-xs">{item.nilai}</td>
                        <td className="p-4 text-gray-500 text-xs">{item.minMaks}</td>
                        <td className="p-4 text-gray-500 text-xs">{item.masaBerlaku}</td>
                        <td className="p-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold inline-block ${
                            item.status === 'Aktif' ? 'bg-[#E6F6F3] text-[#01A684]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
              <span className="text-xs text-gray-500">Menampilkan {discounts.length} data diskon</span>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#01A684] text-white text-xs font-bold border-0 cursor-pointer">1</button>
              </div>
            </div>

          </div>
        </div>

      </main>

      <CashierBottomNav />

    </div>
  );
}
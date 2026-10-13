import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Settings2, 
  BarChart3, ChevronRight 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

const formatRupiah = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numberString = val.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
};

export default function OwnerStaf() {
  const navigate = useNavigate();

  const [stafList, setStafList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data real-time dari tabel profiles berdasarkan owner_id teks di localStorage
  useEffect(() => {
    const fetchStaf = async () => {
      setLoading(true);
      try {
        const activeOwnerId = localStorage.getItem('owner_id');
        
        if (!activeOwnerId) {
          setStafList([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('owner_id', activeOwnerId);

        if (error) throw error;
        
        if (data) {
          const formattedData = data.map(item => ({
            id: item.id, // ID unik dari baris database profiles
            nama: item.full_name || item.username || 'Tanpa Nama',
            role: item.role ? item.role.toUpperCase() : 'STAFF',
            gajiPokok: item.gaji_pokok || 3000000,
            omzetBulanIni: item.omzet_bulan_ini || 0,
            targetBulanan: item.target_bulanan || 15000000,
            komisiTerkumpul: item.komisi_terkumpul || 0
          }));
          setStafList(formattedData);
        }
      } catch (err) {
        console.error('Gagal memuat data staf:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaf();
  }, []);

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pengaturan Staf & Insentif
          </h1>

          <div className="w-9 h-9 shrink-0" />
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="p-4 max-w-md lg:max-w-7xl mx-auto flex flex-col gap-4">

        {/* HERO CARD */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl p-4 lg:p-6 shadow-md relative overflow-hidden flex items-center">
          <div className="relative z-10 w-full">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 size={11} className="text-[#01a684]" /> EVALUASI PENJUALAN TIM
            </span>
            <h2 className="text-base lg:text-xl font-black tracking-tight mt-0.5">Skema Gaji & Komisi Insentif</h2>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-lg">
              Kelola data seluruh tim outlet Anda dalam satu kendali terpusat.
            </p>
          </div>
        </div>

        {/* TOMBOL TAMBAH STAFF */}
        <button 
          onClick={() => navigate('/owner/register-staff')}
          className="w-full bg-[#01a684] text-white font-bold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-all cursor-pointer border-0 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          <UserPlus size={16} /> Tambah Staff & Karyawan
        </button>

        {/* DAFTAR TIM STAF - LAYOUT COMPACT RESPONSIVE */}
        {loading ? (
          <p className="text-xs text-center text-[#86899B] py-8">Memuat data staf...</p>
        ) : stafList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-6 text-center flex flex-col items-center gap-2">
            <p className="text-xs text-[#86899B]">Belum ada data anggota tim terdaftar dengan ID toko ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stafList.map((staf) => {
              const targetBln = staf.targetBulanan || 1;
              const omzetBln = staf.omzetBulanIni || 0;
              const progressBulanan = Math.min(100, Math.round((omzetBln / targetBln) * 100));

              return (
                <div key={staf.id} className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-xs flex flex-col justify-between gap-2.5">
                  
                  {/* Bagian atas: Avatar, Nama, Role, & Tombol Pengaturan */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#01a684] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                        {staf.nama ? staf.nama.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs font-bold text-[#181b2b] truncate max-w-[130px]">{staf.nama}</h3>
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#01a684] border border-emerald-200 uppercase">
                            {staf.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#86899B] mt-0.5">
                          Gaji: Rp {formatRupiah(staf.gajiPokok)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="p-1.5 rounded-lg bg-[#F1F2F6] text-[#86899B] hover:text-[#01a684] transition-all cursor-pointer border-0 shrink-0"
                      title="Pengaturan & Edit"
                    >
                      <Settings2 size={14} />
                    </button>
                  </div>

                  {/* Progress Omzet Compact */}
                  <div className="flex flex-col gap-1 bg-[#F1F2F6]/70 p-2 rounded-xl">
                    <div className="flex justify-between text-[9px] font-semibold">
                      <span className="text-[#86899B]">Capaian Omzet</span>
                      <span className="text-[#181b2b] tabular-nums font-bold">
                        Rp {formatRupiah(omzetBln)} ({progressBulanan}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
                      <div className="h-full bg-[#01a684] rounded-full" style={{ width: `${progressBulanan}%` }} />
                    </div>
                  </div>

                  {/* Bagian bawah: Estimasi Komisi & Tombol Detail Rincian Dinamis Berdasarkan ID */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E9EBED]/60 text-[11px]">
                    <div>
                      <span className="text-[8px] text-[#86899B] block">Komisi:</span>
                      <strong className="text-[#01a684] text-[11px] font-black">Rp {formatRupiah(staf.komisiTerkumpul)}</strong>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="px-2.5 py-1 bg-emerald-50 text-[#01a684] text-[9px] font-bold rounded-lg border border-emerald-200 flex items-center gap-0.5 cursor-pointer border-0 shadow-xs"
                    >
                      Detail <ChevronRight size={10} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      <OwnerBottomNav />

    </div>
  );
}
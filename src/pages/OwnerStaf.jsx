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
            id: item.id,
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
      
      {/* HEADER RESPONSIF */}
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-3 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-12 lg:h-16 flex items-center justify-between relative max-w-md md:max-w-3xl lg:max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
          >
            <ArrowLeft size={16} />
          </button>
          
          <h1 className="text-[11px] lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            Pengaturan Staf & Insentif
          </h1>

          <div className="w-8 h-8 shrink-0" />
        </div>
      </header>

      {/* KONTEN UTAMA RESPONSIF (UKURAN SAMA DENGAN PENGATURAN) */}
      <main className="p-3 lg:p-8 max-w-md md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col gap-3 lg:gap-6">

        {/* HERO CARD */}
        <div className="bg-gradient-to-br from-[#181b2b] via-[#23273a] to-[#01a684]/80 text-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-md relative overflow-hidden flex flex-col gap-2">
          <span className="text-[9px] lg:text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 size={11} /> EVALUASI PENJUALAN TIM
          </span>
          <h2 className="text-sm lg:text-2xl font-black tracking-tight">Skema Gaji & Komisi Insentif</h2>
          <p className="text-[10px] lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            Kelola data seluruh tim outlet Anda dalam satu kendali terpusat.
          </p>
        </div>

        {/* TOMBOL TAMBAH STAFF */}
        <button 
          onClick={() => navigate('/owner/register-staff')}
          className="w-full bg-[#01a684] text-white font-bold py-3 rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 text-[11px] lg:text-xs uppercase tracking-wider"
        >
          <UserPlus size={15} /> Tambah Staff & Karyawan
        </button>

        {/* DAFTAR TIM STAF - GRID RESPONSIF */}
        {loading ? (
          <p className="text-xs text-center text-[#86899B] py-8">Memuat data staf...</p>
        ) : stafList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-6 text-center flex flex-col items-center gap-2">
            <p className="text-xs text-[#86899B]">Belum ada data anggota tim terdaftar dengan ID toko ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-3">
            {stafList.map((staf) => {
              const targetBln = staf.targetBulanan || 1;
              const omzetBln = staf.omzetBulanIni || 0;
              const progressBulanan = Math.min(100, Math.round((omzetBln / targetBln) * 100));

              return (
                <div key={staf.id} className="bg-white rounded-xl border border-[#E9EBED] p-3 shadow-2xs flex flex-col justify-between gap-2.5">
                  
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#01a684] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                        {staf.nama ? staf.nama.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 truncate">
                          <h3 className="text-[11px] font-bold text-[#181b2b] truncate">{staf.nama}</h3>
                          <span className="text-[8px] font-bold px-1 rounded bg-emerald-50 text-[#01a684] border border-emerald-200 uppercase shrink-0">
                            {staf.role}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#86899B] mt-0.5">
                          Gaji: Rp {formatRupiah(staf.gajiPokok)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="p-1 rounded-lg bg-[#F1F2F6] text-[#86899B] hover:text-[#01a684] transition-all cursor-pointer border-0 shrink-0"
                      title="Pengaturan & Edit"
                    >
                      <Settings2 size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 bg-[#F1F2F6]/70 p-2 rounded-lg">
                    <div className="flex justify-between text-[8px] font-semibold">
                      <span className="text-[#86899B]">Capaian Omzet</span>
                      <span className="text-[#181b2b] tabular-nums font-bold">
                        Rp {formatRupiah(omzetBln)} ({progressBulanan}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
                      <div className="h-full bg-[#01a684] rounded-full" style={{ width: `${progressBulanan}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E9EBED]/50 text-[10px]">
                    <div>
                      <span className="text-[7px] text-[#86899B] block uppercase">Komisi:</span>
                      <strong className="text-[#01a684] text-[10px] font-black">Rp {formatRupiah(staf.komisiTerkumpul)}</strong>
                    </div>

                    <button 
                      onClick={() => navigate(`/owner/staf/detail/${staf.id}`)}
                      className="px-2 py-1 bg-emerald-50 text-[#01a684] text-[9px] font-bold rounded-lg border border-emerald-200 flex items-center gap-0.5 cursor-pointer border-0 shadow-xs"
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
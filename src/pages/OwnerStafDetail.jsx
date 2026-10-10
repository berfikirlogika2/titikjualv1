import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
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

const parseRupiah = (str) => {
  if (!str) return 0;
  return parseInt(str.toString().replace(/\./g, ''), 10) || 0;
};

export default function OwnerStafDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // State data rincian staf dengan fitur komisi lengkap
  const [formData, setFormData] = useState({
    nama: id === '1' ? 'Sarah Jenkins' : 'Budi Santoso',
    jabatan: 'Kasir',
    telepon: '081234567890',
    gajiPokok: '3.000.000',
    periodeKomisi: 'bulanan', // 'harian' atau 'bulanan'
    tipeKomisi: 'persen',    // 'persen' atau 'nominal'
    nilaiKomisi: '2',
    targetHarian: '500.000',
    targetBulanan: '15.000.000'
  });

  const handleSave = () => {
    alert('Perubahan data staf dan skema komisi berhasil disimpan!');
    navigate('/owner/staf');
  };

  return (
    <div className="bg-[#F1F2F6] min-h-screen text-[#181b2b] pb-36 lg:pb-12 font-sans antialiased relative">
      <header className="sticky top-0 z-40 bg-[#F1F2F6]/90 backdrop-blur-md border-b border-[#E9EBED]/50 px-4 lg:px-10 pt-[env(safe-area-inset-top)]">
        <div className="h-14 lg:h-16 flex items-center justify-between relative max-w-md lg:max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-[#181b2b] absolute left-1/2 -translate-x-1/2 truncate">
            Detail & Edit Karyawan
          </h1>
          <div className="w-9 h-9" />
        </div>
      </header>

      <main className="p-5 max-w-md lg:max-w-4xl mx-auto flex flex-col gap-5">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b] flex items-center gap-2">
            <User size={16} className="text-[#01a684]" /> Informasi & Skema Insentif Pegawai
          </h3>

          <div className="flex flex-col gap-3.5 text-xs">
            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.nama} 
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nomor Telepon / WhatsApp</label>
              <input 
                type="text" 
                value={formData.telepon} 
                onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Jabatan</label>
              <input 
                type="text" 
                disabled
                value={formData.jabatan} 
                className="w-full bg-slate-100 border border-[#E9EBED] rounded-xl p-3 font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Gaji Pokok Bulanan (Rp)</label>
              <input 
                type="text" 
                value={formatRupiah(formData.gajiPokok)} 
                onChange={(e) => setFormData({...formData, gajiPokok: e.target.value})}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Sistem Evaluasi Target</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, periodeKomisi: 'harian'})}
                  className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer border-0 ${formData.periodeKomisi === 'harian' ? 'bg-[#01a684] text-white shadow-sm' : 'bg-white text-[#86899B] border border-[#E9EBED]'}`}
                >
                  Target Harian
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, periodeKomisi: 'bulanan'})}
                  className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer border-0 ${formData.periodeKomisi === 'bulanan' ? 'bg-[#01a684] text-white shadow-sm' : 'bg-white text-[#86899B] border border-[#E9EBED]'}`}
                >
                  Target Bulanan
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">
                {formData.periodeKomisi === 'harian' ? 'Target Omzet Harian (Rp)' : 'Target Omzet Bulanan (Rp)'}
              </label>
              <input 
                type="text" 
                value={formData.periodeKomisi === 'harian' ? formatRupiah(formData.targetHarian) : formatRupiah(formData.targetBulanan)} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (formData.periodeKomisi === 'harian') {
                    setFormData({...formData, targetHarian: val});
                  } else {
                    setFormData({...formData, targetBulanan: val});
                  }
                }}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Bentuk Komisi Bonus</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipeKomisi: 'persen'})}
                  className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer border-0 ${formData.tipeKomisi === 'persen' ? 'bg-[#01a684] text-white shadow-sm' : 'bg-white text-[#86899B] border border-[#E9EBED]'}`}
                >
                  Persen (%)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipeKomisi: 'nominal'})}
                  className={`py-2.5 rounded-xl font-bold text-xs border cursor-pointer border-0 ${formData.tipeKomisi === 'nominal' ? 'bg-[#01a684] text-white shadow-sm' : 'bg-white text-[#86899B] border border-[#E9EBED]'}`}
                >
                  Nominal (Rp)
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Besar Nilai Bonus</label>
              <input 
                type="text" 
                value={formData.tipeKomisi === 'nominal' ? formatRupiah(formData.nilaiKomisi) : formData.nilaiKomisi} 
                onChange={(e) => setFormData({...formData, nilaiKomisi: e.target.value})}
                placeholder={formData.tipeKomisi === 'persen' ? 'Cth: 2' : 'Cth: 5.000'}
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-4 bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer border-0 flex items-center justify-center gap-2 text-xs"
          >
            <Save size={16} /> Simpan Perubahan Staf
          </button>
        </div>
      </main>
      <OwnerBottomNav />
    </div>
  );
}
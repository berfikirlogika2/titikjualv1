import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, KeyRound, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import OwnerBottomNav from './OwnerBottomNav';

export default function OwnerRegisterAkun() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || { jabatan: 'kasir' };

  const [ownerId, setOwnerId] = useState(routeState.ownerId || '');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    const fetchOwnerSession = async () => {
      if (!ownerId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setOwnerId(session.user.id);
        } else {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'owner')
            .limit(1);

          if (profiles && profiles.length > 0) {
            setOwnerId(profiles[0].id);
          }
        }
      }
    };
    fetchOwnerSession();
  }, [ownerId]);

  const handleNameChange = (val) => {
    setNama(val);
    const cleanName = val.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanName.length > 0) {
      setUsername(`${cleanName}${Math.floor(10 + Math.random() * 90)}`);
      setPassword(`${cleanName}123`);
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleCreateAccount = async () => {
    if (!nama || !email || !telepon || !username || !password) {
      alert('Mohon lengkapi semua data formulir!');
      return;
    }

    if (!ownerId) {
      alert('Sesi owner belum teridentifikasi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        owner_id: ownerId,
        nama: nama,
        telepon: telepon,
        jabatan: routeState.jabatan,
        gaji_pokok: 0,
        target_bulanan: 0
      };

      const { error } = await supabase
        .from('staff_members')
        .insert([payload]);

      if (error) throw error;

      setCreatedCredentials({ username, password });
    } catch (err) {
      console.error('Gagal membuat akun:', err.message);
      alert('Terjadi kesalahan saat mendaftarkan akun: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            Buat Akun {routeState.jabatan.toUpperCase()}
          </h1>
          <div className="w-9 h-9" />
        </div>
      </header>

      <main className="p-5 max-w-md lg:max-w-4xl mx-auto flex flex-col gap-5">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/90 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#01a684] flex items-center justify-center shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#181b2b]">Identitas & Kredensial Login</h3>
              <p className="text-[10px] text-[#86899B]">Akun terikat otomatis dengan ID Tenant Anda</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nama Lengkap {routeState.jabatan.toUpperCase()}</label>
              <input 
                type="text" 
                value={nama}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Alamat Gmail / Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: budi@gmail.com"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Nomor Telepon / WhatsApp</label>
              <input 
                type="text" 
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-[#F1F2F6] border border-[#E9EBED] rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-[#01a684]"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Username Login</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username otomatis..."
                className="w-full bg-slate-100 border border-[#E9EBED] rounded-xl p-3 font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#181b2b] mb-1 block">Password</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password mudah..."
                className="w-full bg-slate-100 border border-[#E9EBED] rounded-xl p-3 font-bold outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleCreateAccount}
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#01a684] text-white font-bold py-3.5 rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer border-0 text-xs"
          >
            {isSubmitting ? 'Memproses...' : 'Ajukan Pendaftaran & Buat Akun'}
          </button>
        </div>
      </main>

      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 border border-emerald-100 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#01a684] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#181b2b]">Pendaftaran Akun Berhasil!</h3>
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              ⚠️ Salin atau screenshot informasi ini sekarang. <b>Data ini hanya dapat dilihat sekali ini saja</b>!
            </p>

            <div className="bg-[#F1F2F6] p-4 rounded-2xl flex flex-col gap-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-black">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-bold text-black">{createdCredentials.password}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`);
                alert('Kredensial disalin ke clipboard!');
                navigate('/owner/staf');
              }}
              className="w-full py-3 bg-[#01a684] text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center justify-center gap-2 shadow-sm"
            >
              <Copy size={16} /> Salin & Selesai
            </button>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}
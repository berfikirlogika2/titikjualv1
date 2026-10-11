import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Fungsi helper hash password SHA-256
async function hashPassword(plainPassword) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function Register() {
  const navigate = useNavigate();
  const [namaToko, setNamaToko] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Otomatis buat username saat nama lengkap diketik
  const handleNameChange = (val) => {
    setNamaLengkap(val);
    const cleanName = val.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6);
    if (cleanName.length > 0) {
      const randNum = Math.floor(10 + Math.random() * 90);
      setUsername(`${cleanName}${randNum}`);
      setPassword(`${cleanName}123`);
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!namaToko || !namaLengkap || !email || !telepon || !username || !password) {
      alert('Mohon lengkapi semua kolom formulir pendaftaran!');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Buat owner_id berbasis teks dengan format: namatoko_3angka
      const cleanStoreName = namaToko.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
      const randomThreeDigits = Math.floor(100 + Math.random() * 900);
      const customOwnerId = `${cleanStoreName}_${randomThreeDigits}`;

      // 2. Hash password aman
      const securePassword = await hashPassword(password);

      // 3. Simpan data langsung ke tabel tunggal `profiles` sebagai OWNER
      const payload = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        owner_id: customOwnerId, // <-- Format teks custom yang rapi
        full_name: namaLengkap,
        username: username,
        email: email,
        phone: telepon,
        role: 'owner',
        password: securePassword,
        subscription_plan: 'free_trial',
        billing_cycle: 'monthly'
      };

      const { error } = await supabase.from('profiles').insert([payload]);
      if (error) throw error;

      // 4. Simpan sesi penting ke localStorage untuk proses selanjutnya (pembayaran / dashboard)
      localStorage.setItem('owner_id', customOwnerId);
      localStorage.setItem('username', username);
      localStorage.setItem('nama_lengkap', namaLengkap);
      localStorage.setItem('user_role', 'owner');
      localStorage.setItem('regEmail', email);

      alert(`Pendaftaran berhasil!\nID Toko Anda: ${customOwnerId}\nUsername: ${username}`);
      
      // Arahkan ke halaman pemilihan paket / pembayaran
      navigate('/register-payment');

    } catch (err) {
      console.error('Gagal mendaftar:', err.message);
      alert('Terjadi kesalahan pendaftaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#01A684] text-slate-800 min-h-screen flex flex-col font-['Inter'] antialiased selection:bg-[#01A684] selection:text-white overflow-x-hidden">
      
      {/* Header */}
      <header className="pt-8 pb-8 px-6 flex flex-col items-center text-center relative bg-[#01A684] text-white w-full">
        <div className="w-full flex items-center justify-between mb-4 max-w-md">
          <button 
            aria-label="Kembali" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-white backdrop-blur-sm cursor-pointer border-0" 
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/20 text-emerald-100 backdrop-blur-md border border-white/10">
            PINTAR • V2.4
          </span>
          <div className="w-10"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center tracking-tight text-white font-extrabold text-3xl">
            <span>titik</span>
            <span className="text-[#7af9d2]">jual</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7af9d2] ml-0.5 self-end mb-1.5"></span>
          </div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-emerald-100/90 text-center">
            PENDAFTARAN PEMILIK OUTLET
          </p>
        </div>
      </header>

      {/* Card Form */}
      <div className="bg-white text-slate-900 w-full rounded-t-[32px] px-6 py-8 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] flex flex-col flex-1 max-w-md mx-auto overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Akun Owner</h1>
          <p className="text-[#86899B] text-sm mt-1">Buat ID Toko dan mulai kelola bisnis Anda hari ini</p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleRegister}>
          
          {/* Nama Toko / Outlet */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="namaToko">
              Nama Toko / Outlet Anda
            </label>
            <input 
              id="namaToko"
              type="text"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              placeholder="Contoh: Toko Berkah Jaya"
              className="w-full px-4 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all font-semibold" 
              required
            />
          </div>

          {/* Nama Lengkap Owner */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="namaLengkap">
              Nama Lengkap Pemilik
            </label>
            <input 
              id="namaLengkap"
              type="text"
              value={namaLengkap}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full px-4 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all font-semibold" 
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="email">
              Alamat Email / Gmail
            </label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: ahmad@gmail.com"
              className="w-full px-4 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all" 
              required
            />
          </div>

          {/* Telepon */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="telepon">
              Nomor WhatsApp / Telepon
            </label>
            <input 
              id="telepon"
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-3 bg-[#F1F2F6] border border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#01A684] focus:ring-2 focus:ring-[#01A684]/20 outline-none transition-all" 
              required
            />
          </div>

          {/* Username (Auto) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="username">
              Username Login (Otomatis)
            </label>
            <input 
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Terisi otomatis..."
              className="w-full px-4 py-3 bg-slate-100 border border-[#E9EBED] rounded-xl text-sm text-slate-700 font-bold outline-none" 
              required
            />
          </div>

          {/* Password (Auto/Custom) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide" htmlFor="password">
              Kata Sandi
            </label>
            <input 
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi..."
              className="w-full px-4 py-3 bg-slate-100 border border-[#E9EBED] rounded-xl text-sm text-slate-700 font-bold outline-none" 
              required
            />
          </div>

          {/* Tombol Submit */}
          <button 
            disabled={isLoading}
            className="w-full bg-[#01A684] hover:bg-[#008769] text-white font-semibold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm mt-3 cursor-pointer border-0" 
            type="submit"
          >
            <span>{isLoading ? 'Memproses Pendaftaran...' : 'Lanjut ke Pembayaran'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-6 mb-2">
          <p className="text-xs text-slate-600">
            Sudah punya akun outlet?
            <a 
              className="text-[#01A684] font-semibold hover:underline ml-1 cursor-pointer" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Masuk Disini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
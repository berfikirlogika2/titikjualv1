import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setLoading(true);

    try {
      // 1. Pendaftaran akun via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            role: formData.role,
            phone: formData.phone,
          }
        }
      });

      if (error) throw error;

      // 2. Simpan juga secara eksplisit ke tabel database Anda (Contoh: tabel 'profiles')
      // Pastikan Anda sudah membuat tabel bernama 'profiles' di Supabase Table Editor
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id, // Menghubungkan ID dengan auth.users
              full_name: formData.fullName,
              username: formData.username,
              email: formData.email,
              role: formData.role,
              phone: formData.phone,
            }
          ]);

        if (profileError) {
          console.error('Gagal menyimpan ke tabel profiles:', profileError.message);
          // Anda bisa memutuskan apakah ingin melempar error atau tetap melangkah ke halaman berikutnya
        }
      }

      // Simpan email ke localStorage untuk simulasi
      localStorage.setItem('regEmail', formData.email);
      alert('Pendaftaran berhasil! Lanjutkan ke tahap verifikasi simulasi.');
      
      // Arahkan ke halaman simulasi OTP
      navigate('/register-otp');

    } catch (error) {
      alert('Gagal Mendaftar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased" style={{ background: 'linear-gradient(180deg, #00A482 0%, #018c6f 100%)' }}>
      
      {/* Header */}
      <header className="w-full flex justify-center pt-12 pb-8 z-10 px-6 shrink-0">
        <div className="w-full max-w-screen-md mx-auto flex items-center justify-between relative">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/25 hover:bg-white/35 text-white transition-colors cursor-pointer border-0" 
            title="Kembali"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-black tracking-tight text-white flex items-center gap-0.5">
              <span className="text-gray-900">titik</span>
              <span className="text-white">jual.</span>
            </div>
          </div>
          
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full bg-white flex-1 rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col px-6 pt-10 pb-8 z-20 relative max-w-screen-md mx-auto">
        
        {/* Registration Progress Wrapper */}
        <div className="w-full flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Buat Akun Baru</h2>
          <p className="text-sm text-gray-500 text-center max-w-md mx-auto">
            Mulai kelola bisnis dan outlet Anda dengan lebih mudah. Lengkapi data diri untuk memulai.
          </p>
          
          {/* Stepper */}
          <div className="relative w-full max-w-sm mx-auto mt-8 mb-6">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 z-0 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-[2px] bg-[#01A684] z-10 -translate-y-1/2 transition-all duration-300" style={{ width: '25%' }}></div>
            
            <div className="flex justify-between items-center relative z-20 w-full px-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#01A684] border-2 border-[#01A684] text-white font-semibold text-sm">1</div>
                <span className="text-xs font-medium text-[#01A684] absolute -bottom-6 whitespace-nowrap">Isi Data</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-400 font-semibold text-sm">2</div>
                <span className="text-xs font-medium text-gray-400 absolute -bottom-6 whitespace-nowrap">Paket</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-400 font-semibold text-sm">3</div>
                <span className="text-xs font-medium text-gray-400 absolute -bottom-6 whitespace-nowrap">Detail</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-400 font-semibold text-sm">4</div>
                <span className="text-xs font-medium text-gray-400 absolute -bottom-6 whitespace-nowrap">Selesai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="flex flex-col gap-8 w-full max-w-lg mx-auto">
          <div className="flex flex-col gap-6 w-full">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Informasi Pribadi</h3>
              <p className="text-sm text-gray-500">Data ini digunakan untuk keperluan akun admin utama Titik Jual Anda.</p>
            </div>

            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              
              {/* Nama Lengkap Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="fullName">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">person</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Masukkan nama sesuai KTP" 
                    required 
                    type="text" 
                  />
                </div>
              </div>

              {/* Nama Pengguna (Username) Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="username">Nama Pengguna (Username)</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">alternate_email</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="username" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Buat nama pengguna unik" 
                    required 
                    type="text" 
                  />
                </div>
              </div>

              {/* Email Aktif Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="email">Email Aktif</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">mail</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contoh@email.com" 
                    required 
                    type="email" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Gunakan email aktif untuk login berikutnya.</p>
              </div>

              {/* Pilih Peran (Role) Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="role">Pilih Peran (Role)</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">badge</span>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 pr-10 text-sm text-gray-900 appearance-none focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200 cursor-pointer" 
                    id="role" 
                    name="role" 
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option disabled value="">Pilih peran Anda</option>
                    <option value="owner">Owner (Pemilik)</option>
                    <option value="manager">Manager</option>
                    <option value="kasir">Kasir</option>
                    <option value="staff_toko">Staff Toko</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Nomor Handphone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="phone">Nomor Handphone (WhatsApp)</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">smartphone</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx" 
                    required 
                    type="tel" 
                  />
                </div>
              </div>

              <div className="w-full border-t border-gray-100 my-2"></div>

              {/* Password Baru Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="password">Password Baru</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">lock</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter" 
                    required 
                    type={showPassword ? "text" : "password"} 
                  />
                  <button 
                    className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5" htmlFor="confirmPassword">Konfirmasi Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-gray-400 pointer-events-none">lock_reset</span>
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#01A684] focus:ring-1 focus:ring-[#01A684] transition-all duration-200" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ketik ulang password" 
                    required 
                    type={showConfirmPassword ? "text" : "password"} 
                  />
                  <button 
                    className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-0 cursor-pointer flex items-center" 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button 
                  className="w-full bg-[#00A482] hover:opacity-90 text-white font-semibold rounded-full py-4 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Memproses...' : 'Lanjutkan'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <a 
                  className="font-semibold text-[#01A684] hover:underline cursor-pointer" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login-form');
                  }}
                >
                  Masuk di sini
                </a>
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-6 mt-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-[#01A684]">
                <span className="material-symbols-outlined text-3xl">shield_person</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">Data Aman Tersimpan</h4>
              <p className="text-sm text-gray-500">Kami menggunakan enkripsi tingkat tinggi untuk memastikan data pribadi dan bisnis Anda aman bersama Titik Jual.</p>
            </div>
            <div className="text-center pb-2">
              <p className="text-xs text-gray-400 font-medium">© 2026 Titik Jual • Solusi Pintar Manajemen Transaksi</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Register;
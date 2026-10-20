import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ==================== HALAMAN UTAMA & AUTH ====================
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';              
import LoginForm from './pages/FormLogin';      
import Register from './pages/Register';       
import RegisterOTP from './pages/RegisterOTP';   
import RegisterPlan from './pages/RegisterPlan';      
import RegisterPayment from './pages/RegisterPayment'; 
import RegisterSuccess from './pages/RegisterSuccess'; 
import TermsAndConditions from './pages/TermsAndConditions'; 
import ResetPassword from './pages/ResetPassword';
import ResetPasswordSuccess from './pages/ResetPasswordSuccess';

// ==================== MODUL KASIR (CASHIER) ====================
import CashierDashboard from './pages/CashierDashboard'; 
import CashierTransaksi from './pages/CashierTransaksi';
import CashierDiskon from './pages/CashierDiskon';
import CashierStok from './pages/CashierStok';
import CashierPengaturan from './pages/CashierPengaturan';

// ==================== MODUL ADMIN & SUPERADMIN ====================
import AdminDashboard from './pages/AdminDashboard';        
import SuperadminDashboardPage from './pages/SuperadminDashboardPage';

// ==================== MODUL OWNER ====================
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerLaporan from './pages/OwnerLaporan';
import OwnerSemuaTransaksi from './pages/OwnerSemuaTransaksi'; 
import OwnerStaf from './pages/OwnerStaf';
import OwnerStafDetail from './pages/OwnerStafDetail';       
import OwnerRegisterStaff from './pages/OwnerRegisterStaff'; 
import OwnerRegisterAkun from './pages/OwnerRegisterAkun';   
import OwnerBahan from './pages/OwnerBahan';
import OwnerPajak from './pages/OwnerPajak';
import OwnerDiskon from './pages/OwnerDiskon';
import OwnerProduk from './pages/OwnerProduk';
import OwnerPengaturan from './pages/OwnerPengaturan';

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== 1. AUTENTIKASI & UMUM ==================== */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-form" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-otp" element={<RegisterOTP />} />
        <Route path="/terms" element={<TermsAndConditions />} /> 
        <Route path="/register-plan" element={<RegisterPlan />} />
        <Route path="/register-payment" element={<RegisterPayment />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />
        
        {/* ==================== 2. MODUL KASIR ==================== */}
        <Route path="/kasir" element={<CashierDashboard />} />
        <Route path="/kasir/transaksi" element={<CashierTransaksi />} />
        <Route path="/kasir/diskon" element={<CashierDiskon />} />
        <Route path="/kasir/stok" element={<CashierStok />} />
        <Route path="/kasir/pengaturan" element={<CashierPengaturan />} />

        {/* ==================== 3. MODUL ADMIN & SUPERADMIN ==================== */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />    
        <Route path="/superadmin-dashboard" element={<SuperadminDashboardPage />} />    

        {/* ==================== 4. MODUL OWNER ==================== */}
        <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="/owner/laporan" element={<OwnerLaporan />} />
        <Route path="/owner/transaksi" element={<OwnerSemuaTransaksi />} />
        <Route path="/owner/staf" element={<OwnerStaf />} />
        <Route path="/owner/staf/detail/:id" element={<OwnerStafDetail />} />      
        <Route path="/owner/register-staff" element={<OwnerRegisterStaff />} />    
        <Route path="/owner/register-akun" element={<OwnerRegisterAkun />} />      
        <Route path="/owner/bahan" element={<OwnerBahan />} />
        <Route path="/owner/pajak" element={<OwnerPajak />} />
        <Route path="/owner/diskon" element={<OwnerDiskon />} />
        <Route path="/owner/produk" element={<OwnerProduk />} />
        <Route path="/owner/pengaturan" element={<OwnerPengaturan />} />
      </Routes>
    </Router>
  );
}

export default App;
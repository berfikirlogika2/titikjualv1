import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';                 
import LoginForm from './pages/Loginform';        
import Register from './pages/Register';          
import RegisterOTP from './pages/RegisterOTP';    
import RegisterPlan from './pages/RegisterPlan';       
import RegisterPayment from './pages/RegisterPayment'; 
import RegisterSuccess from './pages/RegisterSuccess'; 
import TermsAndConditions from './pages/TermsAndConditions'; 
import CashierDashboard from './pages/CashierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerLaporan from './pages/OwnerLaporan';
import OwnerStaf from './pages/OwnerStaf';
import DashboardKinerjaStaf from './pages/DashboardKinerjaStaf';
import OwnerBahan from './pages/OwnerBahan';
import OwnerPajak from './pages/OwnerPajak';
import OwnerDiskon from './pages/OwnerDiskon';
import OwnerProduk from './pages/OwnerProduk';
import OwnerPengaturan from './pages/OwnerPengaturan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Awal & Autentikasi */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-form" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-otp" element={<RegisterOTP />} />
        <Route path="/terms" element={<TermsAndConditions />} /> 
        
        {/* Alur Lanjutan Pendaftaran */}
        <Route path="/register-plan" element={<RegisterPlan />} />
        <Route path="/register-payment" element={<RegisterPayment />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        
        {/* Dashboard Berdasarkan Role */}
        <Route path="/cashier-pos" element={<CashierDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Modul Owner */}
        <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="/owner/laporan" element={<OwnerLaporan />} />
        <Route path="/owner/staf" element={<OwnerStaf />} />
        <Route path="/owner/kinerja-staf" element={<DashboardKinerjaStaf />} />
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
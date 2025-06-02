import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation as useReactRouterLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import NewMovies from './pages/NewMovies';
import GoodMovies from './pages/GoodMovies';

import MovieDetail from './pages/MovieDetail';
import User from './pages/User';
import Login from './components/Account/Login';
import Register from './components/Account/Register';
import Home from './pages/Home';
import WatchPage from './pages/WatchPage';
import ForgotPassword from './components/Account/ForgotPassword'; 

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';
import UploadMovieDTO from './components/UploadMovie';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const location = useReactRouterLocation();

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="app-container">
        {location.pathname.startsWith('/admin') && <Sidebar />}
        <main className={`main-content ${location.pathname.startsWith('/admin') ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path="/movie/:movieId" element={<MovieDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/new-movies" element={<NewMovies />} />
            <Route path="/good-movies" element={<GoodMovies />} />
            <Route path="/user" element={<User activeTab={activeTab} setActiveTab={setActiveTab} />} />
            <Route path="/xem-phim/:movieId" element={<WatchPage />} />
            <Route path="/xem-phim/:movieId/season/:season/episode/:episode" element={<WatchPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/upload-movie" element={<UploadMovieDTO />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /> 

            <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
          </Routes>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout /> 
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import { useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import Home from './pages/Home';
import Login from './components/Account/Login';
import Register from './components/Account/Register';
import ForgotPassword from './components/Account/ForgotPassword';
import MovieDetail from './pages/MovieDetail';
import WatchPage from './pages/WatchPage';
import NewMovies from './pages/NewMovies';
import TVShows from './pages/TVShows';
import SingleMovie from './pages/SingleMovie';
import User from './pages/User';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { Routes, Route } from 'react-router-dom';

import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="app">
                    <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path='/forgot-password' element={<ForgotPassword />} />
                            <Route path="/phim/:movieId" element={<MovieDetail />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/phim-moi" element={<NewMovies />} />
                            <Route path="/tv-shows" element={<TVShows />} />
                            <Route path="/phim-le" element={<SingleMovie />} />
                            <Route path="/user" element={<User activeTab={activeTab} setActiveTab={setActiveTab} />} />
                            <Route path="/xem-phim/:movieId" element={<WatchPage />} />
                            <Route path="/xem-phim/:movieId/season/:season/episode/:episode" element={<WatchPage />} />
                            <Route path="*" element={<div>404 - Trang không tồn tại</div>} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
                <ToastContainer />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
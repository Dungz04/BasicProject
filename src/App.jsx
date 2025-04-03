import './App.css';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import Home from './pages/Home';
import Login from './components/Account/Login';
import Register from './components/Account/Register';
import ForgotPassword from './components/Account/ForgotPassword';
import MovieDetail from './pages/MovieDetail';


import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome


function App() {
    return (
        <div className="app">
            <Router>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} /> {/* Route mặc định trỏ đến Home */}
                        <Route path="/home" element={<Home />} /> {/* Chuẩn hóa tên route */}
                        <Route path="/login" element={<Login />} /> {/* Thêm route cho Login */}
                        <Route path="/register" element={<Register />} /> {/* Thêm route cho Register */}
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path="/phim/:movieId" element={<MovieDetail />} /> {/* Route cho MovieDetail */}
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/phim-moi" element={<div>Phim mới</div>} />
                        <Route path="/phim-bo" element={<div>Phim bộ</div>} />
                        <Route path="/phim-le" element={<div>Phim lẻ</div>} />
                        
                    </Routes>
                </main>
                <Footer />
            </Router>
        </div>
    );
}

export default App;
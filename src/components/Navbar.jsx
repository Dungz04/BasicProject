import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import logo from '../assets/logo_title.png';
import '../styles/Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State để lưu từ khóa tìm kiếm

    const navigate = useNavigate(); // Hook để điều hướng

    // Tối ưu sự kiện cuộn
    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 50);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Tạo className tối ưu hơn
    const headerClass = useMemo(() => (isScrolled ? 'scrolled' : ''), [isScrolled]);

    // Toggle menu hamburger
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    // Xử lý thay đổi giá trị ô tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Xử lý tìm kiếm khi nhấn Enter hoặc nhấn icon tìm kiếm
    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            alert('Vui lòng nhập từ khóa tìm kiếm!'); // Thông báo nếu từ khóa rỗng
            return;
        }

        // Chuyển hướng đến trang tìm kiếm với query parameter
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchQuery(''); // Xóa ô tìm kiếm sau khi tìm kiếm
        if (isMenuOpen) toggleMenu(); // Đóng menu nếu đang mở
    };

    // Xử lý khi nhấn Enter trong ô tìm kiếm
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className={headerClass}>
            <div className="navbar">
                {/* Logo */}
                <NavLink to="/" className="logo">
                    <img src={logo} alt="Logo title" />
                </NavLink>

                {/* Biểu tượng hamburger */}
                <div className="hamburger" onClick={toggleMenu}>
                    <i className={isMenuOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'}></i>
                </div>

                {/* Navigation */}
                <ul className={`nav ${isMenuOpen ? 'active' : ''}`}>
                    <li>
                        <NavLink to="/" activeClassName="active" onClick={toggleMenu}>
                            <i className="fa-solid fa-house"></i>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/phim-moi" activeClassName="active" onClick={toggleMenu}>
                            Phim mới
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/phim-bo" activeClassName="active" onClick={toggleMenu}>
                            Phim bộ
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/phim-le" activeClassName="active" onClick={toggleMenu}>
                            Phim lẻ
                        </NavLink>
                    </li>
                </ul>

                {/* Thanh tìm kiếm */}
                <div className="search">
                    <i className="fa-solid fa-magnifying-glass" onClick={handleSearch}></i>
                    <input
                        type="text"
                        placeholder="Search"
                        aria-label="Tìm kiếm phim"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                    />
                </div>

                {/* Nút Đăng nhập */}
                <div className="login">
                    <NavLink to="/login" className="login-btn">
                        Đăng nhập
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
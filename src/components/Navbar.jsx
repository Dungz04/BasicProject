import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_title.png';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 50);
    }, []);

    const handleResize = useCallback(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (!mobile) {
            setIsSearchOpen(false);
            setIsMenuOpen(false);
            document.body.style.overflow = 'auto';
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleScroll, handleResize]);

    const headerClass = useMemo(() => (isScrolled ? '!bg-black !shadow-lg' : '!bg-black/0'), [isScrolled]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            alert('Vui lòng nhập từ khóa tìm kiếm!');
            return;
        }
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
        setIsSearchOpen(false);
        if (isMenuOpen) toggleMenu();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const navItems = [
        { to: '/', label: <><i className="fa-solid fa-house" /></>, exact: true },
        { to: '/phim-moi', label: 'Phim mới' },
        { to: '/phim-bo', label: 'Phim bộ' },
        { to: '/phim-le', label: 'Phim lẻ' },
    ];

    return (
        <header className={`fixed !top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out ${headerClass}`}>
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto !px-4 sm:!px-6 md:!px-8 !mt-2">
                <div className="flex items-center gap-2">
                    {isMobile && (
                        <button className="block text-white text-2xl cursor-pointer !px-2" onClick={toggleMenu}>
                            <i className={isMenuOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'}></i>
                        </button>
                    )}
                    <NavLink to="/" className="h-[40px]">
                        <img src={logo} alt="Logo title" className="h-full" />
                    </NavLink>
                </div>

                {!isMobile && (
                    <ul className="flex flex-row gap-6 list-none">
                        {navItems.map((item, idx) => (
                            <li key={idx}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium ${
                                            isActive ? '!text-red-500 -translate-y-0.5' : ''
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex items-center gap-3">
                    {!isMobile ? (
                        <div className="relative flex items-center bg-white/10 hover:bg-white/20 rounded-md !px-3 w-[200px] sm:w-[250px] h-9 text-white">
                            <i
                                className="fa-solid fa-magnifying-glass absolute left-2 border-r border-white !pr-2 text-sm cursor-pointer"
                                onClick={handleSearch}
                            ></i>
                            <input
                                type="text"
                                className="bg-transparent w-full h-full !pl-8 text-sm placeholder-white/70 outline-none"
                                placeholder="Tìm kiếm phim..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                aria-label="Tìm kiếm phim"
                            />
                        </div>
                    ) : (
                        <div className="relative flex items-center text-white">
                            <i
                                className="fa-solid fa-magnifying-glass text-xl cursor-pointer"
                                onClick={toggleSearch}
                            ></i>
                            {isSearchOpen && (
                                <div className="absolute top-full right-0 !mt-2 w-[220px] bg-white/10 hover:bg-white/20 rounded-md flex items-center !px-3 h-9 z-40 transition-all duration-300">
                                    <i
                                        className="fa-solid fa-magnifying-glass absolute left-2 border-r border-white !pr-2 text-sm cursor-pointer"
                                        onClick={handleSearch}
                                    ></i>
                                    <input
                                        type="text"
                                        className="bg-transparent w-full h-full !pl-8 text-sm placeholder-white/70 outline-none"
                                        placeholder="Tìm kiếm phim..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyPress={handleKeyPress}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <NavLink
                        to="/login"
                        className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold !py-1.5 !px-3 rounded-md text-sm shadow-md hover:shadow-lg transition"
                    >
                        Đăng nhập
                    </NavLink>
                </div>
            </div>

            {isMobile && (
                <ul
                    className={`flex-col list-none w-full bg-black/90 transition-all duration-300 rounded overflow-hidden ${
                        isMenuOpen ? '!max-h-screen !pt-4 !pb-6 !px-4' : '!max-h-0'
                    }`}
                    style={{ transition: 'max-height 0.3s ease' }}
                >
                    {navItems.map((item, idx) => (
                        <li key={idx}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium block ${
                                        isActive ? '!text-red-500 -translate-y-0.5' : ''
                                    }`
                                }
                                onClick={toggleMenu}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </header>
    );
};

export default Navbar;

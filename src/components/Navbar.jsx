import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import tmdbApi from '../service/tmdbApi';
import logo from '../assets/logo_title.png';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaPlus, FaClockRotateLeft, FaUser, FaRightFromBracket } from 'react-icons/fa6';

// Hàm lấy tên viết tắt
const getInitials = (name) => {
    if (!name) return 'NN';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
};

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Đăng xuất
    const handleSignOut = async () => {
        try {
            await logout();
            setIsDropdownOpen(false);
            setIsMenuOpen(false);
            navigate('/login');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error.message);
            setError('Không thể đăng xuất. Vui lòng thử lại.');
        }
    };

    // Lấy gợi ý tìm kiếm từ TMDB
    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await tmdbApi.searchContent(query, 'multi', 1);
            const results = response.results || [];
            const filteredSuggestions = results
                .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
                .slice(0, 5)
                .map((item) => ({
                    id: item.id,
                    title: item.title || item.name,
                    media_type: item.media_type,
                    poster_path: item.poster_path,
                }));
            setSuggestions(filteredSuggestions);
        } catch (error) {
            console.error('Lỗi lấy gợi ý tìm kiếm:', error);
            setSuggestions([]);
            setError('Không thể tải gợi ý tìm kiếm. Vui lòng kiểm tra kết nối.');
        }
    };

    const debouncedFetchSuggestions = useMemo(() => debounce((query) => fetchSuggestions(query), 300), []);

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 50);
    }, []);

    const handleResize = useCallback(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (!mobile) {
            setIsSearchOpen(false);
            setIsMenuOpen(false);
            setSuggestions([]);
            setIsDropdownOpen(false);
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

    useEffect(() => {
        return () => {
            debouncedFetchSuggestions.cancel();
        };
    }, [debouncedFetchSuggestions]);

    const headerClass = useMemo(() => (isScrolled ? '!bg-black shadow-lg' : '!bg-black/0'), [isScrolled]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setSuggestions([]);
        setIsDropdownOpen(false);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        setSuggestions([]);
        setIsDropdownOpen(false);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedFetchSuggestions(query);
    };

    const handleSearch = (query = searchQuery) => {
        if (query.trim() === '') {
            alert('Vui lòng nhập từ khóa tìm kiếm!');
            return;
        }
        navigate(`/search?query=${encodeURIComponent(query)}`);
        setSearchQuery('');
        setSuggestions([]);
        setIsSearchOpen(false);
        if (isMenuOpen) toggleMenu();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery('');
        setSuggestions([]);
        setIsSearchOpen(false);
        if (isMenuOpen) toggleMenu();
        navigate(`/phim/${suggestion.id}?type=${suggestion.media_type}`, {
            state: { media_type: suggestion.media_type },
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsDropdownOpen(false);
        navigate(`/user?tab=${tab}`);
    };

    const navItems = [
        { to: '/', label: <i className="fa-solid fa-house" />, exact: true },
        { to: '/phim-moi', label: 'Phim mới' },
        { to: '/phim-le', label: 'Phim lẻ' },
        { to: '/tv-shows', label: 'TV Shows' },
    ];

    // Hiển thị lỗi nếu có
    if (error) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
                {error}
            </div>
        );
    }

    return (
        <header
            className={`fixed !top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out ${headerClass}`}
        >
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto !px-4 sm:!px-6 md:!px-8 !mt-2">
                <div className="flex items-center gap-2">
                    {isMobile && (
                        <button className="block text-white text-2xl cursor-pointer !px-2" onClick={toggleMenu}>
                            <i className={isMenuOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'}></i>
                        </button>
                    )}
                    <NavLink to="/" className="h-[40px] !ml-5">
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
                                        `text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium ${isActive ? '!text-red-500 -translate-y-0.5' : ''
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
                        <div className="relative w-56 group">
                            <input
                                type="text"
                                className="w-full !py-2 !pl-10 !pr-4 text-white bg-white/10 border border-white/30 rounded-full outline-none transition-all duration-300 ease-in-out focus:w-64 focus:bg-white/20 focus:text-gray focus:border-white group-hover:bg-white/20"
                                placeholder="Tìm kiếm phim..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                aria-label="Tìm kiếm phim"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center !pl-3">
                                <i
                                    className="fa-solid fa-magnifying-glass text-white/70 cursor-pointer hover:!text-red-500"
                                    onClick={() => handleSearch()}
                                ></i>
                            </div>
                            {suggestions.length > 0 && (
                                <ul className="absolute top-full left-0 w-[400px] bg-black/90 rounded-md !mt-1 max-h-72 overflow-y-auto z-50 shadow-lg">
                                    {suggestions.map((suggestion, idx) => (
                                        <li
                                            key={`${suggestion.id}-${idx}`}
                                            className="flex items-center !px-3 !py-3 text-white text-base hover:bg-white/20 cursor-pointer"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`}
                                                    alt={suggestion.title}
                                                    className="w-12 h-18 object-cover rounded-md !mr-4 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-18 bg-gray-700 rounded-md !mr-4 flex items-center justify-center text-sm text-gray-400 flex-shrink-0">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold truncate">{suggestion.title}</p>
                                                <p className="text-xs text-gray-400">
                                                    ({suggestion.media_type === 'movie' ? 'Phim lẻ' : 'Phim bộ'})
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="relative flex items-center text-white">
                            <i className="fa-solid fa-magnifying-glass text-xl cursor-pointer" onClick={toggleSearch}></i>
                            {isSearchOpen && (
                                <div className="absolute top-full right-0 !mt-2 w-56 group">
                                    <input
                                        type="text"
                                        className="w-full !py-2 !pl-10 !pr-4 text-white bg-white/10 border border-white/30 rounded-full outline-none transition-all duration-300 ease-in-out focus:w-64 focus:bg-white/20 focus:text-gray focus:border-white group-hover:bg-white/20"
                                        placeholder="Tìm kiếm phim..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyPress={handleKeyPress}
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 left-0 flex items-center !pl-3">
                                        <i
                                            className="fa-solid fa-magnifying-glass text-white/70 cursor-pointer hover:!text-red-500"
                                            onClick={() => handleSearch()}
                                        ></i>
                                    </div>
                                    {suggestions.length > 0 && (
                                        <ul className="absolute top-full left-0 w-full bg-black/90 rounded-md !mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                                            {suggestions.map((suggestion, idx) => (
                                                <li
                                                    key={`${suggestion.id}-${idx}`}
                                                    className="flex items-center !px-4 !py-2 text-white hover:bg-white/20 cursor-pointer"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                >
                                                    {suggestion.poster_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`}
                                                            alt={suggestion.title}
                                                            className="w-10 h-14 object-cover rounded-md !mr-3 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-14 bg-gray-700 rounded-md !mr-3 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium truncate">{suggestion.title}</p>
                                                        <p className="text-xs text-gray-400">
                                                            ({suggestion.media_type === 'movie' ? 'Phim lẻ' : 'Phim bộ'})
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {user ? (
                        <div className="relative !ml-7">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative inline-flex items-center justify-center w-10 h-10 cursor-pointer overflow-hidden bg-gray-600 rounded-full"
                                aria-label="User menu"
                            >
                                <span className="font-medium text-gray-300">{getInitials(user.name)}</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 !mt-2 w-44 bg-gray-700 rounded-lg shadow-sm z-50 divide-y divide-gray-600">
                                    <div className="!px-4 !py-3 text-sm text-white">
                                        <div>{user.name || 'Người dùng'}</div>
                                        <div className="font-medium truncate">{user.email}</div>
                                    </div>
                                    <ul className="!py-2 text-sm text-gray-200" aria-labelledby="avatarButton">
                                        <li>
                                            <button
                                                onClick={() => handleTabChange('profile')}
                                                className="flex items-center cursor-pointer !px-4 !py-2 hover:bg-gray-600 hover:text-white w-full text-left"
                                            >
                                                <FaUser className="!mr-2" />
                                                Tài khoản
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleTabChange('favorites')}
                                                className="flex items-center cursor-pointer !px-4 !py-2 hover:bg-gray-600 hover:text-white w-full text-left"
                                            >
                                                <FaHeart className="!mr-2" />
                                                Yêu thích
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleTabChange('playlist')}
                                                className="flex items-center cursor-pointer !px-4 !py-2 hover:bg-gray-600 hover:text-white w-full text-left"
                                            >
                                                <FaPlus className="!mr-2" />
                                                Danh sách
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleTabChange('history')}
                                                className="flex items-center cursor-pointer !px-4 !py-2 hover:bg-gray-600 hover:text-white w-full text-left"
                                            >
                                                <FaClockRotateLeft className="!mr-2" />
                                                Xem tiếp
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="!py-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full text-left !px-4 !py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white cursor-pointer"
                                        >
                                            <FaRightFromBracket className="!mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold !py-1.5 !px-3 !ml-7 rounded-md text-sm shadow-md hover:shadow-lg transition"
                        >
                            Đăng nhập
                        </NavLink>
                    )}
                </div>
            </div>

            {isMobile && (
                <ul
                    className={`flex-col list-none w-full bg-black/90 transition-all duration-300 rounded overflow-hidden ${isMenuOpen ? 'max-h-screen !pt-4 !pb-6 !px-4' : 'max-h-0'
                        }`}
                    style={{ transition: 'max-height 0.3s ease' }}
                >
                    {navItems.map((item, idx) => (
                        <li key={idx}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium block ${isActive ? '!text-red-500 -translate-y-0.5' : ''
                                    }`
                                }
                                onClick={toggleMenu}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                    {user && (
                        <>
                            <li>
                                <button
                                    onClick={() => {
                                        handleTabChange('profile');
                                        toggleMenu();
                                    }}
                                    className="flex items-center text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium w-full text-left"
                                >
                                    <FaUser className="mr-2" />
                                    Tài khoản
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        handleTabChange('favorites');
                                        toggleMenu();
                                    }}
                                    className="flex items-center text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium w-full text-left"
                                >
                                    <FaHeart className="mr-2" />
                                    Yêu thích
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        handleTabChange('playlist');
                                        toggleMenu();
                                    }}
                                    className="flex items-center text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium w-full text-left"
                                >
                                    <FaPlus className="mr-2" />
                                    Danh sách
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        handleTabChange('history');
                                        toggleMenu();
                                    }}
                                    className="flex items-center text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium w-full text-left"
                                >
                                    <FaClockRotateLeft className="mr-2" />
                                    Xem tiếp
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center text-white hover:!text-red-500 hover:-translate-y-0.5 duration-200 ease-in-out !px-4 !py-2 text-[15px] font-medium w-full text-left"
                                >
                                    <FaRightFromBracket className="mr-2" />
                                    Đăng xuất
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            )}
        </header>
    );
};

export default Navbar;
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import tmdbApi from '../service/tmdbApi';

const SingleMovie = () => {
    const [movies, setMovies] = useState([]);
    const [moviePage, setMoviePage] = useState(1);
    const [movieTotalPages, setMovieTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([{ code: '', name: 'Tất cả' }]);
    const [filters, setFilters] = useState({
        genreId: '',
        country: '',
        year: '',
        ageRating: '',
    });

    // Predefined lists for filters
    const years = [
        { value: '', name: 'Tất cả' },
        ...Array.from({ length: 2026 - 1980 }, (_, i) => ({
            value: (2025 - i).toString(),
            name: (2025 - i).toString(),
        })),
    ];

    const ageRatings = [
        { value: '', name: 'Tất cả' },
        { value: 'G', name: 'G (Mọi lứa tuổi)' },
        { value: 'PG', name: 'PG (Cần hướng dẫn phụ huynh)' },
        { value: 'PG-13', name: 'PG-13 (13+)' },
        { value: 'R', name: 'R (17+)' },
        { value: 'NC-17', name: 'NC-17 (18+)' },
    ];

    // Fetch genres, countries, and movies
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch genres
                const genreData = await tmdbApi.getMovieGenres();
                setGenres([{ id: '', name: 'Tất cả' }, ...genreData]);

                // Fetch countries
                const countryData = await tmdbApi.getCountries();
                setCountries([
                    { code: '', name: 'Tất cả' },
                    ...countryData.map((c) => ({
                        code: c.iso_3166_1,
                        name: c.native_name || c.english_name,
                    })),
                ]);

                // Fetch movies with filters
                const movieData = await tmdbApi.getFilteredMovies(moviePage, filters);
                setMovies(movieData.results || []);
                setMovieTotalPages(Math.min(movieData.total_pages || 1, 500));
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [moviePage, filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= movieTotalPages) {
            setMoviePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setMoviePage(1); // Reset to page 1 when filters change
    };

    const handleResetFilters = () => {
        setFilters({
            genreId: '',
            country: '',
            year: '',
            ageRating: '',
        });
        setMoviePage(1); // Reset to page 1
    };

    const renderPagination = () => {
        const maxPagesToShow = 5;
        const pages = [];
        const startPage = Math.max(1, moviePage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(movieTotalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`!px-4 !py-2 rounded ${
                        moviePage === i
                            ? 'bg-red-500 text-white cursor-pointer'
                            : 'bg-gray-700 text-white hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex justify-center !mt-8 gap-2">
                <button
                    onClick={() => handlePageChange(moviePage - 1)}
                    disabled={moviePage === 1}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${
                        moviePage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang trước
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="!px-4 !py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="!px-4 !py-2 text-white">...</span>}
                    </>
                )}

                {pages}

                {endPage < movieTotalPages && (
                    <>
                        {endPage < movieTotalPages - 1 && <span className="!px-4 !py-2 text-white">...</span>}
                        <button
                            onClick={() => handlePageChange(movieTotalPages)}
                            className="!px-4 !py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            {movieTotalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(moviePage + 1)}
                    disabled={moviePage === movieTotalPages}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${
                        moviePage === movieTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang sau
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen !pb-2 !pt-24 !px-4 sm:!px-6 md:!px-8 bg-[#141414] text-white">
            <h1 className="text-2xl font-bold !mb-6">Phim Lẻ</h1>

            {/* Filter Controls */}
            <div className="!mb-6 flex flex-wrap gap-4 items-center">
                <div>
                    <label htmlFor="genre-filter" className="text-sm text-white/80 !mr-2">
                        Thể loại:
                    </label>
                    <select
                        id="genre-filter"
                        value={filters.genreId}
                        onChange={(e) => handleFilterChange('genreId', e.target.value)}
                        className="bg-gray-700 text-white !px-4 !py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                        {genres.map((genre) => (
                            <option key={genre.id || 'all'} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="country-filter" className="text-sm text-white/80 !mr-2">
                        Quốc gia:
                    </label>
                    <select
                        id="country-filter"
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                        className="bg-gray-700 text-white !px-4 !py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                        {/* Giữ "Tất cả" ở đầu, sắp xếp các quốc gia khác theo alphabet */}
                        <option key="all" value="">
                            Tất cả
                        </option>
                        {countries
                            .filter((country) => country.code !== '') // Loại bỏ "Tất cả" khỏi danh sách sắp xếp
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sắp xếp theo alphabet
                            .map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="year-filter" className="text-sm text-white/80 !mr-2">
                        Năm phát hành:
                    </label>
                    <select
                        id="year-filter"
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="bg-gray-700 text-white !px-4 !py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                        {years.map((year) => (
                            <option key={year.value || 'all'} value={year.value}>
                                {year.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="age-rating-filter" className="text-sm text-white/80 !mr-2">
                        Lứa tuổi:
                    </label>
                    <select
                        id="age-rating-filter"
                        value={filters.ageRating}
                        onChange={(e) => handleFilterChange('ageRating', e.target.value)}
                        className="bg-gray-700 text-white !px-4 !py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                        {ageRatings.map((rating) => (
                            <option key={rating.value || 'all'} value={rating.value}>
                                {rating.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleResetFilters}
                    className="bg-red-500 text-white !px-4 !py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                    Xóa bộ lọc
                </button>
            </div>

            {error ? (
                <p className="text-white/80 text-base !mt-4">{error}</p>
            ) : loading ? (
                <div className="text-center text-lg text-white/80 animate-pulse">Đang tải...</div>
            ) : movies.length > 0 ? (
                <>
                    <p className="text-white/80 text-sm !mb-4">
                        Hiển thị {movies.length} phim lẻ
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:!grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                            >
                                <NavLink to={`/phim/${movie.id}?type=movie`}>
                                    <div className="relative">
                                        <img
                                            src={
                                                movie.poster_path
                                                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                                    : "https://via.placeholder.com/300x450?text=No+Image"
                                            }
                                            alt={movie.title}
                                            className="w-full h-auto object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="p-2 text-center">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-red-500 transition duration-300">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-white/80 !mt-1">
                                            Phát hành: {movie.release_date || "Chưa có thông tin"}
                                        </p>
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>

                    {movieTotalPages > 1 && renderPagination()}
                </>
            ) : (
                <p className="text-white/80 text-base !mt-4">
                    Không tìm thấy phim lẻ nào cho bộ lọc đã chọn.
                </p>
            )}
        </div>
    );
};

export default SingleMovie;